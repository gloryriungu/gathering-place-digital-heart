CREATE TABLE IF NOT EXISTS public.site_feature_flags (
  key text PRIMARY KEY,
  label text NOT NULL,
  path text,
  category text NOT NULL DEFAULT 'nav_primary',
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.site_feature_flags TO anon;
GRANT SELECT ON public.site_feature_flags TO authenticated;
GRANT ALL ON public.site_feature_flags TO service_role;

ALTER TABLE public.site_feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site feature flags" ON public.site_feature_flags;
CREATE POLICY "Anyone can read site feature flags"
  ON public.site_feature_flags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "IT can insert site feature flags" ON public.site_feature_flags;
CREATE POLICY "IT can insert site feature flags"
  ON public.site_feature_flags FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'it') OR public.has_role(auth.uid(), 'founder'));

DROP POLICY IF EXISTS "IT can update site feature flags" ON public.site_feature_flags;
CREATE POLICY "IT can update site feature flags"
  ON public.site_feature_flags FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'it') OR public.has_role(auth.uid(), 'founder'))
  WITH CHECK (public.has_role(auth.uid(), 'it') OR public.has_role(auth.uid(), 'founder'));

DROP POLICY IF EXISTS "IT can delete site feature flags" ON public.site_feature_flags;
CREATE POLICY "IT can delete site feature flags"
  ON public.site_feature_flags FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'it') OR public.has_role(auth.uid(), 'founder'));

GRANT INSERT, UPDATE, DELETE ON public.site_feature_flags TO authenticated;

DROP TRIGGER IF EXISTS update_site_feature_flags_updated_at ON public.site_feature_flags;
CREATE TRIGGER update_site_feature_flags_updated_at
  BEFORE UPDATE ON public.site_feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();