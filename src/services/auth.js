// ═══════════════════════════════════════════
//  Auth Service (Firebase + Demo Mode)
// ═══════════════════════════════════════════

window.AuthService = {
    _initialized: false,

    init() {
        if (this._initialized) return;
        this._initialized = true;

        try {
            const { auth, onAuthStateChanged } = window.__firebase || {};
            if (auth && onAuthStateChanged) {
                onAuthStateChanged(auth, (fbUser) => {
                    if (fbUser) {
                        const role = (fbUser.email || '').toLowerCase().includes('admin') ? 'admin' : 'farmer';
                        AppState.set('user', { uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName || fbUser.email.split('@')[0], role });
                        AppState.set('isAuthenticated', true);
                    }
                });
            }
        } catch (e) {
            console.warn('VERD: Firebase Auth not configured, demo mode active');
        }
    },

    async register(email, password, name, role = 'farmer') {
        try {
            const { auth, createUserWithEmailAndPassword, updateProfile } = window.__firebase || {};
            if (auth && createUserWithEmailAndPassword) {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                if (updateProfile) await updateProfile(cred.user, { displayName: name });
                AppState.set('user', { uid: cred.user.uid, email, displayName: name, role });
                AppState.set('isAuthenticated', true);
                return;
            }
        } catch (err) {
            if (err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || err.code?.includes('api-key')) {
                // Fallback to demo mode
            } else {
                throw new Error(this._parseError(err.code));
            }
        }

        // Demo mode
        await new Promise(r => setTimeout(r, 600));
        const demoUser = { uid: 'demo-' + Date.now(), email, displayName: name, role };
        AppState.set('user', demoUser);
        AppState.set('isAuthenticated', true);
        localStorage.setItem('verd_demo_user', JSON.stringify(demoUser));
    },

    async login(email, password) {
        try {
            const { auth, signInWithEmailAndPassword } = window.__firebase || {};
            if (auth && signInWithEmailAndPassword) {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                const role = email.toLowerCase().includes('admin') ? 'admin' : 'farmer';
                AppState.set('user', { uid: cred.user.uid, email, displayName: cred.user.displayName || email.split('@')[0], role });
                AppState.set('isAuthenticated', true);
                return;
            }
        } catch (err) {
            if (err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || err.code?.includes('api-key')) {
                // Fallback to demo mode
            } else if (err.code) {
                throw new Error(this._parseError(err.code));
            }
        }

        // Demo mode
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
            const { auth, signOut } = window.__firebase || {};
            if (auth && signOut) await signOut(auth);
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

    _parseError(code) {
        const errors = {
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/email-already-in-use': 'An account already exists with this email.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/weak-password': 'Password must be at least 6 characters.',
            'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
            'auth/network-request-failed': 'Network error. Check your connection.',
        };
        return errors[code] || 'Authentication failed. Please try again.';
    }
};
