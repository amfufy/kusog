// Kusog Fit Quest offline cache. Bump VERSION whenever you change any file.
const VERSION = 'kusog-v4';
const FILES = ['./', './index.html', './app.js', './scene.js', './three.module.min.js', './manifest.json',
  './chakra-400.woff2', './chakra-600.woff2', './chakra-700.woff2', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => {
    const net = fetch(e.request).then(res => {
      if (res && res.ok && new URL(e.request.url).origin === location.origin) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => hit || caches.match('./index.html'));
    return hit || net;
  }));
});
