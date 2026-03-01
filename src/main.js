// ═══════════════════════════════════════════
//  Main Application Entry Point
// ═══════════════════════════════════════════

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        console.log('VERD: Initializing...');

        AuthService.init();
        const restored = AuthService.restoreDemoSession();
        Router.init();

        if (!restored && !AppState.get('isAuthenticated')) {
            window.location.hash = '#/login';
        }

        AppState.subscribe('isOnline', (isOnline) => {
            if (isOnline) {
                DOM.toast('Connection restored', 'success');
                document.querySelector('.offline-banner')?.remove();
            } else {
                DOM.toast('You are offline — using cached data', 'warning');
            }
        });

        // Preload MobileNet model in background
        if (typeof mobilenet !== 'undefined') {
            setTimeout(() => {
                ScannerService.loadModel().then(() => {
                    console.log('VERD: ML model preloaded');
                });
            }, 3000);
        }

        console.log('VERD: Ready');
    });
})();
