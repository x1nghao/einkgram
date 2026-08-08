// Einkgram — PWA manifest installer (extracted from init.ts in v0.5.4)
//
// We don't touch the upstream `site.webmanifest` (which would
// require a red-zone edit to vite.config.ts and a fresh icon
// set in public/). Instead, we add a SECOND <link rel="manifest">
// from JS that the browser will pick up for install prompts.
// This is a real PWA install — the user can "Install Einkgram"
// from their browser's address bar.

export function installPwaManifest(): void {
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

  // Register Service Worker for offline caching.
  // Only in production (dev server doesn't serve /sw.js reliably).
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(() => {
        // eslint-disable-next-line no-console
        console.info('[Einkgram] Service Worker registered');
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[Einkgram] SW registration failed:', err.message);
      });
  }

  // Expose install state for the Settings UI later.
  window.addEventListener('appinstalled', () => {
    // eslint-disable-next-line no-console
    console.info('[Einkgram] PWA installed');
  });
}
