-- Add missing columns to provider_profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'experience_years') THEN
    ALTER TABLE provider_profiles ADD COLUMN experience_years TEXT DEFAULT '1-3';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'total_reviews') THEN
    ALTER TABLE provider_profiles ADD COLUMN total_reviews INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'availability') THEN
    ALTER TABLE provider_profiles ADD COLUMN availability JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'service_radius_km') THEN
    ALTER TABLE provider_profiles ADD COLUMN service_radius_km INTEGER DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'total_reviews') THEN
    ALTER TABLE provider_profiles ADD COLUMN total_reviews INTEGER DEFAULT 0;
  END IF;
END $$;

-- Ensure provider_services RLS allows providers to manage their own services
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Providers can view own services" ON provider_services;
DROP POLICY IF EXISTS "Providers can manage own services" ON provider_services;
DROP POLICY IF EXISTS "Anyone can read provider services" ON provider_services;

-- Providers can read/write their own service assignments
CREATE POLICY "Providers can manage own services"
  ON provider_services FOR ALL
  TO authenticated
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- Anyone can read provider services (for matching)
CREATE POLICY "Anyone can read provider services"
  ON provider_services FOR SELECT
  TO authenticated
  USING (true);
