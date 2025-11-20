-- Create paystack_webhook_logs table for audit trail
CREATE TABLE public.paystack_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  signature_valid BOOLEAN NOT NULL DEFAULT false,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  processing_error TEXT,
  reference TEXT,
  related_contribution_id UUID REFERENCES public.contributions(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_webhook_logs_event_type ON public.paystack_webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_reference ON public.paystack_webhook_logs(reference);
CREATE INDEX idx_webhook_logs_created_at ON public.paystack_webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_processing_status ON public.paystack_webhook_logs(processing_status);

-- Enable RLS
ALTER TABLE public.paystack_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Allow accounts, admin, IT, and founder roles to view logs
CREATE POLICY "Authorized roles can view webhook logs"
  ON public.paystack_webhook_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('accounts', 'admin', 'it', 'founder')
    )
  );

-- Service role can insert logs (edge function)
CREATE POLICY "Service role can insert webhook logs"
  ON public.paystack_webhook_logs
  FOR INSERT
  WITH CHECK (true);