import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDefinition = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  'process.env': JSON.stringify({ NODE_ENV: process.env.NODE_ENV ?? 'production' }),
  process: JSON.stringify({ env: { NODE_ENV: process.env.NODE_ENV ?? 'production' } }),
};

// ---------------------------------------------------------------------------
// Parse CLI arguments
// ---------------------------------------------------------------------------

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];

const page = arg('page');
const target = arg('target');
const buildId = arg('buildId');

// ---------------------------------------------------------------------------
// Derived flags
// ---------------------------------------------------------------------------

const isSSR = target === 'ssr';

/**
 * Packages that must remain external in the SSR bundle because they rely on
 * Node built-ins or are incompatible with Vite's SSR bundling.
 */
const ssrExternalPkgs = ['jsdom', 'isomorphic-dompurify'];

/**
 * React packages are always externalised in the SSR bundle so the server uses
 * a single shared React instance (avoids "multiple React copies" errors).
 */
const reactPkgs = new Set([
  'react',
  'react-dom',
  'react-dom/server',
  'react-dom/client',
  'react/jsx-runtime',
]);

// ---------------------------------------------------------------------------
// Rollup external helpers
// ---------------------------------------------------------------------------

/** Returns true for bare module specifiers (not relative or virtual). */
const isBare = (id) => !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0');

/**
 * Extracts the npm package name from a module specifier, handling scoped
 * packages (e.g. `@scope/pkg/sub` → `@scope/pkg`).
 */
const getPkgName = (id) =>
  id.startsWith('@') ? id.split('/').slice(0, 2).join('/') : id.split('/')[0];

// ---------------------------------------------------------------------------
// Custom Vite plugin: strip-server-modules
// ---------------------------------------------------------------------------

const stripServerModulesPlugin = () => ({
  name: 'strip-server-modules',
  enforce: 'pre',
  resolveId(source) {
    if (isSSR) return null;
    if (/\.server(\.(ts|js|tsx|jsx))?$/.test(source)) {
      return '\0empty-server-module';
    }
    return null;
  },
  load(id) {
    if (id === '\0empty-server-module') {
      return 'export default undefined; export const getServerData = undefined;';
    }
    return null;
  },
});

// ---------------------------------------------------------------------------
// Custom Vite plugin: meta-json
// ---------------------------------------------------------------------------

const metaJsonPlugin = () => ({
  name: 'meta-json',
  closeBundle() {
    // Only run after the SSR pass so meta.json is written once.
    if (!isSSR) return;

    const sourceEntry = resolve(__dirname, `fragments/${page}/${page}.tsx`);
    if (!existsSync(sourceEntry)) return;

    const code = readFileSync(sourceEntry, 'utf-8');

    // Extract the exported `mountId` constant value from source.
    const match = code.match(/export\s+const\s+mountId\s*=\s*['"]([^'"]+)['"]/);
    const mountId = match
      ? match[1]
      : (page || '').replace(/([A-Z]+)/g, (m, _p, i) => (i ? '-' : '') + m.toLowerCase());

    const metaDir = resolve(__dirname, `dist/${page}`);
    mkdirSync(metaDir, { recursive: true });
    const metaPath = resolve(metaDir, 'meta.json');
    writeFileSync(metaPath, JSON.stringify({ mountId, buildId }, null, 2));

    console.log(
      `[meta-json] Written dist/${page}/meta.json → mountId: "${mountId}", buildId: "${buildId}"`,
    );
  },
});

// ---------------------------------------------------------------------------
// Vite configuration
// ---------------------------------------------------------------------------

export default defineConfig({
  plugins: [react(), stripServerModulesPlugin(), metaJsonPlugin()],

  ssr: {
    noExternal: isSSR ? [/./] : [],
    external: isSSR ? ssrExternalPkgs : [],
  },
  css: {
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: '[local]_[hash:base64:5]',
    },
  },

  define: isSSR ? {} : defaultDefinition,

  build: {
    ssr: isSSR,
    cssCodeSplit: false,
    outDir: resolve(__dirname, `dist/${page}/${target}`),

    lib: {
      formats: ['es'],
      fileName: isSSR ? page : 'index',
      entry: resolve(__dirname, `fragments/${page}/${page}.tsx`),
    },

    rollupOptions: {
      external(id) {
        if (!isBare(id)) return false;

        if (isSSR) {
          if (reactPkgs.has(id)) return true;
          return ssrExternalPkgs.includes(getPkgName(id));
        }

        return !existsSync(resolve(__dirname, 'node_modules', getPkgName(id)));
      },

      output: {
        inlineDynamicImports: true,
        assetFileNames: '[name][extname]',
        entryFileNames: isSSR ? `${page}.js` : 'index.js',
      },
    },
  },
});
