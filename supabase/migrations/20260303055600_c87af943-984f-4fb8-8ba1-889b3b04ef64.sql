CREATE POLICY "Accounts users can delete contributions"
ON public.contributions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('accounts'::app_role, 'it'::app_role)
  )
);