-- Add social media department to serve_departments table
INSERT INTO public.serve_departments (
  id,
  name,
  description,
  icon,
  requirements,
  time_commitment,
  is_visible,
  display_order
) VALUES (
  'social-media',
  'Social Media',
  'Manage and create content for our online presence across social media platforms.',
  'Share',
  ARRAY['Creative skills', 'Social media knowledge', 'Content creation ability', 'Brand awareness'],
  'Flexible hours for content creation and posting',
  true,
  13
);