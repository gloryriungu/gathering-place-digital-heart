
CREATE TABLE public.reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.media_content(id) ON DELETE CASCADE,
  current_page integer NOT NULL DEFAULT 1,
  total_pages integer,
  last_read_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reading progress"
ON public.reading_progress
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin and IT can view all reading progress"
ON public.reading_progress
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = ANY(ARRAY['admin'::app_role, 'it'::app_role])
));

CREATE TRIGGER update_reading_progress_updated_at
BEFORE UPDATE ON public.reading_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
