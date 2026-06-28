// Einkgram — Bootstrap entry point (v0.5.4)
//
// This file is the single side-effect module that init.ts is
// imported as. Each sub-initializer lives in init/*.ts and is
// invoked here in the right order.
//
// Why split? (review feedback v0.5.3)
//   - init.ts had grown to 258 lines, with six unrelated concerns
//   - PWA manifest was at the top, image processor at the bottom
//   - Hard to skim
//
// What stays in this file:
//   - The top-level orchestration (which init runs when)
//   - The dev API exposure (window.__eink)
//
// Each sub-initializer is independently invokable and tested.

import { useEinkMode } from './useEinkMode';

import { applyInitialMode } from './init/mode';
import { registerShortcut, type ShortcutApi } from './init/shortcut';
import { installPwaManifest } from './init/pwa';
import { mountPageScrollButtons } from './init/scrollButtons';
import { installImageProcessor } from './init/imageProcessor';
import { hideEinkLoader } from './init/hideLoader';
import { installForceLightTheme } from './init/forceLightTheme';
import { installPatternSuppress } from './init/patternSuppress';

import type { EinkMode } from './init/mode';
import type { PanelType } from './panels';

// Expose the dev API. Single source of truth for window.__eink
// so we don't have races between modules assigning to it.
function exposeDevApi(shortcutApi: ShortcutApi) {
  const w = window as unknown as { __eink: Record<string, unknown> };
  w.__eink = {
    // E-Ink mode (off / standard / 1bit / paper)
    cycle: shortcutApi.cycle,
    set: (mode: EinkMode) => shortcutApi.setMode(mode),
    get: () => shortcutApi.currentFromDom(),

    // Image processing (added by installImageProcessor in init phase)
    // setPanel / getPanel / reprocessImages / allPanels are added
    // by installImageProcessor() once autoProcess has installed.
  };
}

// 1. Apply the stored E-Ink mode to <html> ASAP.
//    This must run before the first paint to avoid FOUC.
applyInitialMode();

// 1b. Hide the pre-React Einkgram loading screen (v0.9). The
//     screen lives in index.html and is shown from the first
//     frame; we remove it as soon as React has had a chance to
//     mount. We use rAF + window.load as a belt-and-suspenders
//     approach so the screen hides whether the React mount is
//     fast (cached bundle) or slow (cold load).
scheduleHideLoader();

// 1c. Force light theme (v0.9). Einkgram is light-mode only.
//     Installs a MutationObserver on <html> so upstream's
//     theme switch (whether from settings, system theme change,
//     or initial sync) gets reverted immediately.
installForceLightTheme();

// 2. Suppress the colorful pattern background (v0.9.2).
//    CSS Modules hash the class name at build time, so we
//    use a runtime DOM scan instead of a static CSS selector.
installPatternSuppress();

// 3. Register the Ctrl+Shift+E shortcut. Returns a typed API.
const shortcutApi = registerShortcut();

// 4. Expose the dev API on window. The image processor will
//    extend it with setPanel / reprocessImages later.
exposeDevApi(shortcutApi);

// 5. Touch the React hook import so tree-shakers don't drop it.
//    (The hook is exposed for future components that want to
//    read/write the E-Ink mode.)
void useEinkMode;

// 6. PWA manifest. Install ASAP so the browser picks it up
//    before the page even renders. Async-safe; we just queue.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installPwaManifest);
} else {
  installPwaManifest();
}

// 7. Page scroll buttons. Wait for body + load to be safe.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('load', () => void mountPageScrollButtons());
  });
} else {
  window.addEventListener('load', () => void mountPageScrollButtons());
}

// 8. Image processor. Last because it depends on the panel CSS
//    variables and autoProcess.ts setting up the global API.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installImageProcessor);
} else {
  installImageProcessor();
}

// 9. Type-only re-exports for callers that need them.
export type { EinkMode, PanelType };

// 10. Helper for step 1b above. Hides the static loading screen
//    on the next animation frame and again on `window.load`.
//    Both are safe: the second call is a no-op if the element
//    is already gone.
function scheduleHideLoader() {
  requestAnimationFrame(hideEinkLoader);
  if (document.readyState !== 'complete') {
    window.addEventListener('load', hideEinkLoader, { once: true });
  }
}
