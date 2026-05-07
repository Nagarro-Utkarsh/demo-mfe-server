import { createRoot, type Root } from 'react-dom/client';
import { type ComponentType, createElement } from 'react';

// Tracks active React roots by mountId so we can cleanly unmount
// before re-mounting when the same fragment is loaded again.
const roots = new Map<string, Root>();

const withHydration = <P>(Component: ComponentType<P>, mountId: string) => {
  // No-op on the server (SSR pass)
  if (typeof document === 'undefined') return Component;

  // Defer until the current script and sibling DOM nodes are fully parsed.
  // The client bundle runs at module-eval time — the mount <div> injected
  // just before the <script> tag may not yet be queryable without this defer.
  requestAnimationFrame(() => {
    const container = document.getElementById(mountId);
    if (!container) return;

    // Unmount any previous root for this mountId (fragment switch)
    const existing = roots.get(mountId);
    if (existing) {
      existing.unmount();
      roots.delete(mountId);
    }

    // Read server props from the hydration data script injected alongside
    // the mount div. Scoped by data-mount-id to support multiple fragments.
    const dataScript = document.querySelector<HTMLScriptElement>(
      `script[data-fragment-data][data-mount-id="${mountId}"]`,
    );
    const props = dataScript ? (JSON.parse(dataScript.textContent || 'null') as P) : null;

    const root = createRoot(container);
    root.render(createElement(Component, (props ?? {}) as P));

    roots.set(mountId, root);
  });

  return Component;
};

export default withHydration;
