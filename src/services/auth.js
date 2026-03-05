// ═══════════════════════════════════════════
//  Auth Service (Supabase)
// ═══════════════════════════════════════════

window.AuthService = {
    _initialized: false,

    init() {
        if (this._initialized) return;
        this._initialized = true;

        try {
            SupabaseService.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const meta = session.user.user_metadata || {};
                    const role = meta.role || (session.user.email || '').toLowerCase().includes('admin') ? 'admin' : 'farmer';
                    AppState.set('user', {
                        uid: session.user.id,
                        email: session.user.email,
                        displayName: meta.display_name || session.user.email.split('@')[0],
                        role
                    });
                    AppState.set('isAuthenticated', true);
                } else if (event === 'SIGNED_OUT') {
                    AppState.set('user', null);
                    AppState.set('isAuthenticated', false);
                }
            });
        } catch (e) {
            console.warn('VERD: Supabase Auth listener failed, demo mode active');
        }
    },

    async register(email, password, name, role = 'farmer') {
        try {
            const data = await SupabaseService.signUp(email, password, name, role);
            if (data?.user) {
                AppState.set('user', {
                    uid: data.user.id,
                    email,
                    displayName: name,
                    role
                });
                AppState.set('isAuthenticated', true);
                return;
            }
        } catch (err) {
            // If Supabase error, fall through to demo mode for unverified users
            if (!err.message?.includes('not authorized') && !err.message?.includes('network')) {
                throw new Error(err.message || 'Registration failed');
            }
        }

        // Demo mode fallback
        await new Promise(r => setTimeout(r, 600));
        const demoUser = { uid: 'demo-' + Date.now(), email, displayName: name, role };
        AppState.set('user', demoUser);
        AppState.set('isAuthenticated', true);
        localStorage.setItem('verd_demo_user', JSON.stringify(demoUser));
    },

    async login(email, password) {
        try {
            const data = await SupabaseService.signIn(email, password);
            if (data?.user) {
                const meta = data.user.user_metadata || {};
                const role = meta.role || (email.toLowerCase().includes('admin') ? 'admin' : 'farmer');
                AppState.set('user', {
                    uid: data.user.id,
                    email,
                    displayName: meta.display_name || email.split('@')[0],
                    role
                });
                AppState.set('isAuthenticated', true);
                return;
            }
        } catch (err) {
            if (!err.message?.includes('not authorized') && !err.message?.includes('network')) {
                throw new Error(err.message || 'Login failed');
            }
        }

        // Demo mode fallback
        await new Promise(r => setTimeout(r, 700));
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'farmer';
        const displayName = email.split('@')[0];
        const demoUser = { uid: 'demo-' + Date.now(), email, displayName, role };
        AppState.set('user', demoUser);
        AppState.set('isAuthenticated', true);
        localStorage.setItem('verd_demo_user', JSON.stringify(demoUser));
    },

    async logout() {
        try {
            await SupabaseService.signOut();
        } catch (e) { /* ignore */ }
        AppState.set('user', null);
        AppState.set('isAuthenticated', false);
        localStorage.removeItem('verd_demo_user');
    },

    restoreDemoSession() {
        try {
            const saved = localStorage.getItem('verd_demo_user');
            if (saved) {
                const user = JSON.parse(saved);
                AppState.set('user', user);
                AppState.set('isAuthenticated', true);
                return true;
            }
        } catch (e) { /* ignore */ }
        return false;
    },

    async restoreSupabaseSession() {
        try {
            const session = await SupabaseService.getSession();
            if (session?.user) {
                const meta = session.user.user_metadata || {};
                const role = meta.role || (session.user.email || '').toLowerCase().includes('admin') ? 'admin' : 'farmer';
                AppState.set('user', {
                    uid: session.user.id,
                    email: session.user.email,
                    displayName: meta.display_name || session.user.email.split('@')[0],
                    role
                });
                AppState.set('isAuthenticated', true);
                return true;
            }
        } catch (e) { /* ignore */ }
        return false;
    }
};
