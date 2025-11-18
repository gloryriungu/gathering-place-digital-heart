-- Drop the problematic RLS policies
DROP POLICY IF EXISTS "Users can view their contributions via email" ON public.contributions;
DROP POLICY IF EXISTS "Users can view their own contributions" ON public.contributions;

-- Create corrected RLS policies that don't access auth.users table
CREATE POLICY "Users can view their own contributions by member_id"
ON public.contributions
FOR SELECT
USING (
  member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their contributions by email"
ON public.contributions
FOR SELECT
USING (
  donor_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR
  member_id IN (
    SELECT id FROM public.members WHERE user_id = auth.uid()
  )
);