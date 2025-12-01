-- Create preparation programs table
CREATE TABLE public.preparation_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_type TEXT NOT NULL CHECK (program_type IN ('baptism', 'baby_dedication')),
  title TEXT NOT NULL,
  description TEXT,
  ceremony_date DATE NOT NULL,
  ceremony_time TIME,
  location TEXT,
  max_participants INTEGER,
  registration_deadline DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'completed')),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create program applications table
CREATE TABLE public.program_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  program_id UUID NOT NULL REFERENCES public.preparation_programs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  application_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  resource_access_granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_id)
);

-- Create program resources table
CREATE TABLE public.program_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.preparation_programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  estimated_time INTEGER, -- in minutes
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create program questions table
CREATE TABLE public.program_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.preparation_programs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'text', 'essay')),
  options JSONB, -- for multiple choice questions
  correct_answer TEXT, -- answer or correct option index
  explanation TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create applicant progress table
CREATE TABLE public.applicant_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.program_applications(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.program_resources(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(application_id, resource_id)
);

-- Create applicant responses table
CREATE TABLE public.applicant_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.program_applications(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.program_questions(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  is_correct BOOLEAN,
  pastor_feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(application_id, question_id)
);

-- Enable RLS on all tables
ALTER TABLE public.preparation_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for preparation_programs
CREATE POLICY "Users can view open programs"
  ON public.preparation_programs FOR SELECT
  USING (status = 'open');

CREATE POLICY "Pastors can manage all programs"
  ON public.preparation_programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pastor', 'senior_pastor', 'admin', 'it')
    )
  );

-- RLS Policies for program_applications
CREATE POLICY "Users can create own applications"
  ON public.program_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own applications"
  ON public.program_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pending applications"
  ON public.program_applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Pastors can view all applications"
  ON public.program_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pastor', 'senior_pastor', 'admin', 'it')
    )
  );

CREATE POLICY "Pastors can update applications"
  ON public.program_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pastor', 'senior_pastor', 'admin', 'it')
    )
  );

-- RLS Policies for program_resources
CREATE POLICY "Users with approved applications can view resources"
  ON public.program_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.program_applications
      WHERE program_applications.program_id = program_resources.program_id
      AND program_applications.user_id = auth.uid()
      AND program_applications.resource_access_granted = true
    )
  );

CREATE POLICY "Pastors can manage resources"
  ON public.program_resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pastor', 'senior_pastor', 'admin', 'it')
    )
  );

-- RLS Policies for program_questions
CREATE POLICY "Users with approved applications can view questions"
  ON public.program_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.program_applications
      WHERE program_applications.program_id = program_questions.program_id
      AND program_applications.user_id = auth.uid()
      AND program_applications.resource_access_granted = true
    )
  );

CREATE POLICY "Pastors can manage questions"
  ON public.program_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pastor', 'senior_pastor', 'admin', 'it')
    )
  );

-- RLS Policies for applicant_progress
CREATE POLICY "Users can track own progress"
  ON public.applicant_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.program_applications
      WHERE program_applications.id = applicant_progress.application_id
      AND program_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Pastors can view all progress"
  ON public.applicant_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pastor', 'senior_pastor', 'admin', 'it')
    )
  );

-- RLS Policies for applicant_responses
CREATE POLICY "Users can submit own responses"
  ON public.applicant_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.program_applications
      WHERE program_applications.id = applicant_responses.application_id
      AND program_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own responses"
  ON public.applicant_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.program_applications
      WHERE program_applications.id = applicant_responses.application_id
      AND program_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Pastors can view and manage all responses"
  ON public.applicant_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pastor', 'senior_pastor', 'admin', 'it')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_program_applications_user_id ON public.program_applications(user_id);
CREATE INDEX idx_program_applications_program_id ON public.program_applications(program_id);
CREATE INDEX idx_program_applications_status ON public.program_applications(status);
CREATE INDEX idx_program_resources_program_id ON public.program_resources(program_id);
CREATE INDEX idx_program_questions_program_id ON public.program_questions(program_id);
CREATE INDEX idx_applicant_progress_application_id ON public.applicant_progress(application_id);
CREATE INDEX idx_applicant_responses_application_id ON public.applicant_responses(application_id);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_preparation_programs_updated_at
  BEFORE UPDATE ON public.preparation_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_program_applications_updated_at
  BEFORE UPDATE ON public.program_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_program_resources_updated_at
  BEFORE UPDATE ON public.program_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_program_questions_updated_at
  BEFORE UPDATE ON public.program_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applicant_responses_updated_at
  BEFORE UPDATE ON public.applicant_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();