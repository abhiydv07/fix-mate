-- ========================================================
-- PROVIDER LOCATIONS TABLE & REALTIME RLS SECURITY
-- ========================================================

CREATE TABLE IF NOT EXISTS public.provider_locations (
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.provider_locations ENABLE ROW LEVEL SECURITY;

-- Provider can insert or update own live location
CREATE POLICY "Providers can upsert own live location"
  ON public.provider_locations FOR ALL
  TO authenticated
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- Customer can view provider live location ONLY IF they have an active booking assigned to that provider
CREATE POLICY "Customers can view assigned provider live location"
  ON public.provider_locations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = provider_id OR
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.provider_id = provider_locations.provider_id
      AND bookings.customer_id = auth.uid()
      AND bookings.status IN ('on_the_way', 'in_progress')
    )
  );

-- Enable Supabase Realtime on provider_locations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.provider_locations;
