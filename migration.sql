-- ═══════════════════════════════════════════
--  VERD Database Migration (V2)
-- ═══════════════════════════════════════════

-- 1. Update Profiles table to include location
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. Ensure scans table has created_at (fixes "column does not exist" issue)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scans' AND column_name='created_at') THEN
        ALTER TABLE public.scans ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. Add index for faster scan lookups
CREATE INDEX IF NOT EXISTS scans_user_id_idx ON public.scans (user_id);
CREATE INDEX IF NOT EXISTS scans_created_at_idx ON public.scans (created_at DESC);

-- 4. Correct any missing descriptions in plant_diseases
UPDATE public.plant_diseases SET description = 'No detailed description available yet.' WHERE description IS NULL;

-- ═══════════════════════════════════════════
--  Migration Complete
-- ═══════════════════════════════════════════
