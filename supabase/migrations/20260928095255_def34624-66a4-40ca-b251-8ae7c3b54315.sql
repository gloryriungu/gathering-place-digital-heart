CREATE TABLE public.user_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  milestone_date date NOT NULL,
  recurring boolean NOT NULL DEFAULT true,
  note text,
  reminder_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_milestones TO authenticated;
GRANT ALL ON public.user_milestones TO service_role;
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own milestones" ON public.user_milestones FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_milestones_user ON public.user_milestones(user_id);
CREATE TRIGGER update_user_milestones_updated_at BEFORE UPDATE ON public.user_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();