-- Add county and occupation fields to join_family_applications table
ALTER TABLE public.join_family_applications
ADD COLUMN IF NOT EXISTS county text,
ADD COLUMN IF NOT EXISTS occupation text;

-- Add county and occupation fields to profiles table for consistency
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS occupation text;

-- Create index for better query performance on location analytics
CREATE INDEX IF NOT EXISTS idx_join_family_applications_county 
ON public.join_family_applications(county);

CREATE INDEX IF NOT EXISTS idx_join_family_applications_occupation 
ON public.join_family_applications(occupation);

-- Add comments for documentation
COMMENT ON COLUMN public.join_family_applications.county IS 'County/region where the applicant resides';
COMMENT ON COLUMN public.join_family_applications.occupation IS 'Applicant occupation/profession';
COMMENT ON COLUMN public.profiles.occupation IS 'User occupation/profession';