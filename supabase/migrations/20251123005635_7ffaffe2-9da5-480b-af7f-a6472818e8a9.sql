-- Create activity log visibility configuration table
CREATE TABLE IF NOT EXISTS public.activity_log_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL UNIQUE,
  can_view_all_activity boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.activity_log_visibility ENABLE ROW LEVEL SECURITY;

-- Only founder can manage visibility settings
CREATE POLICY "Founder can manage activity log visibility"
ON public.activity_log_visibility
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'founder'::app_role
  )
);

-- Anyone can read visibility settings (needed to check their own permissions)
CREATE POLICY "Users can read visibility settings"
ON public.activity_log_visibility
FOR SELECT
USING (true);

-- Insert default visibility settings (founder has full access by default)
INSERT INTO public.activity_log_visibility (role, can_view_all_activity)
VALUES 
  ('founder', true),
  ('admin', false),
  ('senior_pastor', false),
  ('pastor', false),
  ('registration', false),
  ('accounts', false),
  ('media', false),
  ('marketing', false),
  ('sunday_school', false),
  ('teacher', false),
  ('it', false),
  ('user', false)
ON CONFLICT (role) DO NOTHING;

-- Create function to check if user's role can view all activity
CREATE OR REPLACE FUNCTION public.can_view_all_activity(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN activity_log_visibility alv ON ur.role = alv.role
    WHERE ur.user_id = _user_id
    AND alv.can_view_all_activity = true
  )
$$;

-- Update activity_logs RLS policies to use the new visibility system
DROP POLICY IF EXISTS "Admin can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "IT users can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Pastors can view their own activity logs" ON public.activity_logs;

-- New policy: Users can view all activity if their role has permission
CREATE POLICY "Users with permission can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (
  can_view_all_activity(auth.uid())
);

-- New policy: Users can always view their own activity
CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs
FOR SELECT
USING (user_id = auth.uid());

-- System can still insert activity logs
-- (existing "System can insert activity logs" policy remains)

-- Create updated_at trigger
CREATE TRIGGER update_activity_log_visibility_updated_at
BEFORE UPDATE ON public.activity_log_visibility
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();