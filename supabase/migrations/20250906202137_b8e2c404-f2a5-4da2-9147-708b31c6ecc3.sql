-- Add RLS policies for IT users to manage user roles

-- Allow IT users to insert user roles
CREATE POLICY "IT users can insert user roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'it'::app_role
  )
);

-- Allow IT users to update user roles
CREATE POLICY "IT users can update user roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'it'::app_role
  )
);

-- Allow IT users to delete user roles
CREATE POLICY "IT users can delete user roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'it'::app_role
  )
);

-- Allow IT users to view all user roles (for management purposes)
CREATE POLICY "IT users can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'it'::app_role
  )
);