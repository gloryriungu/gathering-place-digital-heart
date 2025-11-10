-- Enhance newsletter_subscribers table for lead capture
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS bounce_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_bounce_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create email_bounces table
CREATE TABLE IF NOT EXISTS public.email_bounces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  bounce_type TEXT NOT NULL, -- hard, soft, spam_complaint
  bounce_reason TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_bounces_email ON public.email_bounces(email);
CREATE INDEX IF NOT EXISTS idx_email_bounces_type ON public.email_bounces(bounce_type);

-- Create suppression_list table
CREATE TABLE IF NOT EXISTS public.suppression_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  reason TEXT NOT NULL, -- bounce, unsubscribe, spam_complaint, manual
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_suppression_list_email ON public.suppression_list(email);

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  segment_filters JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, failed
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_analytics table
CREATE TABLE IF NOT EXISTS public.email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_email_analytics_campaign ON public.email_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_analytics_email ON public.email_analytics(email);

-- Enable RLS
ALTER TABLE public.email_bounces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_bounces
CREATE POLICY "Marketing and admin can view bounces"
  ON public.email_bounces FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'marketing') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'it')
  );

-- RLS Policies for suppression_list
CREATE POLICY "Marketing and admin can view suppression list"
  ON public.suppression_list FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'marketing') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'it')
  );

CREATE POLICY "Marketing and admin can manage suppression list"
  ON public.suppression_list FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'marketing') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'it')
  );

-- RLS Policies for email_campaigns
CREATE POLICY "Marketing and admin can view campaigns"
  ON public.email_campaigns FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'marketing') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'it')
  );

CREATE POLICY "Marketing and admin can manage campaigns"
  ON public.email_campaigns FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'marketing') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'it')
  );

-- RLS Policies for email_analytics
CREATE POLICY "Marketing and admin can view analytics"
  ON public.email_analytics FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'marketing') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'it')
  );

-- Function to check if email is suppressed
CREATE OR REPLACE FUNCTION public.is_email_suppressed(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.suppression_list WHERE email = email_to_check
  )
$$;

-- Function to get campaign stats
CREATE OR REPLACE FUNCTION public.get_campaign_stats(campaign_uuid UUID)
RETURNS TABLE(
  total_sent BIGINT,
  total_opened BIGINT,
  total_clicked BIGINT,
  total_bounced BIGINT,
  total_unsubscribed BIGINT,
  open_rate NUMERIC,
  click_rate NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*) as total_sent,
    COUNT(opened_at) as total_opened,
    COUNT(clicked_at) as total_clicked,
    COUNT(bounced_at) as total_bounced,
    COUNT(unsubscribed_at) as total_unsubscribed,
    ROUND(COUNT(opened_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as open_rate,
    ROUND(COUNT(clicked_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as click_rate
  FROM public.email_analytics
  WHERE campaign_id = campaign_uuid;
$$;

-- Trigger to update newsletter_subscribers status on bounce
CREATE OR REPLACE FUNCTION public.handle_email_bounce()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update subscriber bounce count
  UPDATE public.newsletter_subscribers
  SET 
    bounce_count = bounce_count + 1,
    last_bounce_at = NEW.occurred_at,
    status = CASE 
      WHEN NEW.bounce_type = 'hard' THEN 'bounced'
      WHEN bounce_count + 1 >= 3 THEN 'bounced'
      ELSE status
    END
  WHERE email = NEW.email;
  
  -- Add to suppression list if hard bounce or spam complaint
  IF NEW.bounce_type IN ('hard', 'spam_complaint') THEN
    INSERT INTO public.suppression_list (email, reason, notes)
    VALUES (NEW.email, NEW.bounce_type, NEW.bounce_reason)
    ON CONFLICT (email) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_handle_email_bounce
  AFTER INSERT ON public.email_bounces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_bounce();