CREATE TABLE public.user_journal_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'gratitude' CHECK (category IN ('gratitude','prayer_request','answered_prayer','sermon_takeaway')),
  is_answered boolean NOT NULL DEFAULT false,
  answered_date date,
  answered_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_journal_entries TO authenticated;
GRANT ALL ON public.user_journal_entries TO service_role;
ALTER TABLE public.user_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own journal entries" ON public.user_journal_entries
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_journal_entries_user ON public.user_journal_entries(user_id, created_at DESC);
CREATE TRIGGER update_user_journal_entries_updated_at BEFORE UPDATE ON public.user_journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();