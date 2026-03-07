// ═══════════════════════════════════════════
//  Service Worker — Offline-First Caching
// ═══════════════════════════════════════════

const CACHE_NAME = 'verd-v4';
const STATIC_ASSETS = [
    './',
    'index.html',
    'src/style.css',
    'src/utils/dom.js',
    'src/state.js',
    'src/services/weather.js',
    'src/services/scanner.js',
    'src/services/auth.js',
    'src/services/firestore.js',
    'src/components/WeatherWidget.js',
    'src/components/Card.js',
    'src/components/Modal.js',
    'src/components/Layout.js',
    'src/pages/Login.js',
    'src/pages/Register.js',
    'src/pages/Dashboard.js',
    'src/pages/AdminDashboard.js',
    'src/pages/Scan.js',
    'src/pages/ScanResults.js',
    'src/pages/Marketplace.js',
    'src/pages/NotFound.js',
    'src/router.js',
    'src/main.js'
];

// Install — cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch — cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip Firebase / external API calls
    if (url.hostname !== self.location.hostname) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;
                return fetch(event.request)
                    .then(response => {
                        // Cache successful responses
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                        }
                        return response;
                    })
                    .catch(() => {
                        // Offline fallback for navigation
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});
