-- ========================================================
-- DISPUTES TABLE — customer/provider can flag bookings
-- ========================================================

CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  raised_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL CHECK (char_length(reason) >= 10),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  price_adjustment NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Participants can view disputes for their bookings
CREATE POLICY "Booking participants can view disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (
    raised_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = disputes.booking_id
      AND (bookings.customer_id = auth.uid() OR bookings.provider_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Booking participants can create disputes
CREATE POLICY "Booking participants can create disputes"
  ON public.disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    raised_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = disputes.booking_id
      AND (bookings.customer_id = auth.uid() OR bookings.provider_id = auth.uid())
    )
  );

-- Admin can update disputes
CREATE POLICY "Admins can update disputes"
  ON public.disputes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
