// Простой оффлайн-кеш для Cloudflare Pages
const CACHE = 'seal-hunt-v3';
const FILES = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './favicon.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE ? null : caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(net => {
      if (req.method === 'GET' && net.status === 200 && !req.url.includes('/api/')) {
        const copy = net.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      }
      return net;
    }).catch(()=> caches.match('./index.html')))
  );
});
