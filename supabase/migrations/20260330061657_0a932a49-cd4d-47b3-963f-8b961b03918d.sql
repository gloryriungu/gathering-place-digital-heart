
ALTER TABLE public.profiles 
ADD COLUMN photography_consent boolean DEFAULT false,
ADD COLUMN photography_consent_date timestamptz;

-- Allow media, registration, marketing, admin, IT, founder to view photography consent
CREATE POLICY "Staff can view photography consent"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('media', 'registration', 'marketing', 'admin', 'it', 'founder')
    )
  );
