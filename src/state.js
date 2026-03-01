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

        // Demo data
        cropHealthData: [
            { crop: 'Maize', field: 'Field A — North', health: 92, status: 'excellent', issues: [], lastScan: new Date(Date.now() - 86400000 * 2) },
            { crop: 'Cassava', field: 'Field B — East', health: 78, status: 'good', issues: ['Minor leaf curl'], lastScan: new Date(Date.now() - 86400000 * 3) },
            { crop: 'Tomatoes', field: 'Field C — South', health: 61, status: 'warning', issues: ['Early blight detected', 'Low nitrogen'], lastScan: new Date(Date.now() - 86400000 * 7) },
            { crop: 'Rice', field: 'Field D — West', health: 45, status: 'danger', issues: ['Rice blast', 'Water stress'], lastScan: new Date(Date.now() - 86400000 * 4) }
        ],

        recentScans: [
            { id: 'V-001', crop: 'Maize', date: new Date(Date.now() - 86400000 * 2), result: 'Healthy', confidence: 94 },
            { id: 'V-002', crop: 'Tomatoes', date: new Date(Date.now() - 86400000 * 3), result: 'Early Blight', confidence: 87 },
            { id: 'V-003', crop: 'Cassava', date: new Date(Date.now() - 86400000 * 5), result: 'Mosaic Virus (Mild)', confidence: 78 },
            { id: 'V-004', crop: 'Rice', date: new Date(Date.now() - 86400000 * 7), result: 'Rice Blast', confidence: 91 },
            { id: 'V-005', crop: 'Maize', date: new Date(Date.now() - 86400000 * 10), result: 'Fall Armyworm', confidence: 85 }
        ],

        adminStats: { totalFarmers: 1247, totalScans: 8934, avgHealthScore: 73, activeAlerts: 23 }
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
