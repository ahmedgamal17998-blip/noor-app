const STATIC_CACHE = "noor-static-v2";
const AUDIO_CACHE = "noor-audio-v1";
const QURAN_CACHE = "noor-quran-v1";

const PRECACHE_URLS = ["/", "/manifest.json", "/icon-192.svg", "/icon-512.svg"];
const AUDIO_HOSTS = ["cdn.islamic.network"];
const QURAN_HOSTS = ["api.alquran.cloud"];
const AUDIO_LIMIT = 80;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, AUDIO_CACHE, QURAN_CACHE].includes(k))
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  while (keys.length > max) {
    await cache.delete(keys.shift());
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (AUDIO_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        try {
          const res = await fetch(request);
          if (res.ok) {
            cache.put(request, res.clone());
            void trimCache(AUDIO_CACHE, AUDIO_LIMIT);
          }
          return res;
        } catch {
          return Response.error();
        }
      }),
    );
    return;
  }

  if (QURAN_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(QURAN_CACHE).then(async (cache) => {
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          const hit = await cache.match(request);
          return hit || Response.error();
        }
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request).then((r) => r || Response.error())),
  );
});
