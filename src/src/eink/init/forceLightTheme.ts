// Einkgram — Force light theme (v0.9)
//
// Upstream Telegram has a dark mode that's beautiful on
// RGB/LCD screens but useless on E-Ink: dark text on a
// light panel is what E-Ink does best, and inverting the
// palette inverts the panel's strengths (16-gray ramp is
// designed for dark-on-light rendering).
//
// To make Einkgram always use light mode (regardless of
// system preference, regardless of upstream's settings
// persistence, regardless of what the user toggles in
// Settings → General), this module:
//
//   1. On init, removes the `theme-dark` class from
//      <html> and adds `theme-light`.
//   2. Installs a MutationObserver that re-applies this
//      change if upstream ever re-adds `theme-dark`.
//   3. Also sets `color-scheme: light` on <html> so form
//      controls, scrollbars, and default input/select
//      colors stay light.
//
// The MutationObserver runs only on attribute changes to
// <html> and is debounced via rAF, so it costs essentially
// nothing when nothing is changing.
//
// This is a green-zone file: it never modifies upstream
// code, only observes and overrides its effects on
// <html> via DOM APIs.

let observer: MutationObserver | null = null;

function forceLight() {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (html.classList.contains('theme-dark')) {
    html.classList.remove('theme-dark');
  }
  if (!html.classList.contains('theme-light')) {
    html.classList.add('theme-light');
  }
  // color-scheme: light makes form controls, scrollbars,
  // and <input type="date"> default to light colors.
  // Upstream sets `color-scheme: dark` on html.theme-dark;
  // we override that.
  html.style.colorScheme = 'light';
}

function onChange() {
  // rAF debounce: batch multiple mutations into one update.
  requestAnimationFrame(forceLight);
}

export function installForceLightTheme(): void {
  // 1. Apply immediately.
  forceLight();

  // 2. Watch for upstream re-adding theme-dark.
  if (observer) return;
  observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

export function uninstallForceLightTheme(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
