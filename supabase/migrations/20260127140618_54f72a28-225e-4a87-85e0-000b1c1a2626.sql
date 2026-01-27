-- Create cookie_consents table for tracking user consent
CREATE TABLE public.cookie_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('all', 'essential', 'custom', 'rejected')),
  analytics_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  functional_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cookie_settings table for customizable popup content
CREATE TABLE public.cookie_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_text TEXT NOT NULL DEFAULT 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.',
  popup_title TEXT NOT NULL DEFAULT 'Cookie Preferences',
  popup_description TEXT NOT NULL DEFAULT 'We use cookies to improve your experience on our website. You can choose which cookies you allow.',
  show_detailed_options BOOLEAN NOT NULL DEFAULT true,
  button_accept_text TEXT NOT NULL DEFAULT 'Accept All',
  button_reject_text TEXT NOT NULL DEFAULT 'Reject All',
  button_customize_text TEXT NOT NULL DEFAULT 'Customize',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_cookie_consents_user_id ON public.cookie_consents(user_id);
CREATE INDEX idx_cookie_consents_session_id ON public.cookie_consents(session_id);
CREATE INDEX idx_cookie_consents_created_at ON public.cookie_consents(created_at);
CREATE INDEX idx_cookie_consents_consent_type ON public.cookie_consents(consent_type);

-- Enable RLS on both tables
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cookie_consents table
-- Allow anyone to insert consent records (for anonymous users)
CREATE POLICY "Anyone can insert cookie consent"
ON public.cookie_consents
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own consent records
CREATE POLICY "Users can view own cookie consent"
ON public.cookie_consents
FOR SELECT
USING (user_id = auth.uid() OR session_id = session_id);

-- Allow IT, Marketing, Admin, Founder to view all consent records
CREATE POLICY "Staff can view all cookie consents"
ON public.cookie_consents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('it', 'marketing', 'admin', 'founder')
  )
);

-- Allow users to update their own consent
CREATE POLICY "Users can update own cookie consent"
ON public.cookie_consents
FOR UPDATE
USING (user_id = auth.uid() OR session_id = session_id);

-- RLS Policies for cookie_settings table
-- Allow anyone to read settings (for displaying the banner)
CREATE POLICY "Anyone can view cookie settings"
ON public.cookie_settings
FOR SELECT
USING (true);

-- Allow IT, Marketing, Admin to manage settings
CREATE POLICY "Staff can manage cookie settings"
ON public.cookie_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('it', 'marketing', 'admin')
  )
);

-- Insert default cookie settings
INSERT INTO public.cookie_settings (
  policy_text,
  popup_title,
  popup_description,
  show_detailed_options,
  button_accept_text,
  button_reject_text,
  button_customize_text,
  is_active
) VALUES (
  'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. You can manage your preferences at any time.',
  'We Value Your Privacy',
  'This website uses cookies to ensure you get the best experience. We use essential cookies for basic functionality, analytics cookies to understand how you use our site, marketing cookies for personalized content, and functional cookies for enhanced features.',
  true,
  'Accept All',
  'Reject All',
  'Customize',
  true
);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_cookie_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_cookie_consents_updated_at
BEFORE UPDATE ON public.cookie_consents
FOR EACH ROW
EXECUTE FUNCTION public.update_cookie_updated_at();

CREATE TRIGGER update_cookie_settings_updated_at
BEFORE UPDATE ON public.cookie_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_cookie_updated_at();