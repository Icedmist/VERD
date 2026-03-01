// ═══════════════════════════════════════════
//  Firestore Service (CRUD helpers)
// ═══════════════════════════════════════════

window.FirestoreService = {
    /** Save scan result */
    async saveScan(scanData) {
        const fb = window.__firebase;
        const user = AppState.get('user');
        if (!fb || !user || fb.auth.app.options.apiKey === 'DEMO_API_KEY') {
            // Demo mode — store in state only
            const scans = AppState.get('recentScans') || [];
            scans.unshift({
                id: scanData.id,
                crop: scanData.fileName,
                date: scanData.timestamp,
                result: scanData.condition,
                confidence: scanData.confidence,
                imageUrl: ''
            });
            AppState.set('recentScans', scans.slice(0, 20));
            return scanData.id;
        }

        try {
            const docRef = await fb.addDoc(fb.collection(fb.db, 'scans'), {
                ...scanData,
                userId: user.uid,
                createdAt: fb.serverTimestamp()
            });
            return docRef.id;
        } catch (e) {
            console.error('Failed to save scan:', e);
            throw e;
        }
    },

    /** Get recent scans for current user */
    async getRecentScans(count = 10) {
        const fb = window.__firebase;
        const user = AppState.get('user');
        if (!fb || !user || fb.auth.app.options.apiKey === 'DEMO_API_KEY') {
            return AppState.get('recentScans') || [];
        }

        try {
            const q = fb.query(
                fb.collection(fb.db, 'scans'),
                fb.where('userId', '==', user.uid),
                fb.orderBy('createdAt', 'desc'),
                fb.limit(count)
            );
            const snap = await fb.getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            console.error('Failed to load scans:', e);
            return [];
        }
    },

    /** Get all scans (admin) */
    async getAllScans(count = 50) {
        const fb = window.__firebase;
        if (!fb || fb.auth.app.options.apiKey === 'DEMO_API_KEY') {
            return AppState.get('recentScans') || [];
        }
        try {
            const q = fb.query(
                fb.collection(fb.db, 'scans'),
                fb.orderBy('createdAt', 'desc'),
                fb.limit(count)
            );
            const snap = await fb.getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
            console.error('Failed to load all scans:', e);
            return [];
        }
    },

    /** Update user profile */
    async updateProfile(data) {
        const fb = window.__firebase;
        const user = AppState.get('user');
        if (!fb || !user || fb.auth.app.options.apiKey === 'DEMO_API_KEY') {
            AppState.set('user', { ...user, ...data });
            return;
        }
        await fb.setDoc(fb.doc(fb.db, 'users', user.uid), data, { merge: true });
    }
};
