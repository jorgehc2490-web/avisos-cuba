/* LABMET Avisos Cuba — service worker mínimo.
   Red primero: los datos del tiempo siempre se piden frescos;
   la caché solo sirve de respaldo sin conexión. */
const CACHE = "labmet-avisos-v1";
const BASE = ["/", "/index.html", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/privacidad.html"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copia = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
