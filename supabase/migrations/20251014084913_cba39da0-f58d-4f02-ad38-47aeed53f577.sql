-- Create storage bucket for About Us page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('about-us', 'about-us', true);

-- Allow marketing and IT users to upload images
CREATE POLICY "Marketing users can upload about-us images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'about-us' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('marketing'::app_role, 'it'::app_role)
  )
);

-- Allow marketing and IT users to update images
CREATE POLICY "Marketing users can update about-us images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'about-us' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('marketing'::app_role, 'it'::app_role)
  )
);

-- Allow marketing and IT users to delete images
CREATE POLICY "Marketing users can delete about-us images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'about-us' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('marketing'::app_role, 'it'::app_role)
  )
);

-- Allow anyone to view about-us images (public bucket)
CREATE POLICY "Anyone can view about-us images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'about-us');