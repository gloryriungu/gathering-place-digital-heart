-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  testimonial_text TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social_media_handles table
CREATE TABLE public.social_media_handles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create newsletter_subscribers table for CRM
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  subscription_preferences JSONB DEFAULT '{}',
  subscription_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_email_sent TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create faq_content table
CREATE TABLE public.faq_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for testimonials
CREATE POLICY "Anyone can view published testimonials" ON public.testimonials
  FOR SELECT USING (is_published = true);

CREATE POLICY "Marketing users can manage testimonials" ON public.testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('marketing', 'it')
    )
  );

-- RLS Policies for social_media_handles  
CREATE POLICY "Anyone can view active social media handles" ON public.social_media_handles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Marketing users can manage social media handles" ON public.social_media_handles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('marketing', 'it')
    )
  );

-- RLS Policies for newsletter_subscribers
CREATE POLICY "Marketing users can manage newsletter subscribers" ON public.newsletter_subscribers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('marketing', 'it')
    )
  );

-- RLS Policies for faq_content
CREATE POLICY "Anyone can view published FAQ content" ON public.faq_content
  FOR SELECT USING (is_published = true);

CREATE POLICY "Marketing users can manage FAQ content" ON public.faq_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('marketing', 'it')
    )
  );

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faq_content_updated_at
  BEFORE UPDATE ON public.faq_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default social media handles
INSERT INTO public.social_media_handles (platform, handle, url, icon, display_order) VALUES
  ('Facebook', '@tentoftestimony', 'https://facebook.com/tentoftestimony', 'Facebook', 1),
  ('Instagram', '@tentoftestimony', 'https://instagram.com/tentoftestimony', 'Instagram', 2),
  ('Twitter', '@tentoftestimony', 'https://twitter.com/tentoftestimony', 'Twitter', 3),
  ('YouTube', 'TOT International', 'https://youtube.com/@totinternational', 'Youtube', 4);

-- Insert default FAQ content
INSERT INTO public.faq_content (category, question, answer, display_order) VALUES
  ('Visiting & Services', 'What time are your services?', 'We have three Sunday services: 8:00 AM, 10:30 AM, and 6:00 PM. We also have Tuesday Prayer at 7:00 PM, Thursday Bible Study at 7:00 PM, and Saturday Youth service at 7:00 PM.', 1),
  ('Visiting & Services', 'What should I wear to church?', 'Come as you are! We welcome people in casual or formal attire. Our focus is on your heart, not your clothing. You''ll see everything from jeans to suits.', 2),
  ('Visiting & Services', 'Is there parking available?', 'Yes, we have a large parking lot with plenty of free parking. Handicap accessible spots are available near the main entrance.', 3),
  ('Membership & Getting Involved', 'How do I become a member?', 'Membership begins with attending our ''Join the Family'' class, which covers our beliefs, values, and expectations. After completing the class, you can choose to become a member through baptism or transfer of membership.', 1),
  ('Giving & Finances', 'How can I give to the church?', 'You can give during service through the offering plate, online through our website, by mail, or through our mobile app. We accept cash, checks, and electronic transfers.', 1);