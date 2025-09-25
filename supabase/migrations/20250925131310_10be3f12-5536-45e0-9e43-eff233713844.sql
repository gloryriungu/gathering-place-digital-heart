-- Add RLS policies for the newly created tables

-- Requisitions policies
CREATE POLICY "Department members can create requisitions" 
ON public.requisitions 
FOR INSERT 
WITH CHECK (
  auth.uid() = requested_by AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role::text = department_id
  )
);

CREATE POLICY "Department members can view their requisitions" 
ON public.requisitions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role::text = department_id
  ) 
  OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['accounts'::app_role, 'admin'::app_role, 'it'::app_role])
  )
);

CREATE POLICY "Accounts can manage all requisitions" 
ON public.requisitions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['accounts'::app_role, 'admin'::app_role, 'it'::app_role])
  )
);

-- Pastor availability policies
CREATE POLICY "Pastors can manage their availability" 
ON public.pastor_availability 
FOR ALL 
USING (
  pastor_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['pastor'::app_role, 'senior_pastor'::app_role])
  )
);

CREATE POLICY "Users can view pastor availability" 
ON public.pastor_availability 
FOR SELECT 
USING (is_active = true);

-- Counseling sessions policies
CREATE POLICY "Pastors can manage their sessions" 
ON public.counseling_sessions 
FOR ALL 
USING (
  pastor_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['pastor'::app_role, 'senior_pastor'::app_role])
  )
);

CREATE POLICY "Members can view their sessions" 
ON public.counseling_sessions 
FOR SELECT 
USING (member_id = auth.uid());

CREATE POLICY "Members can book sessions" 
ON public.counseling_sessions 
FOR INSERT 
WITH CHECK (
  member_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM join_family_applications 
    WHERE user_id = auth.uid() 
    AND status = 'approved'
  )
);

-- Activity logs policies
CREATE POLICY "IT users can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'it'::app_role
  )
);

CREATE POLICY "Admin can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['admin'::app_role, 'senior_pastor'::app_role, 'founder'::app_role])
  )
);

CREATE POLICY "System can insert activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (true);

-- Budget proposals policies
CREATE POLICY "Accounts can create budget proposals" 
ON public.budget_proposals 
FOR INSERT 
WITH CHECK (
  submitted_by = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'accounts'::app_role
  )
);

CREATE POLICY "Budget proposals viewers" 
ON public.budget_proposals 
FOR SELECT 
USING (
  submitted_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['founder'::app_role, 'senior_pastor'::app_role, 'admin'::app_role, 'it'::app_role])
  )
);

CREATE POLICY "Founder can manage budget proposals" 
ON public.budget_proposals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'founder'::app_role
  )
);

-- Analytics events policies
CREATE POLICY "IT can view analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'it'::app_role
  )
);

CREATE POLICY "Founder can view analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'founder'::app_role
  )
);

CREATE POLICY "System can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);