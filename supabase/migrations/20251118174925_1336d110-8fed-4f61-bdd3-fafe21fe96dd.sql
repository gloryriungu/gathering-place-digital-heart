-- Drop the problematic policy that still accesses auth.users
DROP POLICY IF EXISTS "Users can view their contributions by email" ON public.contributions;

-- Create a security definer function to safely get user email
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = _user_id;
$$;

-- Create corrected policy using the security definer function
CREATE POLICY "Users can view their contributions by email"
ON public.contributions
FOR SELECT
USING (
  donor_email = public.get_user_email(auth.uid())
  OR
  member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  )
);