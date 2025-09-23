-- Add member_number field to members table for user-friendly identifiers
ALTER TABLE public.members 
ADD COLUMN member_number TEXT UNIQUE;

-- Create a function to generate sequential member numbers
CREATE OR REPLACE FUNCTION public.generate_member_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_number FROM 4) AS INTEGER)), 0) + 1 
  INTO next_num 
  FROM public.members 
  WHERE member_number IS NOT NULL;
  
  RETURN 'MBR' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-assign member numbers
CREATE OR REPLACE FUNCTION public.set_member_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_number IS NULL OR NEW.member_number = '' THEN
    NEW.member_number := generate_member_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger to members table
CREATE TRIGGER set_member_number_trigger
  BEFORE INSERT ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_member_number();

-- Update existing members without member numbers
UPDATE public.members 
SET member_number = generate_member_number()
WHERE member_number IS NULL;