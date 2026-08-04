// Einkgram — Bootstrap entry point (v0.16)
//
// v0.16: Simplified from 4-mode to ON/OFF toggle. Removed:
//   - Image processor (JS dithering) — driver layer handles it
//   - Panel selector — no panel types needed
//   - Ramp cache — no grayscale mapping
//
// What stays:
//   - E-Ink mode ON/OFF toggle (Ctrl+Shift+E)
//   - PWA manifest
//   - Page scroll buttons
//   - Loading screen removal
//   - Dev API (window.__eink)

import { useEinkMode } from './useEinkMode';
import { registerShortcut, type ShortcutApi } from './init/shortcut';
import { installPwaManifest } from './init/pwa';
import { mountPageScrollButtons } from './init/scrollButtons';
import { hideEinkLoader } from './init/hideLoader';
import { applyInitialMode } from './init/mode';
import { applyInitialFontWeight } from './fontWeight';
import type { EinkMode } from './init/mode';

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
applyInitialFontWeight();

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

// Type-only re-exports.
export type { EinkMode };

// Helper: hides the static loading screen from index.html.
function scheduleHideLoader() {
  requestAnimationFrame(hideEinkLoader);
  if (document.readyState !== 'complete') {
    window.addEventListener('load', hideEinkLoader, { once: true });
  }
}
