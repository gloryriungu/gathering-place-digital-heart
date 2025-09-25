-- Add missing tables for complete role-based functionality

-- Requisitions table for department budget/item requests
CREATE TABLE public.requisitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id TEXT NOT NULL,
  requested_by UUID NOT NULL,
  approved_by UUID,
  request_type TEXT NOT NULL CHECK (request_type IN ('budget', 'inventory', 'maintenance', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  reason TEXT,
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_by DATE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pastor availability for counseling sessions
CREATE TABLE public.pastor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pastor_id UUID NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_duration INTEGER NOT NULL DEFAULT 60, -- minutes
  max_sessions INTEGER NOT NULL DEFAULT 4,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pastor_id, day_of_week, start_time)
);

-- Counseling session bookings
CREATE TABLE public.counseling_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pastor_id UUID NOT NULL,
  member_id UUID NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  session_type TEXT NOT NULL DEFAULT 'general' CHECK (session_type IN ('general', 'marriage', 'family', 'grief', 'addiction', 'spiritual')),
  notes TEXT,
  member_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activity logs for tracking all user actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Budget proposals for accounts department
CREATE TABLE public.budget_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID NOT NULL,
  department_id TEXT NOT NULL,
  proposal_type TEXT NOT NULL DEFAULT 'weekly' CHECK (proposal_type IN ('weekly', 'monthly', 'quarterly', 'annual', 'special')),
  amount DECIMAL NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  description TEXT NOT NULL,
  justification TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_required')),
  reviewed_by UUID,
  review_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics events for advanced tracking
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  user_id UUID,
  session_id TEXT,
  properties JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pastor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger to tables that need it
CREATE TRIGGER update_requisitions_updated_at
  BEFORE UPDATE ON public.requisitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pastor_availability_updated_at
  BEFORE UPDATE ON public.pastor_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counseling_sessions_updated_at
  BEFORE UPDATE ON public.counseling_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_proposals_updated_at
  BEFORE UPDATE ON public.budget_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();