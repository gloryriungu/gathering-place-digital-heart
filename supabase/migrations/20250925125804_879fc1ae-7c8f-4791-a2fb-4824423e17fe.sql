-- RLS Policies for join_family_applications
CREATE POLICY "Users can create own applications" ON public.join_family_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own applications" ON public.join_family_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin and registration can manage applications" ON public.join_family_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'registration', 'it')
    )
  );

-- RLS Policies for ministries
CREATE POLICY "Anyone can view active ministries" ON public.ministries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage ministries" ON public.ministries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'it')
    )
  );

-- RLS Policies for ministry_members
CREATE POLICY "Users can view own ministry memberships" ON public.ministry_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage ministry memberships" ON public.ministry_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'it')
    )
  );

-- RLS Policies for serve_applications
CREATE POLICY "Users can create own serve applications" ON public.serve_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own serve applications" ON public.serve_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage serve applications" ON public.serve_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'registration', 'it')
    )
  );

-- RLS Policies for department_inventory
CREATE POLICY "Department members can view their inventory" ON public.department_inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role::text = department_id
    )
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'accounts', 'senior_pastor', 'founder', 'it')
    )
  );

CREATE POLICY "Department members can manage their inventory" ON public.department_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role::text = department_id
    )
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'it')
    )
  );

-- RLS Policies for inventory_transactions
CREATE POLICY "Department members can view their transactions" ON public.inventory_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM department_inventory di
      JOIN user_roles ur ON ur.role::text = di.department_id
      WHERE di.id = inventory_item_id 
      AND ur.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'accounts', 'senior_pastor', 'founder', 'it')
    )
  );

CREATE POLICY "Department members can create transactions" ON public.inventory_transactions
  FOR INSERT WITH CHECK (
    auth.uid() = handled_by 
    AND EXISTS (
      SELECT 1 FROM department_inventory di
      JOIN user_roles ur ON ur.role::text = di.department_id
      WHERE di.id = inventory_item_id 
      AND ur.user_id = auth.uid()
    )
  );

-- Add foreign key constraints
ALTER TABLE public.join_family_applications ADD CONSTRAINT fk_join_family_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.ministry_members ADD CONSTRAINT fk_ministry_members_ministry FOREIGN KEY (ministry_id) REFERENCES public.ministries(id) ON DELETE CASCADE;
ALTER TABLE public.ministry_members ADD CONSTRAINT fk_ministry_members_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.serve_applications ADD CONSTRAINT fk_serve_applications_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.serve_applications ADD CONSTRAINT fk_serve_applications_dept FOREIGN KEY (department_id) REFERENCES public.serve_departments(id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT fk_inventory_trans_item FOREIGN KEY (inventory_item_id) REFERENCES public.department_inventory(id) ON DELETE CASCADE;