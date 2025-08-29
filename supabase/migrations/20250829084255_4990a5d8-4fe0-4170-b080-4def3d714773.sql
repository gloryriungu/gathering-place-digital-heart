-- Add contact and location fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT,
ADD COLUMN address TEXT,
ADD COLUMN county TEXT;

-- Add comment for the county field
COMMENT ON COLUMN public.profiles.county IS 'Kenya county where the user resides';