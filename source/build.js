import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { readdirSync, statSync, rmSync} from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fragmentsDir = resolve(__dirname, 'fragments');


// ---------------------------------------------------------------------------
// Discover fragment pages
// ---------------------------------------------------------------------------

const pages = readdirSync(fragmentsDir).filter((name) =>
  statSync(resolve(fragmentsDir, name)).isDirectory(),
);

// ---------------------------------------------------------------------------
// Clean previous output
// ---------------------------------------------------------------------------

rmSync(resolve(__dirname, 'dist'), { recursive: true, force: true });

// ---------------------------------------------------------------------------
// Generate a unique build ID
// ---------------------------------------------------------------------------

const buildId = Date.now().toString(36) + randomBytes(4).toString('hex');
console.log(`\n🔑 Build ID: ${buildId}`);

// ---------------------------------------------------------------------------
// Build each fragment
// ---------------------------------------------------------------------------

for (const page of pages) {
  console.log(`\n⚙️  Building ${page} (ssr)...`);
  execSync(`npx vite build -- --page=${page} --target=ssr --buildId=${buildId}`, {
    cwd: __dirname,
    stdio: 'inherit',
  });

  console.log(`\n🌐 Building ${page} (client)...`);
  execSync(`npx vite build -- --page=${page} --target=client --buildId=${buildId}`, {
    cwd: __dirname,
    stdio: 'inherit',
  });
}

console.log('\n✅ All pages built successfully.');
