// ═══════════════════════════════════════════
//  VERD Service Worker — Offline Caching
// ═══════════════════════════════════════════

const CACHE_NAME = 'verd-v4';
const ASSETS = [
    './',
    'index.html',
    'src/style.css',
    'src/main.js',
    'src/router.js',
    'src/state.js',
    'src/utils/dom.js',
    'src/utils/icons.js',
    'src/utils/offline.js',
    'src/components/Card.js',
    'src/components/Layout.js',
    'src/components/Modal.js',
    'src/components/NeuralNetAnim.js',
    'src/components/VoiceScanner.js',
    'src/components/ReportCard.js',
    'src/components/WeatherWidget.js',
    'src/services/auth.js',
    'src/services/firestore.js',
    'src/services/scanner.js',
    'src/services/weather.js',
    'src/pages/Login.js',
    'src/pages/Register.js',
    'src/pages/Dashboard.js',
    'src/pages/AdminDashboard.js',
    'src/pages/Scan.js',
    'src/pages/ScanResults.js',
    'src/pages/ScanHistory.js',
    'src/pages/Marketplace.js',
    'src/pages/NotFound.js',
];

// Install — cache all assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch — cache-first for app assets, network-first for API
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // Network-first for API calls and external resources
    if (url.origin !== location.origin ||
        url.pathname.startsWith('/api') ||
        url.hostname.includes('firebase') ||
        url.hostname.includes('googleapis') ||
        url.hostname.includes('cdn.jsdelivr')) {
        e.respondWith(
            fetch(e.request)
                .catch(() => caches.match(e.request))
        );
        return;
    }

    // Cache-first for app shell
    e.respondWith(
        caches.match(e.request)
            .then(cached => cached || fetch(e.request).then(resp => {
                const clone = resp.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                return resp;
            }))
    );
});
