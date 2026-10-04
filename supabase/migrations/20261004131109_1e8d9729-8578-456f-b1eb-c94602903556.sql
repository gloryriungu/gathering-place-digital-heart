DROP POLICY IF EXISTS "Accounts users can manage contributions" ON public.contributions;
CREATE POLICY "Finance roles can manage contributions" ON public.contributions
FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'accounts') OR public.has_role(auth.uid(),'it') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'founder') OR public.has_role(auth.uid(),'senior_pastor'))
WITH CHECK (public.has_role(auth.uid(),'accounts') OR public.has_role(auth.uid(),'it') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'founder') OR public.has_role(auth.uid(),'senior_pastor'));