// ═══════════════════════════════════════════
//  Reactive State Management
// ═══════════════════════════════════════════

window.AppState = (() => {
    const listeners = {};

    const state = new Proxy({
        isAuthenticated: false,
        user: null,
        currentRoute: '#/',
        isOnline: navigator.onLine,
        weather: null,
        lastScanResult: null,

        // Data from Supabase (starts empty, loaded on demand)
        cropHealthData: [],
        recentScans: [],
        adminStats: { totalFarmers: 0, totalScans: 0, avgHealthScore: 0, activeAlerts: 0 }
    }, {
        set(target, key, value) {
            target[key] = value;
            (listeners[key] || []).forEach(fn => fn(value, key));
            return true;
        }
    });

    return {
        get: (key) => state[key],
        set: (key, value) => { state[key] = value; },
        update: (key, fn) => { state[key] = fn(state[key]); },
        subscribe: (key, fn) => {
            if (!listeners[key]) listeners[key] = [];
            listeners[key].push(fn);
            return () => { listeners[key] = listeners[key].filter(l => l !== fn); };
        }
    };
})();

// Online/offline tracking
window.addEventListener('online', () => AppState.set('isOnline', true));
window.addEventListener('offline', () => AppState.set('isOnline', false));
