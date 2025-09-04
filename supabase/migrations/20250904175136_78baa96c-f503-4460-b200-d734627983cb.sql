-- Add 'media' role to the existing app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'media';

-- Create media_content table for managing all media content
CREATE TABLE public.media_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'live_stream', 'event', 'product', 'announcement', 'hero_content'
  title TEXT NOT NULL,
  description TEXT,
  content_data JSONB NOT NULL DEFAULT '{}', -- Flexible storage for different content types
  image_url TEXT,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
  priority INTEGER DEFAULT 0, -- For ordering content
  publish_date TIMESTAMP WITH TIME ZONE,
  expire_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on media_content
ALTER TABLE public.media_content ENABLE ROW LEVEL SECURITY;

-- Create policies for media_content
CREATE POLICY "Media users can manage all content" 
  ON public.media_content 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'media'::app_role
  ));

CREATE POLICY "IT users can manage all content" 
  ON public.media_content 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'it'::app_role
  ));

CREATE POLICY "Users can view published content" 
  ON public.media_content 
  FOR SELECT 
  USING (status = 'published');

-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('event-posters', 'event-posters', true),
  ('product-images', 'product-images', true),
  ('hero-media', 'hero-media', true),
  ('announcements', 'announcements', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for event-posters bucket
CREATE POLICY "Anyone can view event posters" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'event-posters');

CREATE POLICY "Media users can upload event posters" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'event-posters' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

CREATE POLICY "Media users can update event posters" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'event-posters' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

CREATE POLICY "Media users can delete event posters" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'event-posters' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

-- Create storage policies for product-images bucket
CREATE POLICY "Anyone can view product images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'product-images');

CREATE POLICY "Media users can upload product images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'product-images' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

CREATE POLICY "Media users can update product images" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'product-images' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

CREATE POLICY "Media users can delete product images" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'product-images' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

-- Create storage policies for hero-media bucket
CREATE POLICY "Anyone can view hero media" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'hero-media');

CREATE POLICY "Media users can upload hero media" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'hero-media' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

CREATE POLICY "Media users can update hero media" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'hero-media' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

CREATE POLICY "Media users can delete hero media" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'hero-media' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

-- Create storage policies for announcements bucket
CREATE POLICY "Anyone can view announcements" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'announcements');

CREATE POLICY "Media users can upload announcements" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'announcements' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

CREATE POLICY "Media users can update announcements" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'announcements' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

CREATE POLICY "Media users can delete announcements" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'announcements' AND 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('media'::app_role, 'it'::app_role)
    )
  );

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_media_content_updated_at
  BEFORE UPDATE ON public.media_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample media content
INSERT INTO public.media_content (content_type, title, description, content_data, status, created_by) 
VALUES 
  (
    'live_stream',
    'Sunday Service Live Stream',
    'Main Sunday service broadcast',
    '{"youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "is_live": false, "scheduled_time": "09:00", "duration": "120"}',
    'published',
    (SELECT user_id FROM public.user_roles WHERE role = 'it' LIMIT 1)
  ),
  (
    'hero_content',
    'Welcome Hero Section',
    'Main homepage hero content',
    '{"heading": "WELCOME TO TOT INTERNATIONAL", "subheading": "A ministry committed to raising champions for Christ", "background_video": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}',
    'published',
    (SELECT user_id FROM public.user_roles WHERE role = 'it' LIMIT 1)
  )
ON CONFLICT DO NOTHING;