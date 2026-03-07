// ═══════════════════════════════════════════
//  Service Worker Registration
// ═══════════════════════════════════════════

(function () {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const reg = await navigator.serviceWorker.register('public/sw.js');
                console.log('🔧 Service Worker registered:', reg.scope);
            } catch (err) {
                console.warn('Service Worker registration failed:', err);
            }
        });
    }
})();
