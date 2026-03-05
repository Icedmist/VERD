/**
 * VERD — Supabase Database Seed Script
 * 
 * This script creates the required tables and seeds initial data
 * into the Supabase database.
 * 
 * IMPORTANT: Run the SQL below in Supabase Dashboard > SQL Editor FIRST
 * to create the tables, then run this script to seed data.
 * 
 * Usage: node seed_supabase.js
 */

/*
═══════════════════════════════════════════════════
  Run this SQL in Supabase SQL Editor to create tables:
═══════════════════════════════════════════════════

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'farmer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plant diseases reference table
CREATE TABLE IF NOT EXISTS plant_diseases (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    crop TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'moderate',
    color TEXT DEFAULT '#eab308',
    description TEXT,
    recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    file_name TEXT,
    file_size TEXT,
    condition TEXT,
    confidence INTEGER,
    severity TEXT,
    description TEXT,
    recommendations JSONB,
    ml_data JSONB,
    soil_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crop health tracking
CREATE TABLE IF NOT EXISTS crop_health (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    crop TEXT NOT NULL,
    field TEXT,
    health INTEGER DEFAULT 0,
    status TEXT DEFAULT 'good',
    issues JSONB DEFAULT '[]',
    last_scan TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights / Advisory content
CREATE TABLE IF NOT EXISTS insights (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'leaf',
    tags JSONB DEFAULT '[]',
    severity TEXT DEFAULT 'low',
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin statistics (single-row table)
CREATE TABLE IF NOT EXISTS admin_stats (
    id SERIAL PRIMARY KEY,
    total_farmers INTEGER DEFAULT 0,
    total_scans INTEGER DEFAULT 0,
    avg_health_score INTEGER DEFAULT 0,
    active_alerts INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model metadata
CREATE TABLE IF NOT EXISTS model_metadata (
    id SERIAL PRIMARY KEY,
    version TEXT,
    dataset TEXT,
    num_classes INTEGER,
    image_size INTEGER,
    best_val_accuracy FLOAT,
    epochs INTEGER,
    class_labels JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read for reference data
CREATE POLICY "Public read plant_diseases" ON plant_diseases FOR SELECT USING (true);
CREATE POLICY "Public read insights" ON insights FOR SELECT USING (true);
CREATE POLICY "Public read admin_stats" ON admin_stats FOR SELECT USING (true);

-- RLS Policies: Authenticated users can manage their own data
CREATE POLICY "Users read own scans" ON scans FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);
CREATE POLICY "Users insert own scans" ON scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Users delete own scans" ON scans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own crop_health" ON crop_health FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own crop_health" ON crop_health FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (true);

═══════════════════════════════════════════════════
*/

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ivfrcefsrihhekjwycfs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZnJjZWZzcmloaGVrand5Y2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTYzNTksImV4cCI6MjA4ODE5MjM1OX0.pcvySPb_GkP_6l8OVNN0YFWw1wIN5rBtjR6t4o8xKKc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
    console.log('VERD: Seeding Supabase database...\n');

    // ─── Seed Plant Diseases ────────────────────
    console.log('Seeding plant_diseases...');
    const diseases = [
        { name: 'Apple — Apple Scab', crop: 'Apple', severity: 'moderate', color: '#eab308', description: 'Caused by the fungus Venturia inaequalis. Produces dark, scabby lesions on leaves and fruit surfaces.', recommendations: ['Apply fungicide sprays (captan or myclobutanil) during early spring.', 'Remove and destroy infected fallen leaves.', 'Plant scab-resistant apple varieties.', 'Ensure good air circulation between trees via proper pruning.'] },
        { name: 'Apple — Black Rot', crop: 'Apple', severity: 'high', color: '#ef4444', description: 'Fungal disease causing fruit rot, leaf spots, and cankers on limbs. Can lead to significant crop losses.', recommendations: ['Prune out dead branches and cankers.', 'Remove mummified fruits from trees.', 'Apply captan or thiophanate-methyl fungicides.'] },
        { name: 'Tomato — Early Blight', crop: 'Tomato', severity: 'moderate', color: '#eab308', description: 'Dark concentric lesions consistent with Early Blight (Alternaria solani). Commonly affects lower canopy first.', recommendations: ['Remove visibly affected leaves.', 'Apply copper-based fungicide.', 'Improve air circulation.', 'Switch to drip irrigation.', 'Plan 2-year crop rotation.'] },
        { name: 'Tomato — Late Blight', crop: 'Tomato', severity: 'high', color: '#ef4444', description: 'Devastating disease caused by Phytophthora infestans. Rapidly spreads under cool, wet conditions. Can destroy entire crops.', recommendations: ['Remove all infected plants immediately.', 'Apply chlorothalonil or mancozeb.', 'Avoid overhead irrigation.', 'Plant resistant varieties.'] },
        { name: 'Tomato — Bacterial Spot', crop: 'Tomato', severity: 'moderate', color: '#eab308', description: 'Bacterial infection causing small, dark spots on leaves and fruit. Spreads rapidly in warm, wet weather.', recommendations: ['Use certified disease-free seed.', 'Apply copper-based bactericides.', 'Avoid working in wet fields.', 'Rotate crops for 2-3 years.'] },
        { name: 'Tomato — Yellow Leaf Curl Virus', crop: 'Tomato', severity: 'high', color: '#ef4444', description: 'Viral disease transmitted by whiteflies. Causes leaf curling, yellowing, and stunted growth.', recommendations: ['Control whitefly populations.', 'Use UV-reflective mulch.', 'Plant resistant varieties.', 'Remove infected plants promptly.'] },
        { name: 'Tomato — Mosaic Virus', crop: 'Tomato', severity: 'high', color: '#ef4444', description: 'Viral infection causing mottled light and dark green coloring on leaves. Spread mechanically through contact.', recommendations: ['Remove infected plants.', 'Wash hands and tools with milk solution.', 'Control aphid vectors.', 'Use resistant varieties.'] },
        { name: 'Potato — Early Blight', crop: 'Potato', severity: 'moderate', color: '#eab308', description: 'Fungal disease causing dark lesions with concentric rings on potato leaves. Reduces yield significantly.', recommendations: ['Apply protectant fungicides preventively.', 'Ensure adequate fertilization.', 'Practice crop rotation.', 'Hill potatoes properly.'] },
        { name: 'Potato — Late Blight', crop: 'Potato', severity: 'high', color: '#ef4444', description: 'The historically devastating potato disease caused by Phytophthora infestans.', recommendations: ['Remove all infected plants.', 'Apply metalaxyl-based fungicide.', 'Plant certified disease-free seed potatoes.', 'Hill potatoes to protect tubers.'] },
        { name: 'Corn — Northern Leaf Blight', crop: 'Corn', severity: 'high', color: '#ef4444', description: 'Fungal disease causing long, cigar-shaped gray-green to tan lesions on corn leaves.', recommendations: ['Plant resistant hybrids.', 'Apply foliar fungicides.', 'Rotate crops.', 'Remove crop debris.'] },
        { name: 'Corn — Common Rust', crop: 'Corn', severity: 'moderate', color: '#eab308', description: 'Causes small, circular to elongated brown-red pustules on leaf surfaces. Common in temperate regions.', recommendations: ['Plant resistant varieties.', 'Apply fungicides if severe.', 'Monitor fields regularly.'] },
        { name: 'Cassava — Mosaic Disease', crop: 'Cassava', severity: 'high', color: '#ef4444', description: 'Caused by Cassava Mosaic Virus transmitted by whiteflies. Critical concern for food security in Africa.', recommendations: ['Remove and burn infected material.', 'Source certified disease-free cuttings.', 'Control whitefly vectors.', 'Plant resistant varieties (TME 419).'] },
        { name: 'Cassava — Brown Streak Disease', crop: 'Cassava', severity: 'high', color: '#ef4444', description: 'Viral disease causing brown streaks on stems and root necrosis. Major threat in East Africa.', recommendations: ['Use clean planting material.', 'Remove infected plants early.', 'Plant resistant varieties.', 'Practice field sanitation.'] },
        { name: 'Rice — Blast (Magnaporthe oryzae)', crop: 'Rice', severity: 'high', color: '#ef4444', description: 'Diamond-shaped lesions with grey-white centers. Yield losses can exceed 70% if untreated.', recommendations: ['Apply tricyclazole-based fungicide.', 'Reduce nitrogen fertilizer.', 'Ensure proper drainage.', 'Source blast-resistant seed varieties.'] },
        { name: 'Fall Armyworm (Spodoptera frugiperda)', crop: 'Maize', severity: 'high', color: '#ef4444', description: 'Destructive pest causing severe feeding damage to maize. Major threat across Sub-Saharan Africa.', recommendations: ['Manually remove larvae.', 'Apply Bt biological pesticide.', 'Implement push-pull technique.', 'Install pheromone traps.', 'Report outbreak to extension office.'] },
        { name: 'Nitrogen Deficiency', crop: 'General', severity: 'moderate', color: '#eab308', description: 'Uniform chlorosis starting from older leaves. Linked to depleted or poorly amended soils.', recommendations: ['Apply nitrogen-rich fertilizer (urea 46-0-0).', 'Add organic compost.', 'Introduce legume intercropping.', 'Test soil pH.'] },
    ];

    const { error: diseaseErr } = await supabase.from('plant_diseases').upsert(
        diseases.map((d, i) => ({ id: i + 1, ...d })),
        { onConflict: 'id' }
    );
    if (diseaseErr) console.error('  Error seeding diseases:', diseaseErr.message);
    else console.log(`  ✓ ${diseases.length} diseases seeded`);

    // ─── Seed Insights / Advisory ───────────────
    console.log('Seeding insights...');
    const insights = [
        { title: 'Fall Armyworm Alert — Western Region', description: 'Increased Fall Armyworm activity reported across maize fields in Western Kenya. Early detection is critical.', icon_name: 'alertTriangle', tags: ['Maize', 'Pest Control', 'Western Kenya'], severity: 'high', category: 'pest' },
        { title: 'Optimal Planting Window — March 2026', description: 'The long rains season is approaching. Ideal planting period for maize begins mid-March.', icon_name: 'sprout', tags: ['Seasonal', 'Maize', 'Rice', 'Planning'], severity: 'medium', category: 'seasonal' },
        { title: 'Soil Health: Nitrogen Management', description: 'After continuous maize cultivation, many fields show declining nitrogen levels. Consider rotating with legumes.', icon_name: 'beaker', tags: ['Soil Health', 'Fertilizer', 'Crop Rotation'], severity: 'medium', category: 'soil' },
        { title: 'Water Conservation Techniques', description: 'With erratic rainfall, implement water harvesting using tied ridges and contour planting. Mulching reduces evaporation by 40%.', icon_name: 'droplets', tags: ['Irrigation', 'Climate Adaptation', 'Water'], severity: 'low', category: 'water' },
        { title: 'Tomato Early Blight Prevention', description: 'Apply copper-based fungicides every 7-10 days during wet seasons. Ensure proper spacing for air circulation.', icon_name: 'leaf', tags: ['Tomatoes', 'Disease Prevention', 'Fungicide'], severity: 'medium', category: 'disease' },
        { title: 'Cassava Best Practices for 2026', description: 'Plant TME 419 or NAROCASS 1 resistant varieties. Maintain 1m x 1m spacing. Harvest at optimal times for starch content.', icon_name: 'wheat', tags: ['Cassava', 'Varieties', 'Best Practices'], severity: 'low', category: 'guide' },
        { title: 'Market Prices — Weekly Update', description: 'Current farm-gate prices (per 90kg bag): Maize KES 3,500 (+5%), Beans KES 8,200 (-2%), Rice KES 5,800 (+3%).', icon_name: 'barChart', tags: ['Market Prices', 'Economics', 'Sales'], severity: 'low', category: 'market' },
        { title: 'Climate Advisory: Heat Stress Management', description: 'Expected temperatures above 32°C through mid-March. Irrigate early morning or late evening.', icon_name: 'sun', tags: ['Climate', 'Heat', 'Irrigation'], severity: 'high', category: 'climate' },
    ];

    const { error: insightErr } = await supabase.from('insights').upsert(
        insights.map((i, idx) => ({ id: idx + 1, ...i })),
        { onConflict: 'id' }
    );
    if (insightErr) console.error('  Error seeding insights:', insightErr.message);
    else console.log(`  ✓ ${insights.length} insights seeded`);

    // ─── Seed Admin Stats ───────────────────────
    console.log('Seeding admin_stats...');
    const { error: statsErr } = await supabase.from('admin_stats').upsert({
        id: 1,
        total_farmers: 1247,
        total_scans: 8934,
        avg_health_score: 73,
        active_alerts: 23,
        updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (statsErr) console.error('  Error seeding stats:', statsErr.message);
    else console.log('  ✓ Admin stats seeded');

    console.log('\n═══════════════════════════════════════════');
    console.log('  Seeding complete!');
    console.log('═══════════════════════════════════════════\n');
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
