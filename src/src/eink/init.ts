// Einkgram — Bootstrap module (v0.2)
//
// Runs on page load. Applies the saved E-Ink mode to <html>
// (no FOUC), registers the Ctrl/Cmd+Shift+E shortcut, and
// exposes a tiny `window.__eink` API for ad-hoc toggling.
//
// Imported as a side-effect module in index.html:
//   <script type="module" src="./src/eink/init.ts"></script>
//
// Green zone: no upstream code touched.

import { useEinkMode, type EinkMode } from './useEinkMode';

function applyInitialMode() {
  // Read storage and apply BEFORE React mounts to avoid FOUC.
  // Mirrors useEinkMode's readStoredMode so they're consistent.
  let mode: EinkMode = 'standard';
  try {
    const v = localStorage.getItem('eink-mode');
    if (v === 'off' || v === 'standard' || v === '1bit' || v === 'paper') {
      mode = v;
    }
  } catch {
    // ignore
  }
  const html = document.documentElement;
  html.classList.toggle('eink-mode', mode !== 'off');
  html.classList.toggle('eink-1bit', mode === '1bit');
  html.classList.toggle('eink-paper', mode === 'paper');
}

function registerShortcut() {
  // We can't use the hook here (not a component), so we
  // re-implement the cycle logic against the DOM directly.
  const order: EinkMode[] = ['standard', '1bit', 'paper', 'off'];
  function currentFromDom(): EinkMode {
    const html = document.documentElement;
    if (html.classList.contains('eink-1bit')) return '1bit';
    if (html.classList.contains('eink-paper')) return 'paper';
    if (html.classList.contains('eink-mode')) return 'standard';
    return 'off';
  }
  function setMode(mode: EinkMode) {
    const html = document.documentElement;
    html.classList.toggle('eink-mode', mode !== 'off');
    html.classList.toggle('eink-1bit', mode === '1bit');
    html.classList.toggle('eink-paper', mode === 'paper');
    try {
      localStorage.setItem('eink-mode', mode);
    } catch {
      // ignore
    }
  }
  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      const cur = currentFromDom();
      const idx = order.indexOf(cur);
      setMode(order[(idx + 1) % order.length]);
    }
  });
  return { setMode, currentFromDom, order };
}

function exposeDevApi(api: ReturnType<typeof registerShortcut>) {
  (window as unknown as { __eink?: unknown }).__eink = {
    cycle: () => {
      const cur = api.currentFromDom();
      const idx = api.order.indexOf(cur);
      api.setMode(api.order[(idx + 1) % api.order.length]);
    },
    set: (m: EinkMode) => api.setMode(m),
    current: () => api.currentFromDom(),
  };
}

// Run before React mounts. We rely on the script being a
// side-effect module so this top-level code runs on parse.
applyInitialMode();
const shortcutApi = registerShortcut();
exposeDevApi(shortcutApi);

// Touch the import so tree-shakers don't drop it.
// This is a no-op for the hook itself; we only need it to
// be available for any future component that wants it.
void useEinkMode;
