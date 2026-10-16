const CACHE_NAME = 'carbonvision-shell-v2';
const APP_SHELL_ASSETS = [
  '/manifest.webmanifest',
  '/carboniq-icon.svg',
  '/carboniq-icon-192.png',
  '/carboniq-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        const shellResponse = await fetch('/');
        if (!shellResponse.ok) throw new Error(`Unable to cache app shell (${shellResponse.status}).`);
        await cache.put('/', shellResponse.clone());
        await cache.addAll(APP_SHELL_ASSETS);
        const html = await shellResponse.text();
        const bundleAssets = [...new Set(
          [...html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)].map(match => match[1])
        )];
        await cache.addAll(bundleAssets);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('carbonvision-shell-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async response => {
          if (response.ok) {
            const copy = response.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put('/', copy);
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/');
          if (cached) return cached;
          return Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(async response => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, copy);
        }
        return response;
      });
    })
  );
});
