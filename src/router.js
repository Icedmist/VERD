// ═══════════════════════════════════════════
//  SPA Router (Hash-based)
// ═══════════════════════════════════════════

window.Router = (() => {
    const routes = {};
    let currentRoute = '';

    /** Register a route */
    function on(path, handler) {
        routes[path] = handler;
    }

    /** Navigate to a route */
    function navigate(path) {
        window.location.hash = path;
    }

    /** Resolve current route */
    function resolve() {
        const hash = window.location.hash || '#/';
        const path = hash.split('?')[0]; // ignore query params
        currentRoute = path;
        AppState.set('currentRoute', path);

        const app = document.getElementById('app');
        if (!app) return;

        // Auth guard — if not authenticated, redirect to home or login
        const publicRoutes = ['#/', '#/login', '#/register'];
        if (!AppState.get('isAuthenticated') && !publicRoutes.includes(path)) {
            window.location.hash = '#/';
            return;
        }

        // If authenticated and on login/register, redirect to dashboard
        if (AppState.get('isAuthenticated') && publicRoutes.includes(path)) {
            const user = AppState.get('user');
            window.location.hash = user?.role === 'admin' ? '#/admin' : '#/dashboard';
            return;
        }

        // Find handler
        const handler = routes[path] || routes['#/404'];
        if (handler) {
            handler(app);
        }
    }

    /** Initialize router */
    function init() {
        // Define routes
        on('#/login', (app) => {
            app.innerHTML = LoginPage.render();
            LoginPage.bindEvents();
        });

        on('#/register', (app) => {
            app.innerHTML = RegisterPage.render();
            RegisterPage.bindEvents();
        });

        on('#/', (app) => {
            const user = AppState.get('user');
            if (user?.role === 'admin') {
                app.innerHTML = LayoutComponent.render(AdminDashboardPage.render(), '#/admin');
                LayoutComponent.bindEvents();
                AdminDashboardPage.afterRender?.();
            } else if (user) {
                app.innerHTML = LayoutComponent.render(DashboardPage.render(), '#/dashboard');
                LayoutComponent.bindEvents();
                DashboardPage.afterRender?.();
            } else {
                app.innerHTML = HomePage.render();
                HomePage.bindEvents();
            }
        });

        on('#/dashboard', (app) => {
            app.innerHTML = LayoutComponent.render(DashboardPage.render(), '#/dashboard');
            LayoutComponent.bindEvents();
            DashboardPage.afterRender?.();
        });

        on('#/admin', (app) => {
            const user = AppState.get('user');
            if (user?.role !== 'admin') {
                window.location.hash = '#/dashboard';
                return;
            }
            app.innerHTML = LayoutComponent.render(AdminDashboardPage.render(), '#/admin');
            LayoutComponent.bindEvents();
            AdminDashboardPage.afterRender?.();
        });

        on('#/scan', (app) => {
            app.innerHTML = LayoutComponent.render(ScanPage.render(), '#/scan');
            LayoutComponent.bindEvents();
            ScanPage.bindEvents?.();
        });

        on('#/results', (app) => {
            app.innerHTML = LayoutComponent.render(ScanResultsPage.render(), '#/scan');
            LayoutComponent.bindEvents();
            ScanResultsPage.afterRender?.();
        });

        on('#/marketplace', (app) => {
            app.innerHTML = LayoutComponent.render(MarketplacePage.render(), '#/marketplace');
            LayoutComponent.bindEvents();
            MarketplacePage.bindEvents?.();
        });

        on('#/history', (app) => {
            app.innerHTML = LayoutComponent.render(ScanHistoryPage.render(), '#/history');
            LayoutComponent.bindEvents();
            ScanHistoryPage.afterRender?.();
        });

        on('#/404', (app) => {
            if (AppState.get('isAuthenticated')) {
                app.innerHTML = LayoutComponent.render(NotFoundPage.render(), '');
                LayoutComponent.bindEvents();
            } else {
                app.innerHTML = NotFoundPage.render();
            }
        });

        // Listen for hash changes
        window.addEventListener('hashchange', resolve);

        // Initial resolve
        resolve();
    }

    return { init, navigate, on };
})();
