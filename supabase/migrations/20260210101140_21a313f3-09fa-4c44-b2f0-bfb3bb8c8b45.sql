
-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read cookie consents" ON public.cookie_consents;
DROP POLICY IF EXISTS "Cookie consents are publicly readable" ON public.cookie_consents;
DROP POLICY IF EXISTS "Allow public read access to cookie_consents" ON public.cookie_consents;

-- Allow only authorized staff to read cookie consents
CREATE POLICY "Staff can read cookie consents"
ON public.cookie_consents
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'it')
  OR public.has_role(auth.uid(), 'marketing')
  OR public.has_role(auth.uid(), 'founder')
);

-- Users can still read their own consent record
CREATE POLICY "Users can read own cookie consent"
ON public.cookie_consents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
