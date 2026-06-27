// Einkgram — Bootstrap module (v0.2 → v0.4.2)
//
// Runs on page load. Applies the saved E-Ink mode to <html>
// (no FOUC), registers the Ctrl/Cmd+Shift+E shortcut, and
// exposes a tiny `window.__eink` API for ad-hoc toggling.
//
// v0.4.2 additions:
//   - Mounts PageScrollButtons into a body-level <div> via
//     React's createRoot. This keeps the component completely
//     out of the upstream React tree (zero red-zone edits).
//   - Also injects the SCSS for the buttons as a <link> tag
//     pointing to a CSS module Vite serves at runtime.
//
// Imported as a side-effect module in index.html:
//   <script type="module" src="./src/eink/init.ts"></script>
//
// Green zone: no upstream code touched.

import { useEinkMode, type EinkMode } from './useEinkMode';
import { installAutoProcessor } from './autoProcess';
import { getActivePanel, setActivePanel, type PanelType } from './panels';

// ─────────────────────────────────────────────────────────
// v0.5.2: PWA manifest injection
//
// We don't touch the upstream `site.webmanifest` (which would
// require a red-zone edit to vite.config.ts and a fresh icon
// set in public/). Instead, we add a SECOND <link rel="manifest">
// from JS that the browser will pick up for install prompts.
// This is a real PWA install — the user can "Install Einkgram"
// from their browser's address bar.
// ─────────────────────────────────────────────────────────

function installPwaManifest() {
  // Don't override the upstream manifest if it's already there
  // (some users may have cached a version we don't want to break).
  if (document.querySelector('link[rel="manifest"][data-einkgram="1"]')) return;

  // Theme color: pure white background, black ink. Matches the
  // E-Ink aesthetic and shows up in the Android system tray.
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = '#FFFFFF';
  meta.dataset.einkgram = '1';
  document.head.appendChild(meta);

  // Apple-specific: status bar style. 'default' shows black text
  // on white, perfect for E-Ink.
  const appleMeta = document.createElement('meta');
  appleMeta.name = 'apple-mobile-web-app-status-bar-style';
  appleMeta.content = 'default';
  appleMeta.dataset.einkgram = '1';
  document.head.appendChild(appleMeta);

  // Apple touch icon: we point to the existing upstream icon
  // (saves us from creating 4 different size PNG files).
  // Real Einkgram icons would be in public/einkgram-icon-*.png.
  const appleIcon = document.createElement('link');
  appleIcon.rel = 'apple-touch-icon';
  appleIcon.href = './apple-touch-icon.png';
  appleIcon.dataset.einkgram = '1';
  document.head.appendChild(appleIcon);

  // PWA manifest: Einkgram-specific, in public/.
  const manifest = document.createElement('link');
  manifest.rel = 'manifest';
  manifest.href = './einkgram.webmanifest';
  manifest.dataset.einkgram = '1';
  document.head.appendChild(manifest);

  // Expose install state for the Settings UI later.
  window.addEventListener('appinstalled', () => {
    console.info('[Einkgram] PWA installed');
  });
}

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
    // v0.5: panel control (paired with autoProcess.ts)
    setPanel: (p: PanelType) => {
      setActivePanel(p);
      return (window as any).__eink.reprocessImages(p);
    },
    activePanel: () => getActivePanel(),
  };
}

// ─────────────────────────────────────────────────────────
// v0.4.2: Mount PageScrollButtons via createRoot into a
// dedicated <div> in <body>. The div is owned by us; upstream
// React never sees it, so this is green zone.
// ─────────────────────────────────────────────────────────

function ensureStylesheet(href: string, id: string): void {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

async function mountPageScrollButtons() {
  // Don't mount if there's no body yet (early-script edge case)
  if (!document.body) return;

  // Inject SCSS as a stylesheet (Vite serves it from /src/)
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

  // Wait for React to be available, then mount.
  // React is exported by upstream's main bundle. We dynamically
  // import the PageScrollButtons component (which pulls in React
  // and teact transitively through Vite's import graph).
  const PageScrollButtonsModule = await import('./PageScrollButtons');
  const PageScrollButtons = PageScrollButtonsModule.default as () => unknown;
  const TeactDOM = (await import('../lib/teact/teact-dom')).default;

  // teact uses imperative render (not createRoot like React 18).
  // TeactDOM.render($component, parentEl) re-renders into parentEl.
  // We cast to `any` here because teact's render() signature is
  // complex and we know our component returns a valid VirtualElement.
  // deno-lint-ignore no-explicit-any
  TeactDOM.render(PageScrollButtons() as any, host);
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

// Mount the page-scroll buttons after DOMContentLoaded so that
// document.body is guaranteed to exist. We use the 'load' event
// to wait for React's main bundle too (Vite splits the chunks).
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('load', () => void mountPageScrollButtons());
  });
} else {
  window.addEventListener('load', () => void mountPageScrollButtons());
}

// ─────────────────────────────────────────────────────────
// v0.5: Install the auto image processor.
//
// This runs alongside everything else and watches for new
// <img> elements appearing in the DOM (chat switches, infinite
// scroll). It applies panel-aware dithering in place.
// ─────────────────────────────────────────────────────────

function installImageProcessor() {
  // Make sure the active panel CSS property is in sync with
  // whatever the user has stored. This is what panels.ts reads
  // when the image processor dispatches to an algorithm.
  const panel = getActivePanel();
  document.documentElement.style.setProperty('--eink-panel-type', panel);

  // Install the global observer.
  installAutoProcessor();

  // Expose panel control on the dev API.
  const api = (window as unknown as { __eink: Record<string, unknown> }).__eink;
  api.setPanel = (p: PanelType) => {
    setActivePanel(p);
    return (api.reprocessImages as (p: PanelType) => Promise<number>)(p);
  };
  api.getPanel = () => getActivePanel();
  api.allPanels = () => ['1bit', '4gray', '16gray', '256gray', 'color-4096', 'color-30000'];
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installImageProcessor);
} else {
  installImageProcessor();
}

// PWA manifest: install ASAP so the browser picks it up
// before the page even renders.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installPwaManifest);
} else {
  installPwaManifest();
}
