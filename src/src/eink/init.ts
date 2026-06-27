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

// 2. Register the Ctrl+Shift+E shortcut. Returns a typed API.
const shortcutApi = registerShortcut();

// 3. Expose the dev API on window. The image processor will
//    extend it with setPanel / reprocessImages later.
exposeDevApi(shortcutApi);

// 4. Touch the React hook import so tree-shakers don't drop it.
//    (The hook is exposed for future components that want to
//    read/write the E-Ink mode.)
void useEinkMode;

// 5. PWA manifest. Install ASAP so the browser picks it up
//    before the page even renders. Async-safe; we just queue.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installPwaManifest);
} else {
  installPwaManifest();
}

// 6. Page scroll buttons. Wait for body + load to be safe.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('load', () => void mountPageScrollButtons());
  });
} else {
  window.addEventListener('load', () => void mountPageScrollButtons());
}

// 7. Image processor. Last because it depends on the panel CSS
//    variables and autoProcess.ts setting up the global API.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installImageProcessor);
} else {
  installImageProcessor();
}

// 8. Type-only re-exports for callers that need them.
export type { EinkMode, PanelType };
