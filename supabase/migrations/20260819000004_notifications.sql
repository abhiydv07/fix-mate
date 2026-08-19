-- ========================================================
-- NOTIFICATIONS TABLE & RLS SECURITY
-- ========================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update read status of own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- System / API can insert notifications
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add to Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
