const CACHE_NAME = 'suivi-v1';
const ASSETS = [
  'index.html',
  'manifest.json'
];

// Installation et mise en cache des fichiers statiques
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Stratégie réseau : Cache en premier, sinon réseau
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  )
});