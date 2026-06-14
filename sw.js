const CACHE_NAME = 'bipoltrack-v11';
const ASSETS = [
  './index.html',
  './manifest.json',
  './tweaks-panel.jsx',
  './variations/v1-argile.jsx?v=202605310007',
  './variations/argile-extras.jsx?v=202605310007',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

// Réception d'une notification push (nécessite une clé VAPID côté serveur)
self.addEventListener('push', e => {
  const data = e.data?.json?.() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'BipolTrack', {
      body:      data.body  ?? "N'oublie pas ta saisie du jour.",
      icon:      './assets/icon-192.png',
      badge:     './assets/icon-72.png',
      tag:       'bipoltrack-reminder',
      renotify:  true,
      data:      { url: data.url ?? './' },
    })
  );
});

// Clic sur une notification — ouvre ou focus l'app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = e.notification.data?.url ?? './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(target);
    })
  );
});
