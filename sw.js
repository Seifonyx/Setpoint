// Setpoint service worker. Bump CACHE with every release so phones pick up the update.
const CACHE = 'setpoint-v2.0.9-b77d8ab3';
// The food database is big and changes rarely, so it has its own cache that survives app updates.
const FOODS_CACHE = 'setpoint-foods';
// app.css / app.js are loaded with ?v=<version> (see index.html); keep that in step with CACHE.
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.png', 'firebase.js', 'app.css?v=2.0.9', 'app.js?v=2.0.9', 'ar.js?v=2.0.9', 'fonts/fonts.css', 'fonts/bricolage-grotesque-latin-4efd1a.woff2', 'fonts/bricolage-grotesque-latin-ext-6441e9.woff2', 'fonts/figtree-latin-7073ac.woff2', 'fonts/figtree-latin-ext-fd63b3.woff2', 'fonts/ibm-plex-sans-arabic-arabic-2bea59.woff2', 'fonts/ibm-plex-sans-arabic-arabic-6fbb1d.woff2', 'fonts/ibm-plex-sans-arabic-arabic-d381fd.woff2', 'fonts/ibm-plex-sans-arabic-arabic-dbd757.woff2', 'fonts/ibm-plex-sans-arabic-latin-88a0f1.woff2', 'fonts/ibm-plex-sans-arabic-latin-a2f8e3.woff2', 'fonts/ibm-plex-sans-arabic-latin-d6eeed.woff2', 'fonts/ibm-plex-sans-arabic-latin-eda814.woff2', 'fonts/ibm-plex-sans-arabic-latin-ext-00e20c.woff2', 'fonts/ibm-plex-sans-arabic-latin-ext-5ccf88.woff2', 'fonts/ibm-plex-sans-arabic-latin-ext-76c4b2.woff2', 'fonts/ibm-plex-sans-arabic-latin-ext-d61d6e.woff2'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => (k.startsWith('setpoint-') || k.startsWith('the-slope-')) && k !== CACHE && k !== FOODS_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function timeout(ms) { return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)); }

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Food database: saved copy first; a new version (?v=) replaces the old one.
  if (url.origin === self.location.origin && url.pathname.endsWith('/foods.json')) {
    event.respondWith(caches.open(FOODS_CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); c.keys().then((ks) => Promise.all(ks.filter((k) => k.url !== req.url).map((k) => c.delete(k)))).then(() => c.put(req, copy)); }
      return res;
    }))));
    return;
  }
  // Firebase sign-in pages (/__/auth/…) must always come from the network and never replace the cached app.
  if (url.origin === self.location.origin && url.pathname.startsWith('/__/')) return;

  // App page: try the network first so updates show up, fall back to the cached copy offline.
  // Other pages (privacy, terms…) are kept under their own name, so they never replace the app.
  if (req.mode === 'navigate') {
    const isApp = url.origin === self.location.origin && (url.pathname === '/' || url.pathname === '/index.html');
    const key = isApp ? 'index.html' : url.pathname.replace(/^\//, '');
    event.respondWith(
      Promise.race([fetch(req), timeout(4000)])
        .then((res) => {
          if (res.ok && url.origin === self.location.origin) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); }
          return res;
        })
        .catch(() => caches.match(key).then((r) => r || (isApp ? caches.match('./') : caches.match('index.html'))))
    );
    return;
  }

  // Google Fonts: serve from cache instantly, refresh in the background.
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit || Response.error());
          return hit || net;
        })
      )
    );
    return;
  }

  // Everything else from our own site: cache first, then network.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
