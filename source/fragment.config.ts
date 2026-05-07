import { RenderMode } from './types.js';
import type { FragmentConfig } from './types.js';

// The fragment that loads automatically when the dev server opens.
// Must match one of the "name" values in the fragments array below.
export const defaultFragment = 'DemoFragment';

// Register every fragment here.
// Each entry maps to a directory under fragments/<name>/.
export const fragments: FragmentConfig[] = [

  {
    name: 'DemoFragment',
    label: 'Demo fragment',
    description: 'A demo fragment to show mfe architecture',
    defaultMode: RenderMode.SSR,
  },
  // Add new fragments below:
  // { name: 'YourFragment', label: 'Your Fragment', description: '...', defaultMode: 'ssr' },
];
