-- ========================================================
-- STORAGE BUCKET FOR KYC DOCUMENTS & ADMIN RLS POLICIES
-- ========================================================

-- Insert private storage bucket 'kyc-docs'
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-docs', 'kyc-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Provider can upload to kyc-docs
CREATE POLICY "Providers can upload own KYC documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kyc-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS: Admin can view all KYC documents
CREATE POLICY "Admins can view KYC documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc-docs' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin RLS Policies on provider_profiles
CREATE POLICY "Admins can update provider verification status"
  ON public.provider_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
