-- ========================================================
-- REVIEWS TABLE UNIQUE CONSTRAINT, RLS & RATING TRIGGER
-- ========================================================

-- Ensure UNIQUE constraint on booking_id
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_key;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_booking_id_key UNIQUE (booking_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Customers can insert review for own completed booking" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Customer can insert review ONLY if they are customer of completed booking
CREATE POLICY "Customers can insert review for own completed booking"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.customer_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Trigger Function: Recalculate provider avg_rating on new review
CREATE OR REPLACE FUNCTION public.recalculate_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_provider_id UUID;
  new_avg NUMERIC;
BEGIN
  -- Get provider_id from booking
  SELECT provider_id INTO target_provider_id
  FROM public.bookings
  WHERE id = NEW.booking_id;

  IF target_provider_id IS NOT NULL THEN
    -- Calculate average rating
    SELECT ROUND(AVG(r.rating)::numeric, 1) INTO new_avg
    FROM public.reviews r
    JOIN public.bookings b ON b.id = r.booking_id
    WHERE b.provider_id = target_provider_id;

    -- Update provider_profiles table
    UPDATE public.provider_profiles
    SET avg_rating = COALESCE(new_avg, 5.0)
    WHERE id = target_provider_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger on reviews insert
DROP TRIGGER IF EXISTS trg_recalculate_provider_rating ON public.reviews;
CREATE TRIGGER trg_recalculate_provider_rating
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_provider_rating();
