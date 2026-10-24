const CACHE_NAME = "fittrack-cache-v14";

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

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isAppShell =
    request.mode === "navigate" ||
    ["index.html", "app.js", "styles.css", "sw.js"].some(file => url.pathname.endsWith("/" + file));

  event.respondWith((async () => {
    if (isAppShell) {
      try {
        const response = await fetch(request, { cache: "no-store" });
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return (await caches.match("./index.html")) || Response.error();
        }
        return Response.error();
      }
    }

    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return Response.error();
    }
  })());
});
