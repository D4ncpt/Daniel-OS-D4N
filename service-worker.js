const CACHE_NAME = "d4nos-v9";
const scopedURL = (path) => new URL(path, self.registration.scope).href;
const APP_SHELL_URL = scopedURL("./index.html");
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=6",
  "./manifest.json",
  "./src/app.js?v=9",
  "./src/store.js?v=5",
  "./src/cfa-data.js?v=4",
  "./src/meihua.js?v=4",
  "./src/daniel-toolkit.js?v=5",
  "./src/hexagrams.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
].map(scopedURL);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(APP_SHELL_URL, copy));
          return response;
        })
        .catch(() => caches.match(APP_SHELL_URL))
    );
    return;
  }

  if (new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});
