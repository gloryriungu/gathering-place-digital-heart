CREATE TABLE public.quarterly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quarter TEXT NOT NULL,
  favorite_space TEXT NOT NULL,
  typical_time_of_day TEXT NOT NULL,
  session_duration TEXT NOT NULL,
  spiritual_theme_word TEXT,
  metrics_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, quarter)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quarterly_reviews TO authenticated;
GRANT ALL ON public.quarterly_reviews TO service_role;
ALTER TABLE public.quarterly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage own quarterly reviews" ON public.quarterly_reviews
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Leadership can view quarterly reviews" ON public.quarterly_reviews
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'it') OR
  public.has_role(auth.uid(),'founder') OR public.has_role(auth.uid(),'senior_pastor'));
CREATE TRIGGER update_quarterly_reviews_updated_at BEFORE UPDATE ON public.quarterly_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();