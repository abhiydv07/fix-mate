-- ========================================================
-- DAY 3: AUTOMATED PROFILE TRIGGER & RLS POLICIES
-- ========================================================

-- 1. Automatic Profile Creation Function & Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL 10 TABLES
-- ========================================================

-- PROFILES
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- CATEGORIES
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  TO authenticated, anon
  USING (active = true);

-- SERVICES
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  TO authenticated, anon
  USING (true);

-- PROVIDER PROFILES
CREATE POLICY "Provider profiles are viewable by everyone"
  ON public.provider_profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Providers can update own provider profile"
  ON public.provider_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Providers can insert own provider profile"
  ON public.provider_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- PROVIDER SERVICES
CREATE POLICY "Provider services are viewable by everyone"
  ON public.provider_services FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Providers can manage own services"
  ON public.provider_services FOR ALL
  TO authenticated
  USING (auth.uid() = provider_id);

-- ADDRESSES
CREATE POLICY "Users can manage own addresses"
  ON public.addresses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- BOOKINGS
CREATE POLICY "Customers can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id OR auth.uid() = provider_id);

CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Participants can update booking status"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- PAYMENTS
CREATE POLICY "Booking participants can view payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = payments.booking_id
      AND (bookings.customer_id = auth.uid() OR bookings.provider_id = auth.uid())
    )
  );

CREATE POLICY "Booking participants can update payment status"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = payments.booking_id
      AND (bookings.customer_id = auth.uid() OR bookings.provider_id = auth.uid())
    )
  );

CREATE POLICY "Customers can insert payment record"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.customer_id = auth.uid()
    )
  );

-- REVIEWS
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Customers can create reviews for completed bookings"
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

-- CHAT MESSAGES
CREATE POLICY "Booking participants can view chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = chat_messages.booking_id
      AND (bookings.customer_id = auth.uid() OR bookings.provider_id = auth.uid())
    )
  );

CREATE POLICY "Booking participants can insert chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = chat_messages.booking_id
      AND (bookings.customer_id = auth.uid() OR bookings.provider_id = auth.uid())
    )
  );
