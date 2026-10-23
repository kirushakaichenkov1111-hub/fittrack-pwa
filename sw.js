const CACHE_NAME = "fittrack-cache-v3";
const APP_FILES = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon.svg", "./images/pec-fly.jpg", "./images/leg-extension.jpg", "./images/reverse-lunge.jpg", "./images/lateral-raise.jpg", "./images/leg-curl.jpg", "./images/triceps-pushdown.jpg", "./images/lat-pulldown.jpg", "./images/chest-row.jpg", "./images/biceps-curl-machine.jpg", "./images/reverse-fly.jpg", "./images/incline-press.jpg", "./images/lat-pulldown-neutral.jpg", "./images/calf-raise.jpg", "./images/hip-abduction.jpg", "./images/biceps-curl-dumbbell.jpg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();

          event.waitUntil(
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
          );
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);

        if (cached) return cached;

        if (request.mode === "navigate") {
          return (await caches.match("./index.html")) || Response.error();
        }

        return Response.error();
      })
  );
});
