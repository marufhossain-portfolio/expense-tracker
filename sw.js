/* Daily Expense — service worker (offline app shell) */
const CACHE = "daily-expense-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/favicon-48.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(caches.match(req).then((c) => c || fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((x) => x.put(req, cp)); return r; }).catch(() => caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then((c) => c || fetch(req).then((r) => { if (r && r.status === 200 && r.type === "basic") { const cp = r.clone(); caches.open(CACHE).then((x) => x.put(req, cp)); } return r; }).catch(() => c)));
});
