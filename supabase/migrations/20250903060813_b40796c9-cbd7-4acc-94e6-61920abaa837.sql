-- Create reports table for reporting functionality
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'generating',
  period TEXT NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  file_url TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security_events table for security monitoring
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  severity TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_logs table for system logging
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_level TEXT NOT NULL,
  category TEXT NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for reports table
CREATE POLICY "IT users can manage all reports" 
ON public.reports 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'it'::app_role
));

CREATE POLICY "Users can view their own reports" 
ON public.reports 
FOR SELECT 
USING (generated_by = auth.uid());

-- Create policies for security_events table
CREATE POLICY "IT users can manage security events" 
ON public.security_events 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'it'::app_role
));

-- Create policies for system_logs table
CREATE POLICY "IT users can manage system logs" 
ON public.system_logs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'it'::app_role
));

-- Add triggers for updated_at columns
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.reports (title, description, type, status, period, generated_by) VALUES
('Monthly Attendance Report', 'December 2024 attendance summary', 'attendance', 'ready', 'monthly', (SELECT id FROM auth.users LIMIT 1)),
('Q4 Financial Summary', 'October-December financial overview', 'financial', 'ready', 'quarterly', (SELECT id FROM auth.users LIMIT 1)),
('Annual Membership Report', '2024 membership growth and statistics', 'membership', 'generating', 'annual', (SELECT id FROM auth.users LIMIT 1));

INSERT INTO public.security_events (event_type, description, source, action_taken, severity) VALUES
('blocked', 'Multiple failed login attempts detected', 'Authentication System', 'IP temporarily blocked', 'medium'),
('warning', 'Unusual access pattern detected', 'Security Monitor', 'Flagged for review', 'low'),
('info', 'Security scan completed successfully', 'System', 'No threats found', 'low');

INSERT INTO public.system_logs (log_level, category, action, details, ip_address) VALUES
('info', 'Authentication', 'User Login', 'Successful authentication', '127.0.0.1'),
('warning', 'System', 'High CPU Usage', 'Server load above 80%', 'localhost'),
('error', 'Database', 'Connection Error', 'Failed to establish database connection', 'localhost');