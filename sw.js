/* Service worker: keeps every app file on the device so the app starts fast and works offline.
   VERSION and FILES are written by scripts/update_version.py – run it after changing any app file. */
const VERSION = "f7cb0bb3c7";
const FILES = [
  "./",
  "./css/fonts.css",
  "./css/style.css",
  "./fonts/nunito-latin-ext.woff2",
  "./fonts/nunito-latin.woff2",
  "./fonts/playwrite-de-grund.woff2",
  "./fonts/playwrite-de-la.woff2",
  "./fonts/playwrite-de-sas.woff2",
  "./fonts/playwrite-de-va.woff2",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-64.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./index.html",
  "./js/app.js",
  "./js/data/01-people-body-food.js",
  "./js/data/02-home-school-toys.js",
  "./js/data/03-animals-nature.js",
  "./js/data/04-city-traffic-travel-jobs.js",
  "./js/data/05-leisure-sport-art-time.js",
  "./js/data/06-tech-tools-money-work-language.js",
  "./js/data/07-feelings-society-science-fantasy.js",
  "./js/data/08-everyday-common.js",
  "./js/data/09-extended-nouns.js",
  "./js/data/cases.js",
  "./js/data/examples.js",
  "./js/data/pictures.js",
  "./js/data/plurals.js",
  "./js/data/ranks.js",
  "./js/data/syllables.js",
  "./js/data/verbs.js",
  "./js/data/words.js",
  "./manifest.webmanifest",
  "./vendor/hyph-de-1996.js",
  "./vendor/xlsx.full.min.js"
];
// @generated-end

const CACHE = "artikel-" + VERSION;

self.addEventListener("install", (event) => {
  // cache: "reload" skips the browser's HTTP cache (GitHub Pages keeps files 10 minutes),
  // so a new version never mixes new and old files.
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("artikel-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return; // e.g. Tatoeba links
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Files are versioned with ?v=…, so the query string can be ignored when looking them up.
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (err) {
      if (req.mode === "navigate") return (await cache.match("./index.html")) || Response.error();
      throw err;
    }
  })());
});
