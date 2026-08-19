-- ========================================================
-- CHAT MESSAGES RLS POLICIES & REALTIME PUBLICATION
-- ========================================================

-- Enable Row Level Security (RLS) on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read chat messages of own bookings" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert chat messages to own bookings" ON public.chat_messages;

-- RLS Policy: User can read messages ONLY if they are customer or provider of the booking
CREATE POLICY "Users can read chat messages of own bookings"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = chat_messages.booking_id
      AND (bookings.customer_id = auth.uid() OR bookings.provider_id = auth.uid())
    )
  );

-- RLS Policy: User can insert messages ONLY if they are customer or provider of the booking
CREATE POLICY "Users can insert chat messages to own bookings"
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

-- Add chat_messages to Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
