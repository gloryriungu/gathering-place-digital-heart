CREATE TABLE public.department_tab_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department text NOT NULL,
  tab_id text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(department, tab_id)
);

ALTER TABLE public.department_tab_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "IT admin founder can manage tab configs"
  ON public.department_tab_configs FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('it', 'admin', 'founder')
  ));

CREATE POLICY "Authenticated users can read tab configs"
  ON public.department_tab_configs FOR SELECT
  TO authenticated
  USING (true);