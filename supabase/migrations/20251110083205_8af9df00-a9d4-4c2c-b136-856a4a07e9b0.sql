-- Add index for better performance on activity logs queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id_created_at 
ON public.activity_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type_created_at 
ON public.activity_logs(entity_type, created_at DESC);

-- Create a function to get pastor activity summary
CREATE OR REPLACE FUNCTION public.get_pastor_activity_summary(pastor_user_id UUID)
RETURNS TABLE (
  total_sessions INTEGER,
  completed_sessions INTEGER,
  cancelled_sessions INTEGER,
  availability_changes INTEGER,
  last_activity TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(DISTINCT cs.id)::INTEGER as total_sessions,
    COUNT(DISTINCT CASE WHEN cs.status = 'completed' THEN cs.id END)::INTEGER as completed_sessions,
    COUNT(DISTINCT CASE WHEN cs.status = 'cancelled' THEN cs.id END)::INTEGER as cancelled_sessions,
    COUNT(DISTINCT CASE WHEN al.entity_type = 'pastor_availability' THEN al.id END)::INTEGER as availability_changes,
    MAX(COALESCE(al.created_at, cs.created_at)) as last_activity
  FROM public.counseling_sessions cs
  FULL OUTER JOIN public.activity_logs al 
    ON al.user_id = pastor_user_id 
    AND (al.entity_type IN ('counseling_session', 'pastor_availability'))
  WHERE cs.pastor_id = pastor_user_id OR al.user_id = pastor_user_id;
$$;

-- Update RLS policy for counseling_sessions to ensure strict pastor isolation
DROP POLICY IF EXISTS "Pastors can manage their sessions" ON public.counseling_sessions;

CREATE POLICY "Pastors can view their sessions"
ON public.counseling_sessions
FOR SELECT
USING (
  (pastor_id = auth.uid() AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('pastor', 'senior_pastor')
  ))
  OR member_id = auth.uid()
);

CREATE POLICY "Pastors can update their sessions"
ON public.counseling_sessions
FOR UPDATE
USING (
  pastor_id = auth.uid() AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('pastor', 'senior_pastor')
  )
);

CREATE POLICY "Pastors can insert their sessions"
ON public.counseling_sessions
FOR INSERT
WITH CHECK (
  pastor_id = auth.uid() AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('pastor', 'senior_pastor')
  )
);

-- Allow senior leadership to view all sessions for auditing
CREATE POLICY "Leadership can view all sessions for audit"
ON public.counseling_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('founder', 'senior_pastor', 'it', 'admin')
  )
);

-- Add RLS policy for activity logs viewing by pastors
CREATE POLICY "Pastors can view their own activity logs"
ON public.activity_logs
FOR SELECT
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('founder', 'senior_pastor', 'it', 'admin')
  )
);