const CACHE_NAME = "fittrack-cache-v5";
const APP_FILES = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon.svg", "./images/pec-fly.jpg", "./images/leg-extension.jpg", "./images/reverse-lunge.jpg", "./images/lateral-raise.jpg", "./images/leg-curl.jpg", "./images/triceps-pushdown.jpg", "./images/lat-pulldown.jpg", "./images/chest-row.jpg", "./images/biceps-curl-machine.jpg", "./images/reverse-fly.jpg", "./images/incline-press.jpg", "./images/lat-pulldown-neutral.jpg", "./images/calf-raise.jpg", "./images/hip-abduction.jpg", "./images/biceps-curl-dumbbell.jpg", "./images/incline-dumbbell-curl.jpg", "./images/cable-biceps-curl.jpg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.status === 200 && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match("./index.html"))));
});
