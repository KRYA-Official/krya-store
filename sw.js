const CACHE_NAME = 'krya-store-v2';
const ASSETS_TO_CACHE = [
  '/krya-store/',
  '/krya-store/index.html',
  '/krya-store/style.css',
  '/krya-store/script.js',
  '/krya-store/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
