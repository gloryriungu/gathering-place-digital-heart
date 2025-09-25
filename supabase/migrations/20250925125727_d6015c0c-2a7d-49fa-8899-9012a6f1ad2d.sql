-- Create join_family_applications table (prerequisite for ministry/serve joining)
CREATE TABLE IF NOT EXISTS public.join_family_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  baptism_status TEXT NOT NULL, -- 'baptized', 'not_baptized', 'interested'
  previous_church TEXT,
  ministry_interests TEXT[], -- Array of ministry interests
  volunteer_interests TEXT[], -- Array of volunteer/serve interests
  testimony TEXT,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ministries table for actual ministries management
CREATE TABLE IF NOT EXISTS public.ministries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  leader_id UUID,
  requirements TEXT[],
  meeting_schedule TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  max_members INTEGER,
  current_members INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ministry_members junction table
CREATE TABLE IF NOT EXISTS public.ministry_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  role TEXT DEFAULT 'member', -- 'leader', 'assistant', 'member'
  UNIQUE(ministry_id, user_id)
);

-- Create serve_applications table for department joining
CREATE TABLE IF NOT EXISTS public.serve_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  department_id TEXT NOT NULL,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create department_inventory table
CREATE TABLE IF NOT EXISTS public.department_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  quantity_available INTEGER DEFAULT 0,
  unit_value DECIMAL(10,2),
  location TEXT,
  condition TEXT, -- 'new', 'good', 'fair', 'poor'
  purchase_date DATE,
  warranty_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory_transactions table for tracking in/out
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'out', 'in', 'damaged', 'lost'
  quantity INTEGER NOT NULL,
  event_name TEXT,
  event_date DATE,
  handled_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.join_family_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serve_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;