-- Drop the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "IT users can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "IT users can update user roles" ON public.user_roles;  
DROP POLICY IF EXISTS "IT users can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "IT users can view all user roles" ON public.user_roles;

-- Create fixed policies using the security definer function to avoid recursion
-- Allow IT users to insert user roles using has_role function
CREATE POLICY "IT users can insert user roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'it'));

-- Allow IT users to update user roles using has_role function
CREATE POLICY "IT users can update user roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'it'));

-- Allow IT users to delete user roles using has_role function
CREATE POLICY "IT users can delete user roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'it'));

-- Allow IT users to view all user roles using has_role function
CREATE POLICY "IT users can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'it'));