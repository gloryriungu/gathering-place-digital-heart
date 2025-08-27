-- Create pastors/admin role management
CREATE TABLE public.pastor_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'pastor',
  permissions TEXT[] DEFAULT ARRAY['content_management', 'department_visibility'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for pastor_roles
ALTER TABLE public.pastor_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for pastor_roles
CREATE POLICY "Pastors can view their own roles" 
ON public.pastor_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create table for managing serve departments visibility
CREATE TABLE public.serve_departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirements TEXT[] NOT NULL,
  time_commitment TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for serve_departments
ALTER TABLE public.serve_departments ENABLE ROW LEVEL SECURITY;

-- Create policies for serve_departments
CREATE POLICY "Anyone can view visible departments" 
ON public.serve_departments 
FOR SELECT 
USING (is_visible = true);

CREATE POLICY "Pastors can view all departments" 
ON public.serve_departments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pastor_roles 
    WHERE user_id = auth.uid() 
    AND 'department_visibility' = ANY(permissions)
  )
);

CREATE POLICY "Pastors can update departments" 
ON public.serve_departments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.pastor_roles 
    WHERE user_id = auth.uid() 
    AND 'department_visibility' = ANY(permissions)
  )
);

-- Create table for page content management
CREATE TABLE public.page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  section_name TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'text', 'html', 'json'
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_name, section_name)
);

-- Enable RLS for page_content
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Create policies for page_content
CREATE POLICY "Anyone can view published content" 
ON public.page_content 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Pastors can view all content" 
ON public.page_content 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pastor_roles 
    WHERE user_id = auth.uid() 
    AND 'content_management' = ANY(permissions)
  )
);

CREATE POLICY "Pastors can manage content" 
ON public.page_content 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.pastor_roles 
    WHERE user_id = auth.uid() 
    AND 'content_management' = ANY(permissions)
  )
);

-- Insert default serve departments
INSERT INTO public.serve_departments (id, name, description, icon, requirements, time_commitment, display_order) VALUES
('security', 'Security', 'Ensure the safety and security of our church family during services and events.', 'Shield', ARRAY['Background check required', 'Training provided', 'Physical fitness'], 'Sunday services + special events', 1),
('registration', 'Registration', 'Welcome guests and manage attendance tracking for all church services.', 'ClipboardList', ARRAY['Friendly demeanor', 'Basic computer skills', 'Punctuality'], '1-2 Sundays per month', 2),
('ushers', 'Ushers', 'Guide and assist congregation members during services, handle collections.', 'Users', ARRAY['Welcoming personality', 'Knowledge of church layout', 'Team player'], '2-3 Sundays per month', 3),
('sanctuary-keepers', 'Sanctuary Keepers', 'Maintain the cleanliness and organization of our worship spaces.', 'Sparkles', ARRAY['Attention to detail', 'Physical ability', 'Flexible schedule'], 'Weekly cleaning sessions', 4),
('hospitality', 'Hospitality', 'Provide refreshments and create a welcoming atmosphere for all visitors.', 'Coffee', ARRAY['Hospitality heart', 'Food handling knowledge', 'Organization skills'], 'Sunday services', 5),
('host-of-glory', 'Host Of Glory (Worship Team)', 'Lead the congregation in worship through music and song.', 'Music', ARRAY['Musical talent', 'Heart for worship', 'Regular practice attendance'], 'Weekly rehearsals + Sunday services', 6),
('sound-team', 'Sound Team', 'Operate audio equipment to ensure clear sound during all services.', 'Volume2', ARRAY['Technical aptitude', 'Training provided', 'Attention to detail'], 'Sunday services + rehearsals', 7),
('media-team', 'Media Team', 'Handle video production, live streaming, and visual presentations.', 'Camera', ARRAY['Technical skills', 'Creative mindset', 'Equipment knowledge'], 'Sunday services + special events', 8),
('protocol', 'Protocol', 'Assist pastoral staff and coordinate platform activities during services.', 'Crown', ARRAY['Mature faith', 'Organizational skills', 'Discretion'], 'Sunday services + meetings', 9),
('administration', 'Administration', 'Support church operations with office work, data entry, and communication.', 'FileText', ARRAY['Computer skills', 'Organizational abilities', 'Communication skills'], 'Flexible weekday hours', 10),
('sunday-school', 'Sunday School', 'Teach and mentor children, youth, or adults in Bible study classes.', 'GraduationCap', ARRAY['Teaching ability', 'Bible knowledge', 'Background check'], 'Sunday mornings + preparation', 11),
('intercession', 'Intercession', 'Pray for the church, community, and special prayer requests.', 'Heart', ARRAY['Heart for prayer', 'Spiritual maturity', 'Confidentiality'], 'Prayer meetings + personal prayer time', 12);

-- Insert default page content
INSERT INTO public.page_content (page_name, section_name, content_type, content) VALUES
('counseling', 'hero_title', 'text', 'Counseling & Mental Health'),
('counseling', 'hero_description', 'text', 'We believe in caring for the whole person - mind, body, and spirit. Our counseling ministry provides professional support and biblical guidance for life''s challenges.'),
('counseling', 'services', 'json', '[
  {
    "title": "Individual Counseling",
    "description": "One-on-one sessions addressing anxiety, depression, grief, and personal challenges",
    "features": ["Licensed professional counselors", "Biblical counseling approach", "Confidential and safe environment", "Sliding scale fees available"]
  },
  {
    "title": "Marriage & Family",
    "description": "Strengthening relationships and building healthy family dynamics",
    "features": ["Pre-marital counseling", "Marriage enrichment", "Family therapy sessions", "Parenting support groups"]
  },
  {
    "title": "Support Groups",
    "description": "Community-based healing through shared experiences and mutual support",
    "features": ["Grief recovery groups", "Addiction recovery support", "Single parents network", "Mental health awareness"]
  }
]'),
('baptism', 'preparation_content', 'json', '[
  {
    "title": "Understanding Baptism",
    "content": "Baptism is a public declaration of your faith in Jesus Christ and your commitment to follow Him. It symbolizes your death to sin and resurrection to new life in Christ.",
    "estimatedTime": "15 minutes"
  },
  {
    "title": "Biblical Foundation",
    "content": "Scripture teaches us that baptism is an act of obedience that follows salvation. Jesus himself was baptized as an example for us to follow.",
    "estimatedTime": "20 minutes"
  }
]'),
('baby-dedication', 'preparation_content', 'json', '[
  {
    "title": "Purpose of Baby Dedication",
    "content": "Baby dedication is a sacred ceremony where parents publicly commit to raising their child according to biblical principles and the church commits to supporting the family.",
    "estimatedTime": "15 minutes"
  },
  {
    "title": "Parental Commitment",
    "content": "As parents, you are making a covenant before God and the church to be the primary spiritual influence in your child''s life.",
    "estimatedTime": "20 minutes"
  }
]'),
('prophetic-school', 'curriculum_content', 'json', '[
  {
    "title": "Foundations of Prophecy",
    "content": "Understanding the biblical foundation of prophetic ministry and its role in the church today.",
    "estimatedTime": "30 minutes"
  },
  {
    "title": "Hearing God''s Voice",
    "content": "Learning to discern and receive prophetic words from the Holy Spirit.",
    "estimatedTime": "25 minutes"
  }
]');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_pastor_roles_updated_at
  BEFORE UPDATE ON public.pastor_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_serve_departments_updated_at
  BEFORE UPDATE ON public.serve_departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();