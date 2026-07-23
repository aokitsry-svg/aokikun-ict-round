const CACHE_VERSION = 'aokikun-v1';
const SHELL_CACHE = `app-shell-${CACHE_VERSION}`;

const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './aokikun-icon.svg',
  './favicon.svg',
  './about/',
  './about/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== SHELL_CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isSameOriginGet = request.method === 'GET' && url.origin === self.location.origin;
  const isNavigationRequest = request.mode === 'navigate' || url.pathname.endsWith('/index.html');

  if (isSameOriginGet && isNavigationRequest) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(SHELL_CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  if (isSameOriginGet && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/about/'))) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) caches.open(SHELL_CACHE).then((cache) => cache.put(request, response.clone()));
        return response;
      }))
    );
    return;
  }

  if (isSameOriginGet) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(SHELL_CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});
