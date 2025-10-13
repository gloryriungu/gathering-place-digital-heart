-- Update the generate_member_number function to generate random member numbers
CREATE OR REPLACE FUNCTION public.generate_member_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_member_number TEXT;
  random_string TEXT;
BEGIN
  -- Loop until we find a unique member number
  LOOP
    -- Generate a random 8-character alphanumeric string (lowercase letters and numbers)
    random_string := lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    new_member_number := 'MBR' || random_string;
    
    -- Check if this member number already exists
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE member_number = new_member_number) THEN
      EXIT; -- Exit loop if unique
    END IF;
  END LOOP;
  
  RETURN new_member_number;
END;
$function$;