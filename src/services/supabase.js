// ═══════════════════════════════════════════
//  Supabase Service — Database & Auth Client
// ═══════════════════════════════════════════

window.SupabaseService = (() => {
    const SUPABASE_URL = 'https://ivfrcefsrihhekjwycfs.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZnJjZWZzcmloaGVrand5Y2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTYzNTksImV4cCI6MjA4ODE5MjM1OX0.pcvySPb_GkP_6l8OVNN0YFWw1wIN5rBtjR6t4o8xKKc';

    let _client = null;

    function getClient() {
        if (!_client) {
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                _client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('VERD: Supabase client initialized');
            } else {
                console.warn('VERD: Supabase SDK not loaded');
            }
        }
        return _client;
    }

    // ─── Auth Helpers ───────────────────────────
    async function signUp(email, password, name, role = 'farmer') {
        const client = getClient();
        if (!client) throw new Error('Supabase not initialized');

        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: { data: { display_name: name, role } }
        });
        if (error) throw new Error(error.message);

        // Insert profile row
        if (data.user) {
            await client.from('profiles').upsert({
                id: data.user.id,
                email,
                display_name: name,
                role,
                created_at: new Date().toISOString()
            });
        }
        return data;
    }

    async function signIn(email, password) {
        const client = getClient();
        if (!client) throw new Error('Supabase not initialized');

        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        return data;
    }

    async function signOut() {
        const client = getClient();
        if (!client) return;
        await client.auth.signOut();
    }

    async function getSession() {
        const client = getClient();
        if (!client) return null;
        const { data } = await client.auth.getSession();
        return data?.session || null;
    }

    function onAuthStateChange(callback) {
        const client = getClient();
        if (!client) return { data: { subscription: { unsubscribe: () => { } } } };
        return client.auth.onAuthStateChange(callback);
    }

    // ─── Data: Plant Diseases ───────────────────
    async function getPlantDiseases(filters = {}) {
        const client = getClient();
        if (!client) return [];

        let query = client.from('plant_diseases').select('*');

        if (filters.crop) query = query.eq('crop', filters.crop);
        if (filters.severity) query = query.eq('severity', filters.severity);
        if (filters.search) query = query.ilike('name', `%${filters.search}%`);

        query = query.order('name', { ascending: true });

        const { data, error } = await query;
        if (error) { console.error('Error fetching diseases:', error); return []; }
        return data || [];
    }

    async function getPlantDiseaseByName(name) {
        const client = getClient();
        if (!client) return null;

        const { data, error } = await client
            .from('plant_diseases')
            .select('*')
            .ilike('name', `%${name}%`)
            .limit(1)
            .single();
        if (error) return null;
        return data;
    }

    // ─── Data: Scans ────────────────────────────
    async function saveScan(scanData) {
        const client = getClient();
        if (!client) return null;

        const session = await getSession();
        const userId = session?.user?.id || 'anonymous';

        const { data, error } = await client.from('scans').insert({
            id: scanData.id,
            user_id: userId,
            file_name: scanData.fileName,
            file_size: scanData.fileSize,
            condition: scanData.condition,
            confidence: scanData.confidence,
            severity: scanData.severity,
            description: scanData.description,
            recommendations: scanData.recommendations,
            ml_data: scanData.mlData,
            soil_metrics: scanData.soilMetrics,
            created_at: scanData.timestamp || new Date().toISOString()
        }).select().single();

        if (error) { console.error('Error saving scan:', error); return null; }
        return data;
    }

    async function getRecentScans(count = 20) {
        const client = getClient();
        if (!client) return [];

        const session = await getSession();
        if (!session?.user) return [];

        const { data, error } = await client
            .from('scans')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(count);
        if (error) { console.error('Error fetching scans:', error); return []; }
        return data || [];
    }

    async function getAllScans(count = 50) {
        const client = getClient();
        if (!client) return [];

        const { data, error } = await client
            .from('scans')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(count);
        if (error) { console.error('Error fetching all scans:', error); return []; }
        return data || [];
    }

    async function deleteScan(id) {
        const client = getClient();
        if (!client) return;
        await client.from('scans').delete().eq('id', id);
    }

    // ─── Data: Crop Health ──────────────────────
    async function getCropHealth() {
        const client = getClient();
        if (!client) return [];

        const session = await getSession();
        if (!session?.user) return [];

        const { data, error } = await client
            .from('crop_health')
            .select('*')
            .eq('user_id', session.user.id)
            .order('last_scan', { ascending: false });
        if (error) { console.error('Error fetching crop health:', error); return []; }
        return data || [];
    }

    // ─── Data: Insights / Advisory ──────────────
    async function getInsights(category = 'all') {
        const client = getClient();
        if (!client) return [];

        let query = client.from('insights').select('*');
        if (category && category !== 'all') {
            query = query.eq('category', category);
        }
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) { console.error('Error fetching insights:', error); return []; }
        return data || [];
    }

    // ─── Data: Admin Stats ──────────────────────
    async function getAdminStats() {
        const client = getClient();
        if (!client) return null;

        const { data, error } = await client
            .from('admin_stats')
            .select('*')
            .limit(1)
            .single();
        if (error) return null;
        return data;
    }

    // ─── Data: Marketplace Products ─────────────
    async function getMarketplaceProducts(category = 'all') {
        const client = getClient();
        if (!client) return [];

        let query = client.from('marketplace_products').select('*');
        if (category && category !== 'all') {
            query = query.eq('category', category);
        }
        query = query.order('name', { ascending: true });

        const { data, error } = await query;
        if (error) { console.error('Error fetching marketplace:', error); return []; }
        return data || [];
    }

    // ─── Model Metadata ─────────────────────────
    async function saveModelMetadata(metadata) {
        const client = getClient();
        if (!client) return null;

        const { data, error } = await client
            .from('model_metadata')
            .insert(metadata)
            .select()
            .single();
        if (error) { console.error('Error saving model metadata:', error); return null; }
        return data;
    }

    async function getLatestModel() {
        const client = getClient();
        if (!client) return null;

        const { data, error } = await client
            .from('model_metadata')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (error) return null;
        return data;
    }

    return {
        getClient,
        // Auth
        signUp, signIn, signOut, getSession, onAuthStateChange,
        // Data
        getPlantDiseases, getPlantDiseaseByName,
        saveScan, getRecentScans, getAllScans, deleteScan,
        getCropHealth,
        getInsights,
        getAdminStats,
        getMarketplaceProducts,
        saveModelMetadata, getLatestModel
    };
})();
