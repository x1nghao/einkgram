// Einkgram — Page scroll buttons mount (extracted from init.ts in v0.5.4)
//
// Mounts the PageScrollButtons component into a fixed-position
// host div in <body>, outside of React's tree. This lets us
// add a global UI control without touching the upstream
// component tree.

function ensureStylesheet(href: string, id: string): void {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export async function mountPageScrollButtons(): Promise<void> {
  // Don't mount if there's no body yet (early-script edge case)
  if (!document.body) return;

  // Inject SCSS as a stylesheet (Vite serves it from /src/).
  // In production build, this is a code-split CSS chunk.
  // The id is namespaced so re-running mount() is safe.
  ensureStylesheet(
    '/src/eink/PageScrollButtons.scss?direct',
    'eink-page-scroll-styles',
  );

  // Create the host div
  const host = document.createElement('div');
  host.id = 'eink-page-scroll-host';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;';
  document.body.appendChild(host);

  // Dynamically import the PageScrollButtons component (which pulls
  // in React and teact transitively through Vite's import graph).
  const PageScrollButtonsModule = await import('../PageScrollButtons');
  const PageScrollButtons = PageScrollButtonsModule.default as () => unknown;
  const TeactDOM = (await import('../../lib/teact/teact-dom')).default;

  // teact uses imperative render (not createRoot like React 18).
  // TeactDOM.render($component, parentEl) re-renders into parentEl.
  // We cast to `any` here because teact's render() signature is
  // complex and we know our component returns a valid VirtualElement.
  // deno-lint-ignore no-explicit-any
  TeactDOM.render(PageScrollButtons() as any, host);
}
