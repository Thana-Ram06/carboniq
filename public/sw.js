// VASUDHA Service Worker — Phase 7
const CACHE_VER = 'v7';
const STATIC_CACHE = `vasudha-static-${CACHE_VER}`;
const NAV_CACHE = `vasudha-nav-${CACHE_VER}`;

const STATIC_PRECACHE = [
  '/offline',
  '/manifest.json',
];

// Install — precache offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Activate — remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('vasudha-') && !k.includes(CACHE_VER))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-http
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // Skip Firebase, external APIs — always network
  const isExternal =
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('openstreetmap') ||
    url.hostname.includes('open-meteo') ||
    url.hostname.includes('gstatic');
  if (isExternal) return;

  // API routes — network first, no cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'offline', code: 503 }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Next.js static assets — cache first (immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // Navigation requests — network first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(NAV_CACHE).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches.open(NAV_CACHE)
            .then((c) => c.match(request))
            .then((cached) => cached || caches.match('/offline'))
            .then((r) => r || new Response('Offline', { status: 503 }))
        )
    );
    return;
  }

  // Everything else — network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r || new Response('', { status: 503 })))
  );
});

// Background sync — retry pending evidence uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'vasudha-evidence-sync') {
    event.waitUntil(syncPendingUploads());
  }
});

async function syncPendingUploads() {
  // Clients handle actual sync via postMessage
  const clients = await self.clients.matchAll();
  clients.forEach((client) => client.postMessage({ type: 'SYNC_PENDING_UPLOADS' }));
}
