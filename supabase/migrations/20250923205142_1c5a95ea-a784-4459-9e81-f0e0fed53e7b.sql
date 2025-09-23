-- Fix search_path security issues for the functions created
CREATE OR REPLACE FUNCTION public.generate_member_number()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_number FROM 4) AS INTEGER)), 0) + 1 
  INTO next_num 
  FROM public.members 
  WHERE member_number IS NOT NULL;
  
  RETURN 'MBR' || LPAD(next_num::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_member_number()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  IF NEW.member_number IS NULL OR NEW.member_number = '' THEN
    NEW.member_number := generate_member_number();
  END IF;
  RETURN NEW;
END;
$$;