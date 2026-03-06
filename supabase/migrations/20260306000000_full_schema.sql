-- ═══════════════════════════════════════════
-- VERD Full Database Schema Migration
-- ═══════════════════════════════════════════

-- 1. Profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
    location JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Plant diseases reference table
CREATE TABLE IF NOT EXISTS public.plant_diseases (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    crop TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'moderate',
    color TEXT DEFAULT '#eab308',
    description TEXT,
    recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Scans table
CREATE TABLE IF NOT EXISTS public.scans (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT,
    file_size TEXT,
    condition TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    severity TEXT NOT NULL,
    description TEXT,
    recommendations JSONB,
    ml_data JSONB,
    soil_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crop health tracking
CREATE TABLE IF NOT EXISTS public.crop_health (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    crop TEXT NOT NULL,
    field TEXT,
    health INTEGER DEFAULT 0,
    status TEXT DEFAULT 'good',
    issues JSONB DEFAULT '[]',
    last_scan TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Insights / Advisory content
CREATE TABLE IF NOT EXISTS public.insights (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'leaf',
    tags JSONB DEFAULT '[]',
    severity TEXT DEFAULT 'low',
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Admin statistics (single-row table)
CREATE TABLE IF NOT EXISTS public.admin_stats (
    id SERIAL PRIMARY KEY,
    total_farmers INTEGER DEFAULT 0,
    total_scans INTEGER DEFAULT 0,
    avg_health_score INTEGER DEFAULT 0,
    active_alerts INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Model metadata
CREATE TABLE IF NOT EXISTS public.model_metadata (
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

-- 8. Marketplace products (Added for completeness)
CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Plant Diseases (Public Read)
DROP POLICY IF EXISTS "Public read plant_diseases" ON public.plant_diseases;
CREATE POLICY "Public read plant_diseases" ON public.plant_diseases FOR SELECT USING (true);

-- Scans (Owner Only)
DROP POLICY IF EXISTS "Users can view their own scans" ON public.scans;
CREATE POLICY "Users can view their own scans" ON public.scans FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own scans" ON public.scans;
CREATE POLICY "Users can insert their own scans" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own scans" ON public.scans;
CREATE POLICY "Users can delete their own scans" ON public.scans FOR DELETE USING (auth.uid() = user_id);

-- Crop Health (Owner Only)
DROP POLICY IF EXISTS "Users read own crop_health" ON public.crop_health;
CREATE POLICY "Users read own crop_health" ON public.crop_health FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own crop_health" ON public.crop_health;
CREATE POLICY "Users insert own crop_health" ON public.crop_health FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insights (Public Read)
DROP POLICY IF EXISTS "Public read insights" ON public.insights;
CREATE POLICY "Public read insights" ON public.insights FOR SELECT USING (true);

-- Admin Stats (Public Read)
DROP POLICY IF EXISTS "Public read admin_stats" ON public.admin_stats;
CREATE POLICY "Public read admin_stats" ON public.admin_stats FOR SELECT USING (true);

-- Model Metadata (Public Read)
DROP POLICY IF EXISTS "Public read model_metadata" ON public.model_metadata;
CREATE POLICY "Public read model_metadata" ON public.model_metadata FOR SELECT USING (true);

-- Marketplace Products (Public Read)
DROP POLICY IF EXISTS "Public read marketplace_products" ON public.marketplace_products;
CREATE POLICY "Public read marketplace_products" ON public.marketplace_products FOR SELECT USING (true);


-- 10. Automatic Profile Creation on Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'display_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
