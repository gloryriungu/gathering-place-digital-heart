
-- Fix 1: Drop the broken cookie_consents SELECT policy with tautology condition
DROP POLICY IF EXISTS "Users can view own cookie consent" ON public.cookie_consents;

-- Recreate with proper scoping - only authenticated users can read their own rows
CREATE POLICY "Users can view own cookie consent"
ON public.cookie_consents FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Fix 2: Drop the overly permissive activity_logs INSERT policy
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;

-- Recreate: only authenticated users can insert their own activity logs
CREATE POLICY "Authenticated users can insert own activity logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Also allow service_role to insert (for system-generated logs)
CREATE POLICY "Service role can insert activity logs"
ON public.activity_logs FOR INSERT
TO service_role
WITH CHECK (true);
