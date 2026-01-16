-- Create rate limiting table for tracking API requests
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_endpoint 
ON public.rate_limit_tracking (identifier, endpoint, window_start);

-- Enable RLS
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (edge functions use service role)
CREATE POLICY "Service role only"
ON public.rate_limit_tracking
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create cleanup function to remove old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_records()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limit_tracking 
  WHERE window_start < now() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;