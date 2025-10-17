-- Phase 1: Add tracking columns to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'web_signup', 'import', 'conversion')),
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS import_batch_id UUID;

-- Create index for faster phone lookup (normalized format)
CREATE INDEX IF NOT EXISTS idx_members_phone_normalized 
ON public.members(LOWER(REPLACE(REPLACE(REPLACE(phone, '+254', '0'), '-', ''), ' ', '')));

-- Create member_import_batches table
CREATE TABLE IF NOT EXISTS public.member_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by UUID NOT NULL,
  file_name TEXT NOT NULL,
  total_records INTEGER NOT NULL,
  successful INTEGER DEFAULT 0,
  duplicates INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.member_import_batches ENABLE ROW LEVEL SECURITY;

-- RLS policies for import batches
CREATE POLICY "Registration and IT can view import batches"
ON public.member_import_batches
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('registration', 'it')
  )
);

CREATE POLICY "Registration and IT can create import batches"
ON public.member_import_batches
FOR INSERT
WITH CHECK (
  imported_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('registration', 'it')
  )
);

-- Create member_import_logs table
CREATE TABLE IF NOT EXISTS public.member_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.member_import_batches(id) ON DELETE CASCADE NOT NULL,
  row_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'duplicate', 'failed', 'skipped')),
  data JSONB NOT NULL,
  error_message TEXT,
  member_id UUID REFERENCES public.members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.member_import_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for import logs
CREATE POLICY "Registration and IT can view import logs"
ON public.member_import_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('registration', 'it')
  )
);

CREATE POLICY "Registration and IT can create import logs"
ON public.member_import_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('registration', 'it')
  )
);

-- Create member_link_suggestions table
CREATE TABLE IF NOT EXISTS public.member_link_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  profile_user_id UUID NOT NULL,
  confidence_score INTEGER NOT NULL,
  match_reasons JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.member_link_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for link suggestions
CREATE POLICY "Registration and IT can manage link suggestions"
ON public.member_link_suggestions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('registration', 'it')
  )
);

-- Update handle_new_user() trigger to auto-link existing manual members
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  existing_member_id UUID;
  normalized_phone TEXT;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, first_name, last_name, phone, address, county)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'county'
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