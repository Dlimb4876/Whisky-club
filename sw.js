/* ── Whisky Club – Service Worker ──────────────────────────────────────────
   Strategy: Cache-first for static assets, network-first for API calls.
   Update the CACHE_VERSION whenever you deploy new static assets so stale
   caches are automatically purged.
   ────────────────────────────────────────────────────────────────────────── */

const CACHE_VERSION = 'v1';
const CACHE_NAME    = `whisky-club-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/env.js',
  '/js/config.js',
  '/js/utils.js',
  '/js/storage.js',
  '/js/ratings.js',
  '/js/entries.js',
  '/js/reviews.js',
  '/js/sync.js',
  '/js/price.js',
  '/js/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// ── Install: pre-cache all static assets ────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ──────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for static, network-first for API ────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Let non-GET and cross-origin requests pass through without caching
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Network-first for API routes so data is always fresh
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for everything else (static shell)
  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback: return the cached index for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
