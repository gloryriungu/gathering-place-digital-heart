-- Add policy to allow IT users to view all profiles for user management
CREATE POLICY "IT users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'it'
));