// Einkgram — Page scroll buttons mount (v0.7 audit fix)
//
// v0.7 changes (review audit):
//   - PageScrollButtons is rendered as a VNode
//     (Teact.createElement(PageScrollButtons)) instead of being
//     called as a function. The function-call form
//     (`PageScrollButtons()`) bypasses Teact's reconciler, so
//     hooks (useState, useEffect) ran in the wrong context —
//     every re-render produced a fresh component instance with
//     reset state.
//   - SCSS is no longer fetched via `/src/eink/PageScrollButtons.scss?direct`
//     at runtime. The `?direct` query only works in Vite dev; in
//     production builds the file gets a content hash and the URL
//     404s. Instead we let the bundler handle the import: the SCSS
//     file is imported once at module load by `PageScrollButtons.tsx`,
//     and Vite includes it in the production CSS bundle automatically.
//
// Mounts the PageScrollButtons component into a fixed-position
// host div in <body>, outside of React's tree. This lets us
// add a global UI control without touching the upstream
// component tree.

import type { FC, VirtualElement } from '../../lib/teact/teact';
import { createElement } from '../../lib/teact/teact';

export async function mountPageScrollButtons(): Promise<void> {
  // Don't mount if there's no body yet (early-script edge case)
  if (!document.body) return;

  // Create the host div
  const host = document.createElement('div');
  host.id = 'eink-page-scroll-host';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;';
  document.body.appendChild(host);

  // Dynamically import the PageScrollButtons component. The SCSS
  // it transitively imports is bundled by Vite and shipped with
  // the production JS chunk — no runtime fetch needed.
  const PageScrollButtonsModule = await import('../PageScrollButtons');
  const PageScrollButtons = PageScrollButtonsModule.default as FC;
  const TeactDOM = (await import('../../lib/teact/teact-dom')).default;

  // teact uses imperative render (not createRoot like React 18).
  // TeactDOM.render(VNode, parentEl) re-renders into parentEl.
  //
  // We pass a VNode (createElement(PageScrollButtons)), not a
  // function call. The function-call form was a bug: hooks ran
  // outside the reconciler context, so the component re-mounted
  // on every re-render and useState state reset each time.
  // The cast to VirtualElement is safe: createElement with an FC
  // first arg returns a VirtualElementComponent which is a member
  // of VirtualElement; the wider return type is for the
  // Fragment/array overloads we don't use here.
  const vnode = createElement(PageScrollButtons, {}) as VirtualElement;
  TeactDOM.render(vnode, host);
}
