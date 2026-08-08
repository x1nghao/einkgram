// Einkgram — Service Worker for offline caching (v0.19)
//
// A lightweight SW without Workbox dependency. Three cache strategies:
//   - App Shell (HTML/CSS/JS): stale-while-revalidate
//   - Static assets (images, fonts, icons): cache-first, 7-day TTL
//   - API requests: network-first, 3s timeout, fallback to cache
//
// Installed as a standalone file in public/sw.js, registered from
// init/pwa.ts. Does not modify vite.config.ts.
//
// Green zone: standalone file in public/, no upstream code touched.

const CACHE_VERSION = 'einkgram-v0.19';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const API_CACHE = `${CACHE_VERSION}-api`;

const API_TIMEOUT_MS = 3000;
const ASSET_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Resources that are part of the app shell (cached on install).
const SHELL_RESOURCES = [
  './',
  './index.html',
];

// Patterns for categorizing requests.
const ASSET_PATTERN = /\.(?:js|css|woff2?|ttf|png|jpg|jpeg|svg|webp|avif|ico)$/i;
const API_PATTERN = /^https:\/\/(?:api|web)\.telegram\.org\//i;

// ════════════════════════════════════════════════════════
// Install: pre-cache the app shell.
// ════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Use addAll with ignore — some resources may 404 in dev.
      await Promise.allSettled(
        SHELL_RESOURCES.map((url) => cache.add(url)),
      );
      await self.skipWaiting();
    })(),
  );
});

// ════════════════════════════════════════════════════════
// Activate: clean old caches.
// ════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

// ════════════════════════════════════════════════════════
// Fetch: route to appropriate strategy.
// ════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests that aren't Telegram API.
  const isApi = API_PATTERN.test(url.href);
  const isSameOrigin = url.origin === self.location.origin;
  if (!isApi && !isSameOrigin) return;

  // Route to strategy.
  if (isApi) {
    event.respondWith(networkFirst(request, API_CACHE, API_TIMEOUT_MS));
  } else if (ASSET_PATTERN.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE, ASSET_TTL_MS));
  } else {
    // HTML documents (navigation requests).
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
  }
});

// ════════════════════════════════════════════════════════
// Strategies
// ════════════════════════════════════════════════════════

/** Stale-while-revalidate: serve cache, fetch in background. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

/** Cache-first: serve from cache, fetch if missing. TTL-aware. */
async function cacheFirst(request, cacheName, ttlMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    // Check TTL via Date header.
    const dateHeader = cached.headers.get('date');
    if (dateHeader) {
      const age = Date.now() - new Date(dateHeader).getTime();
      if (age < ttlMs) return cached;
    } else {
      // No date header — trust the cache.
      return cached;
    }
  }
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || Response.error();
  }
}

/** Network-first: try network, fallback to cache after timeout. */
async function networkFirst(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('timeout')), timeoutMs);
  });
  try {
    const response = await Promise.race([
      fetch(request),
      timeoutPromise,
    ]);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || Response.error();
  }
}

// ════════════════════════════════════════════════════════
// Message: handle "clear cache" from the Settings UI.
// ════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
  if (event.data === 'einkgram-clear-cache') {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        const clients = await self.clients.matchAll();
        clients.forEach((client) => client.postMessage('einkgram-cache-cleared'));
      })(),
    );
  }
});
