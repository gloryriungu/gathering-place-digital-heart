-- Add RLS policy to allow public newsletter subscriptions
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
TO public
WITH CHECK (true);