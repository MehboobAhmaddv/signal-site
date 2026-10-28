// Minimal service worker: makes the site installable. It caches nothing, so you always see fresh prices.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
