-- Create recurring_contributions table
CREATE TABLE IF NOT EXISTS public.recurring_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  member_id UUID,
  contribution_type TEXT NOT NULL DEFAULT 'tithe',
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  payment_method_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  next_charge_date DATE NOT NULL,
  last_charge_date DATE,
  last_charge_status TEXT,
  failed_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_recurring_payment_method
    FOREIGN KEY (payment_method_id)
    REFERENCES public.saved_payment_methods(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_recurring_member
    FOREIGN KEY (member_id)
    REFERENCES public.members(id)
    ON DELETE SET NULL
);

-- Create index for efficient queries
CREATE INDEX idx_recurring_next_charge ON public.recurring_contributions(next_charge_date, status);
CREATE INDEX idx_recurring_user ON public.recurring_contributions(user_id);

-- Enable RLS
ALTER TABLE public.recurring_contributions ENABLE ROW LEVEL SECURITY;

-- Users can view their own recurring contributions
CREATE POLICY "Users can view own recurring contributions"
  ON public.recurring_contributions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own recurring contributions
CREATE POLICY "Users can create own recurring contributions"
  ON public.recurring_contributions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recurring contributions
CREATE POLICY "Users can update own recurring contributions"
  ON public.recurring_contributions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own recurring contributions
CREATE POLICY "Users can delete own recurring contributions"
  ON public.recurring_contributions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Accounts, admin, and IT can view all recurring contributions
CREATE POLICY "Authorized roles can view all recurring contributions"
  ON public.recurring_contributions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('accounts', 'admin', 'it', 'founder')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_recurring_contributions_updated_at
  BEFORE UPDATE ON public.recurring_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.recurring_contributions TO authenticated;
GRANT ALL ON public.recurring_contributions TO service_role;