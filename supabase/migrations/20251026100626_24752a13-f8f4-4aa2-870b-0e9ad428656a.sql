-- Add QR code data column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS qr_code_data TEXT;

-- Generate QR codes for existing users (using their user_id as unique identifier)
UPDATE public.profiles 
SET qr_code_data = 'MBRC-' || user_id::text 
WHERE qr_code_data IS NULL;

-- Update the handle_new_user function to include QR code generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_member_id UUID;
  normalized_phone TEXT;
BEGIN
  -- Insert profile with QR code data
  INSERT INTO public.profiles (user_id, first_name, last_name, phone, address, county, qr_code_data)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'county',
    'MBRC-' || NEW.id::text
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Check for existing manual member by phone or email
  IF NEW.raw_user_meta_data ->> 'phone' IS NOT NULL THEN
    normalized_phone := LOWER(REPLACE(REPLACE(REPLACE(NEW.raw_user_meta_data ->> 'phone', '+254', '0'), '-', ''), ' ', ''));
    
    SELECT id INTO existing_member_id
    FROM public.members
    WHERE user_id IS NULL
      AND LOWER(REPLACE(REPLACE(REPLACE(phone, '+254', '0'), '-', ''), ' ', '')) = normalized_phone
    LIMIT 1;
    
    -- If match found, link the member to this new user
    IF existing_member_id IS NOT NULL THEN
      UPDATE public.members
      SET user_id = NEW.id,
          source = 'conversion',
          updated_at = NOW()
      WHERE id = existing_member_id;
    END IF;
  END IF;
  
  -- If no phone match, check by email
  IF existing_member_id IS NULL AND NEW.email IS NOT NULL THEN
    SELECT id INTO existing_member_id
    FROM public.members
    WHERE user_id IS NULL
      AND LOWER(email) = LOWER(NEW.email)
    LIMIT 1;
    
    IF existing_member_id IS NOT NULL THEN
      UPDATE public.members
      SET user_id = NEW.id,
          source = 'conversion',
          updated_at = NOW()
      WHERE id = existing_member_id;
    END IF;
  END IF;
  
  -- Assign IT role to specific email
  IF NEW.email = 'taliemp1911@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'it');
  END IF;
  
  RETURN NEW;
END;
$$;