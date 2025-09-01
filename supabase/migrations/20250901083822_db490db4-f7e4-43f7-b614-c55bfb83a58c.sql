-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  submitted_by UUID NOT NULL,
  assigned_to UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (submitted_by) REFERENCES auth.users(id),
  FOREIGN KEY (assigned_to) REFERENCES auth.users(id)
);

-- Create ticket messages/comments table
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create system metrics table for monitoring
CREATE TABLE public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support tickets
CREATE POLICY "IT users can manage all tickets" 
ON public.support_tickets 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'it'
));

CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (submitted_by = auth.uid());

CREATE POLICY "Users can create tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (submitted_by = auth.uid());

-- RLS Policies for ticket messages
CREATE POLICY "IT users can manage all ticket messages" 
ON public.ticket_messages 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'it'
));

CREATE POLICY "Users can view messages on their tickets" 
ON public.ticket_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.support_tickets 
  WHERE id = ticket_id AND submitted_by = auth.uid()
));

CREATE POLICY "Users can add messages to tickets" 
ON public.ticket_messages 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- RLS Policies for system metrics (IT only)
CREATE POLICY "IT users can manage system metrics" 
ON public.system_metrics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'it'
));

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1 
  INTO next_num 
  FROM public.support_tickets;
  
  RETURN 'TCK-' || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.support_tickets (ticket_number, title, description, priority, status, category, department, submitted_by) 
VALUES 
  ('TCK-001', 'Login Issues - Password Reset Required', 'Multiple users reporting login problems after system update', 'high', 'open', 'Authentication', 'Registration', 'b01490bf-ef0c-4e6e-8f31-7802ff4a267e'),
  ('TCK-002', 'Financial Report Generation Slow', 'Monthly financial reports taking too long to generate', 'medium', 'in-progress', 'Performance', 'Accounts', 'b01490bf-ef0c-4e6e-8f31-7802ff4a267e');