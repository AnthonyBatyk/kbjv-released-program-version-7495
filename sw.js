const CACHE_NAME = "kbjv-pwa-v60";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./icon.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  // Cloudflare auth/admin API is cross-origin and must never be served from this cache.
  if (requestUrl.origin !== self.location.origin) return;

  // Navigation: prefer the newest online page, fall back to cached PWA shell offline.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy)));
          return response;
        })
        .catch(async () => {
          return (await caches.match(event.request))
            || (await caches.match("./index.html"))
            || (await caches.match("./"));
        })
    );
    return;
  }

  // App assets: instant cache-first response, refresh cache in the background when online.
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  const title = data.title || "КБЖВ";
  const options = {
    body: data.body || "Не забудь записати свій денний підсумок калорійності.",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    tag: "kbjv-daily-summary",
    renotify: false,
    data: { url: data.url || "./" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({type:"window", includeUncontrolled:true}).then(list => {
    for (const client of list) {
      if ("focus" in client) return client.focus();
    }
    return clients.openWindow ? clients.openWindow("./") : undefined;
  }));
});
