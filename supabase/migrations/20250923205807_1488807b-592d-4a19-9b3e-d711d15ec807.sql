-- Add RLS policy to allow registration users to view all profiles
CREATE POLICY "Registration users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['registration'::app_role, 'it'::app_role])))));