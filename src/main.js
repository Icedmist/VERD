// ═══════════════════════════════════════════
//  Main Application Entry Point
// ═══════════════════════════════════════════

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', async () => {
        console.log('VERD: Initializing...');

        // Restore theme preference
        const savedTheme = localStorage.getItem('verd-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Initialize Supabase service
        SupabaseService.getClient();

        // Initialize auth
        AuthService.init();

        // 1. Initialize router early so landing page can render immediately
        Router.init();

        // 2. Try to restore sessions in background
        (async () => {
            const supabaseRestored = await AuthService.restoreSupabaseSession();
            const demoRestored = !supabaseRestored && AuthService.restoreDemoSession();

            // Only redirect if we ARE on the root and NO session exists
            if (!supabaseRestored && !demoRestored && !AppState.get('isAuthenticated')) {
                const h = window.location.hash;
                if (h === '' || h === '#/') {
                    window.location.hash = '#/home';
                }
            }
        })();

        AppState.subscribe('isOnline', (isOnline) => {
            if (isOnline) {
                DOM.toast('Connection restored', 'success');
                document.querySelector('.offline-banner')?.remove();
            } else {
                DOM.toast('You are offline — using cached data', 'warning');
            }
        });

        // Preload ML model in background
        if (typeof tf !== 'undefined') {
            setTimeout(() => {
                ScannerService.loadModel().then(() => {
                    console.log('VERD: ML model preloaded');
                });
            }, 3000);
        }

        console.log('VERD: Ready (Supabase backend)');
    });
})();
