// /service-worker.js
const CACHE_VERSION = 'pokecollectibles-v3'; // ✅ arttırıldı
const APP_SHELL = [
  '/',
  '/index.html',
  '/products.html',
  '/detail.html',
  '/about.html',
  '/contact.html',
  '/offline.html',
  '/js/api.js',
  '/js/app.js',
  '/manifest.json',
  '/data/sample.json',
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_VERSION ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

function isNavigation(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

function isAPI(url) {
  return url.origin === 'https://pokeapi.co';
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Sadece http/https istekleriyle ilgilen (chrome-extension vb. hariç tut)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // API harici cross-origin istekleri SW'e bırakma
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin && !isAPI(url)) {
    return;
  }

  // NAVIGATION: network-first (dil/icerik guncellensin), offline fallback
  if (isNavigation(req)) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/offline.html')))
    );
    return;
  }

  // API: network-first, cache fallback
  if (isAPI(url)) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || new Response(
          JSON.stringify({ error: 'Offline', message: 'API erişilemiyor (offline).' }),
          { headers: { 'Content-Type': 'application/json' } }
        )))
    );
    return;
  }

  // ASSETS: stale-while-revalidate
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(res => {
        if (res && res.status === 200 && req.method === 'GET') {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
