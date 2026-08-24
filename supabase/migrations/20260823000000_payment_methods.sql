-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('upi', 'card', 'cash')),
  upi_id TEXT,
  card_last4 TEXT,
  card_brand TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL
  USING (auth.uid() = user_id);

-- Add subscription_plan column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_plan TEXT DEFAULT 'free';
  END IF;
END $$;
