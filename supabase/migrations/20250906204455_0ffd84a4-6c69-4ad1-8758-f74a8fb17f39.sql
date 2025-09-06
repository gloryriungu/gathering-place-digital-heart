-- Fix system_logs RLS policy to allow IT users to insert logs
DROP POLICY IF EXISTS "IT users can manage system logs" ON public.system_logs;

-- Create more specific policies for system_logs
CREATE POLICY "IT users can insert system logs" 
ON public.system_logs 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'it'));

CREATE POLICY "IT users can view system logs" 
ON public.system_logs 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'it'));

CREATE POLICY "IT users can update system logs" 
ON public.system_logs 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'it'));

CREATE POLICY "IT users can delete system logs" 
ON public.system_logs 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'it'));