-- Add RLS policies for marketing team to manage page_content
CREATE POLICY "Marketing can manage all content"
ON public.page_content
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('marketing', 'it')
  )
);

-- Add explicit SELECT policy for marketing team
CREATE POLICY "Marketing can view all content"
ON public.page_content
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('marketing', 'it')
  )
);