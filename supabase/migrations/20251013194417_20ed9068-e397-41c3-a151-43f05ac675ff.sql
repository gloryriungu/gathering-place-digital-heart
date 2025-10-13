-- Update the generate_member_number function to generate user-friendly random numeric member numbers
CREATE OR REPLACE FUNCTION public.generate_member_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_member_number TEXT;
  random_number TEXT;
BEGIN
  -- Loop until we find a unique member number
  LOOP
    -- Generate a random 7-digit number and pad with zeros
    random_number := LPAD(floor(random() * 10000000)::text, 7, '0');
    new_member_number := 'MBR' || random_number;
    
    -- Check if this member number already exists
    IF NOT EXISTS (SELECT 1 FROM public.members WHERE member_number = new_member_number) THEN
      EXIT; -- Exit loop if unique
    END IF;
  END LOOP;
  
  RETURN new_member_number;
END;
$function$;