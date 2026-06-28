// Einkgram — Bootstrap entry point (v0.11)
//
// v0.11: Stripped overlay layer. Removed:
//   - forceLightTheme.ts — upstream's theme-light mode is fine;
//     we just block dark-mode-via-media in index.html
//   - patternSuppress.ts — _patternBackground.module.scss now
//     has the eink-mode gate *in the source*
//   - mode.ts / modeApply.ts → consolidated into useEinkMode.ts
//
// What stays:
//   - Mode init (standard/1bit/paper from localStorage)
//   - Ctrl+Shift+E shortcut
//   - PWA manifest
//   - Page scroll buttons
//   - Image processor
//   - Loading screen removal
//   - Dev API (window.__eink)

import { useEinkMode } from './useEinkMode';
import { registerShortcut, type ShortcutApi } from './init/shortcut';
import { installPwaManifest } from './init/pwa';
import { mountPageScrollButtons } from './init/scrollButtons';
import { installImageProcessor } from './init/imageProcessor';
import { hideEinkLoader } from './init/hideLoader';
import { applyInitialMode } from './init/mode';

import type { EinkMode } from './init/mode';
import type { PanelType } from './panels';

// Expose dev API. Single source of truth for window.__eink.
function exposeDevApi(shortcutApi: ShortcutApi) {
  const w = window as unknown as { __eink: Record<string, unknown> };
  w.__eink = {
    cycle: shortcutApi.cycle,
    set: (mode: EinkMode) => shortcutApi.setMode(mode),
    get: () => shortcutApi.currentFromDom(),
  };
}

// 1. Apply stored E-Ink mode to <html> ASAP (before first paint).
applyInitialMode();

// 2. Hide pre-React loading screen.
scheduleHideLoader();

// 3. Ctrl+Shift+E shortcut.
const shortcutApi = registerShortcut();

// 4. Expose dev API.
exposeDevApi(shortcutApi);

// 5. Touch React hook so tree-shakers don't drop it.
void useEinkMode;

// 6. PWA manifest.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installPwaManifest);
} else {
  installPwaManifest();
}

// 7. Page scroll buttons.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('load', () => void mountPageScrollButtons());
  });
} else {
  window.addEventListener('load', () => void mountPageScrollButtons());
}

// 8. Image processor — last, depends on panel CSS vars.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installImageProcessor);
} else {
  installImageProcessor();
}

// 9. Type-only re-exports.
export type { EinkMode, PanelType };

// Helper: hides the static loading screen from index.html.
function scheduleHideLoader() {
  requestAnimationFrame(hideEinkLoader);
  if (document.readyState !== 'complete') {
    window.addEventListener('load', hideEinkLoader, { once: true });
  }
}
