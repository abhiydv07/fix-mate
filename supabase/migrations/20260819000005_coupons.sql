-- ========================================================
-- COUPONS TABLE & SEED PROMO CODES
-- ========================================================

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('flat', 'percent')) NOT NULL,
  value NUMERIC NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow public and authenticated users to read active valid coupons
CREATE POLICY "Anyone can view active valid coupons"
  ON public.coupons FOR SELECT
  USING (active = true AND valid_until >= NOW());

-- Seed Default Promo Codes
INSERT INTO public.coupons (code, discount_type, value, valid_until, active)
VALUES
  ('WELCOME50', 'flat', 50, NOW() + INTERVAL '1 year', true),
  ('FIXMATE20', 'percent', 20, NOW() + INTERVAL '1 year', true)
ON CONFLICT (code) DO NOTHING;
