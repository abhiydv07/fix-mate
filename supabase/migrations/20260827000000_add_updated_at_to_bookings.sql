-- Add updated_at column to bookings table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    -- Backfill existing rows
    UPDATE bookings SET updated_at = created_at WHERE updated_at IS NULL;
  END IF;
END $$;
