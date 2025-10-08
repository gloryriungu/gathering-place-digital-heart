-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.media_content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  county TEXT,
  number_of_attendees INTEGER NOT NULL DEFAULT 1,
  special_requirements TEXT,
  registered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  registration_type TEXT NOT NULL DEFAULT 'self' CHECK (registration_type IN ('self', 'behalf_of_other')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'waitlist')),
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for event_registrations
CREATE POLICY "Anyone can create registrations"
ON public.event_registrations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can view their own registrations"
ON public.event_registrations
FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() = registered_by
);

CREATE POLICY "Marketing and media can view all registrations"
ON public.event_registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('marketing', 'media', 'admin', 'it')
  )
);

CREATE POLICY "Marketing and media can update registrations"
ON public.event_registrations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('marketing', 'media', 'admin', 'it')
  )
);

CREATE POLICY "Marketing and media can delete registrations"
ON public.event_registrations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('marketing', 'media', 'admin', 'it')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_event_registrations_updated_at
BEFORE UPDATE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX idx_event_registrations_email ON public.event_registrations(email);
CREATE INDEX idx_event_registrations_status ON public.event_registrations(status);

-- Add constraint to prevent duplicate registrations per email per event
CREATE UNIQUE INDEX unique_email_per_event ON public.event_registrations(event_id, email) 
WHERE status != 'cancelled';