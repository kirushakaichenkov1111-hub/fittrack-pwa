const CACHE_NAME = "fittrack-cache-v9";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon.svg",

  "./images/pec-fly.jpg",
  "./images/leg-extension.jpg",
  "./images/reverse-lunge.jpg",
  "./images/lateral-raise.jpg",
  "./images/leg-curl.jpg",
  "./images/triceps-pushdown.jpg",
  "./images/lat-pulldown.jpg",
  "./images/chest-row.jpg",
  "./images/biceps-curl-machine.jpg",
  "./images/reverse-fly.jpg",
  "./images/incline-press.jpg",
  "./images/lat-pulldown-neutral.jpg",
  "./images/calf-raise.jpg",
  "./images/hip-abduction.jpg",
  "./images/biceps-curl-dumbbell.jpg",
  "./images/incline-dumbbell-curl.jpg",
  "./images/cable-biceps-curl.jpg",
  "./images/biceps-curl-machine.svg",
  "./images/cable-biceps-curl.svg",
  "./images/biceps-curl-dumbbell.svg",
  "./images/incline-dumbbell-curl.svg"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    await Promise.allSettled(
      APP_FILES.map(async path => {
        const url = new URL(path, self.registration.scope);
        const response = await fetch(url, { cache: "reload" });

        if (response.ok) {
          await cache.put(url, response);
        }
      })
    );

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key => key.startsWith("fittrack-cache-") && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);

      if (
        response.ok &&
        new URL(request.url).origin === self.location.origin
      ) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      if (request.mode === "navigate") {
        const cache = await caches.open(CACHE_NAME);
        return (
          await cache.match("./index.html")
        ) || Response.error();
      }

      return Response.error();
    }
  })());
});
