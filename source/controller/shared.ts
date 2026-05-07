import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');

export function getFragmentPaths(name: string) {
  return {
    ssrEntry: resolve(distDir, name, 'ssr', `${name}.js`),
    cssFile: resolve(distDir, name, 'client', 'index.css'),
    clientEntry: resolve(distDir, name, 'client', 'index.js'),
  };
}

export function getMountId(name: string): string {
  const metaPath = resolve(distDir, name, 'meta.json');
  return JSON.parse(readFileSync(metaPath, 'utf-8')).mountId;
}

export function getBuildId(name: string): string {
  const metaPath = resolve(distDir, name, 'meta.json');
  return JSON.parse(readFileSync(metaPath, 'utf-8')).buildId;
}

export async function loadFragment(name: string) {
  const mountId = getMountId(name);
  const { ssrEntry, clientEntry, cssFile } = getFragmentPaths(name);
  const mod = await import(pathToFileURL(ssrEntry).href);
  const Component = mod.default as React.FC;
  const css = existsSync(cssFile) ? readFileSync(cssFile, 'utf-8') : '';
  return {
    mountId,
    css,
    clientEntry,
    cssFile,
    Component,
    getServerData: mod.getServerData,
  };
}
