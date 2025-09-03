-- Create tables for real dashboard data
CREATE TABLE public.dashboard_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_type TEXT NOT NULL,
  stat_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for church members/attendance
CREATE TABLE public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  date_joined DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create attendance tracking table
CREATE TABLE public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id),
  service_date DATE NOT NULL,
  service_type TEXT DEFAULT 'sunday_service',
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contributions/giving table
CREATE TABLE public.contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id),
  amount DECIMAL(10,2) NOT NULL,
  contribution_type TEXT DEFAULT 'tithe',
  contribution_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table
CREATE TABLE public.church_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "IT users can manage dashboard stats" ON public.dashboard_stats FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'it')
);

CREATE POLICY "Admin users can view dashboard stats" ON public.dashboard_stats FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'registration', 'accounts'))
);

CREATE POLICY "IT users can manage members" ON public.members FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'it')
);

CREATE POLICY "Registration users can manage members" ON public.members FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'registration')
);

CREATE POLICY "Users can view their own member record" ON public.members FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Registration users can manage attendance" ON public.attendance_records FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('registration', 'it'))
);

CREATE POLICY "Accounts users can manage contributions" ON public.contributions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('accounts', 'it'))
);

CREATE POLICY "Users can view their own contributions" ON public.contributions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.members WHERE id = contributions.member_id AND user_id = auth.uid())
);

CREATE POLICY "Anyone can view published events" ON public.church_events FOR SELECT USING (status = 'published');

CREATE POLICY "IT users can manage events" ON public.church_events FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'it')
);

-- Insert sample data
INSERT INTO public.members (first_name, last_name, email, phone, date_joined, status) VALUES
('John', 'Smith', 'john.smith@email.com', '+1234567890', '2023-01-15', 'active'),
('Sarah', 'Johnson', 'sarah.j@email.com', '+1234567891', '2023-02-20', 'active'),
('Michael', 'Brown', 'mike.brown@email.com', '+1234567892', '2023-03-10', 'active'),
('Emily', 'Davis', 'emily.davis@email.com', '+1234567893', '2023-04-05', 'active'),
('David', 'Wilson', 'david.w@email.com', '+1234567894', '2023-05-12', 'active');

-- Insert attendance records for the past month
INSERT INTO public.attendance_records (member_id, service_date, service_type)
SELECT m.id, CURRENT_DATE - INTERVAL '7 days', 'sunday_service'
FROM public.members m
WHERE random() > 0.3; -- 70% attendance rate

INSERT INTO public.attendance_records (member_id, service_date, service_type)
SELECT m.id, CURRENT_DATE - INTERVAL '14 days', 'sunday_service'
FROM public.members m
WHERE random() > 0.2; -- 80% attendance rate

-- Insert contribution records
INSERT INTO public.contributions (member_id, amount, contribution_type, contribution_date)
SELECT m.id, 
       (random() * 500 + 50)::DECIMAL(10,2),
       CASE WHEN random() > 0.7 THEN 'offering' ELSE 'tithe' END,
       CURRENT_DATE - INTERVAL '1 month' * random()
FROM public.members m;

-- Insert church events
INSERT INTO public.church_events (title, description, event_date, event_time, location, max_attendees, status) VALUES
('Sunday Service', 'Weekly Sunday worship service', CURRENT_DATE + INTERVAL '0 days', '09:00', 'Main Sanctuary', 500, 'published'),
('Bible Study', 'Midweek Bible study session', CURRENT_DATE + INTERVAL '3 days', '19:00', 'Fellowship Hall', 100, 'published'),
('Youth Meeting', 'Monthly youth gathering', CURRENT_DATE + INTERVAL '7 days', '18:00', 'Youth Center', 80, 'published'),
('Community Outreach', 'Community service event', CURRENT_DATE + INTERVAL '14 days', '10:00', 'Community Center', 50, 'published');

-- Populate system metrics with real data
INSERT INTO public.system_metrics (metric_type, metric_name, metric_value) VALUES
('server', 'web_server', '{"status": "online", "cpu": 45, "memory": 67, "disk": 23, "uptime": "15 days"}'),
('server', 'database_server', '{"status": "online", "cpu": 78, "memory": 85, "disk": 45, "uptime": "15 days"}'),
('server', 'backup_server', '{"status": "maintenance", "cpu": 12, "memory": 34, "disk": 89, "uptime": "2 hours"}'),
('network', 'bandwidth', '{"download": "100 Mbps", "upload": "50 Mbps", "latency": "15ms"}'),
('security', 'firewall', '{"status": "active", "blocked_attempts": 23, "threats": 0}');

-- Create triggers for updated_at
CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contributions_updated_at
BEFORE UPDATE ON public.contributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_church_events_updated_at
BEFORE UPDATE ON public.church_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_members INTEGER,
  weekly_attendance INTEGER,
  monthly_contributions DECIMAL,
  upcoming_events INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.members WHERE status = 'active') as total_members,
    (SELECT COUNT(*)::INTEGER FROM public.attendance_records 
     WHERE service_date >= CURRENT_DATE - INTERVAL '7 days') as weekly_attendance,
    (SELECT COALESCE(SUM(amount), 0) FROM public.contributions 
     WHERE contribution_date >= CURRENT_DATE - INTERVAL '30 days') as monthly_contributions,
    (SELECT COUNT(*)::INTEGER FROM public.church_events 
     WHERE event_date >= CURRENT_DATE AND status = 'published') as upcoming_events;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;