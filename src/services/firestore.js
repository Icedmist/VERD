// ═══════════════════════════════════════════
//  Data Service (Supabase — replaces Firestore)
// ═══════════════════════════════════════════

window.DataService = {
    /** Save scan result to Supabase */
    async saveScan(scanData) {
        const ss = window.SupabaseService;
        const user = AppState.get('user');

        if (!ss || !user || user.uid.startsWith('demo-')) {
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
            const result = await ss.saveScan(scanData);
            return result?.id || scanData.id;
        } catch (e) {
            console.error('Failed to save scan:', e);
            throw e;
        }
    },

    /** Get recent scans for current user */
    async getRecentScans(count = 10) {
        const ss = window.SupabaseService;
        const user = AppState.get('user');
        if (!ss || !user || user.uid.startsWith('demo-')) {
            return AppState.get('recentScans') || [];
        }

        try {
            const scans = await ss.getRecentScans(count);
            if (scans && scans.length > 0) {
                // Normalize field names from DB (snake_case) to camelCase
                return scans.map(s => ({
                    id: s.id,
                    crop: s.file_name || s.crop,
                    date: s.created_at || s.date,
                    result: s.condition || s.result,
                    confidence: s.confidence,
                    severity: s.severity,
                    condition: s.condition,
                    fileName: s.file_name,
                    fileSize: s.file_size,
                    description: s.description,
                    recommendations: s.recommendations,
                    mlData: s.ml_data,
                    soilMetrics: s.soil_metrics,
                    timestamp: s.created_at
                }));
            }
        } catch (e) {
            console.error('Failed to load scans:', e);
        }
        return AppState.get('recentScans') || [];
    },

    /** Get all scans (admin) */
    async getAllScans(count = 50) {
        const ss = window.SupabaseService;
        if (!ss) {
            return AppState.get('recentScans') || [];
        }
        try {
            const scans = await ss.getAllScans(count);
            if (scans && scans.length > 0) {
                return scans.map(s => ({
                    id: s.id,
                    crop: s.file_name || s.crop,
                    date: s.created_at || s.date,
                    result: s.condition || s.result,
                    confidence: s.confidence,
                    severity: s.severity,
                    condition: s.condition,
                    fileName: s.file_name,
                    timestamp: s.created_at
                }));
            }
        } catch (e) {
            console.error('Failed to load all scans:', e);
        }
        return AppState.get('recentScans') || [];
    },

    /** Get crop health data */
    async getCropHealth() {
        try {
            const data = await SupabaseService.getCropHealth();
            if (data && data.length > 0) {
                return data.map(c => ({
                    crop: c.crop,
                    field: c.field,
                    health: c.health,
                    status: c.status,
                    issues: c.issues || [],
                    lastScan: c.last_scan
                }));
            }
        } catch (e) {
            console.warn('Failed to fetch crop health:', e);
        }
        return AppState.get('cropHealthData') || [];
    },

    /** Get insights from DB */
    async getInsights(category = 'all') {
        try {
            const data = await SupabaseService.getInsights(category);
            if (data && data.length > 0) {
                return data.map(i => ({
                    icon: i.icon_name ? (Icons[i.icon_name] || Icons.leaf) : Icons.leaf,
                    title: i.title,
                    description: i.description,
                    tags: i.tags || [],
                    severity: i.severity,
                    category: i.category
                }));
            }
        } catch (e) {
            console.warn('Failed to fetch insights:', e);
        }
        return [];
    },

    /** Get admin stats */
    async getAdminStats() {
        try {
            const data = await SupabaseService.getAdminStats();
            if (data) {
                return {
                    totalFarmers: data.total_farmers,
                    totalScans: data.total_scans,
                    avgHealthScore: data.avg_health_score,
                    activeAlerts: data.active_alerts
                };
            }
        } catch (e) {
            console.warn('Failed to fetch admin stats:', e);
        }
        return AppState.get('adminStats') || { totalFarmers: 0, totalScans: 0, avgHealthScore: 0, activeAlerts: 0 };
    },

    /** Get plant disease info by condition name */
    async getDiseaseByName(name) {
        try {
            return await SupabaseService.getPlantDiseaseByName(name);
        } catch (e) {
            console.warn('Failed to fetch disease info:', e);
            return null;
        }
    },

    /** Delete a scan */
    async deleteScan(id) {
        try {
            await SupabaseService.deleteScan(id);
        } catch (e) {
            console.warn('Failed to delete scan from Supabase:', e);
        }
    },

    /** Update user profile */
    async updateProfile(data) {
        const user = AppState.get('user');
        AppState.set('user', { ...user, ...data });
    }
};

// Keep backward compatibility
window.FirestoreService = window.DataService;
