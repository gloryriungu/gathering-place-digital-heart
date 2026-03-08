

## Plan: Persist Department Tab Access Control via Database

### Problem
The existing `DepartmentTabManager` (accessible by IT under "Tab Management") uses only local state — toggling tabs has no effect. The admin/IT cannot actually control which tabs the accounts role sees.

### Solution
1. **Create a `department_tab_configs` table** to store which tabs are enabled per department.
2. **Update `DepartmentTabManager`** to read/write from this table.
3. **Update `Dashboard.tsx`** to fetch the accounts tab config and filter the `roleTabs.accounts` list accordingly.

### Database Migration

```sql
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

-- IT and admin can manage
CREATE POLICY "IT can manage tab configs"
  ON public.department_tab_configs FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('it', 'admin', 'founder')
  ));

-- All authenticated users can read (needed to filter their own tabs)
CREATE POLICY "Authenticated users can read tab configs"
  ON public.department_tab_configs FOR SELECT
  TO authenticated
  USING (true);
```

### File Changes

**`src/components/admin/DepartmentTabManager.tsx`**
- On load, fetch rows from `department_tab_configs` for all departments. If no rows exist for a department, use defaults.
- `toggleTab` updates local state as before.
- `saveConfiguration` upserts all tab configs to the database (using `upsert` on `department, tab_id`).

**`src/pages/Dashboard.tsx`**
- Add a `useEffect` that fetches `department_tab_configs` where `department = userRole` (specifically for accounts, but works generically).
- Filter the `roleTabs[userRole]` array to only include tabs where `enabled = true` (or where no config row exists, fall back to the hardcoded default).
- This means IT can disable e.g. "Giving Analysis" or "Requisitions" for the accounts role via the Tab Management interface, and those tabs will disappear from the accounts user's dashboard.

### How It Works
1. IT user goes to Dashboard → Tab Management tab
2. Toggles tabs on/off for the "accounts" department (or any other)
3. Clicks "Save Configuration" → persisted to `department_tab_configs`
4. When an accounts user loads Dashboard, the system fetches their department's config and only shows enabled tabs

