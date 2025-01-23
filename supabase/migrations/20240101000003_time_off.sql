-- Create function to get user data by IDs
CREATE OR REPLACE FUNCTION get_users_by_ids(user_ids uuid[])
RETURNS TABLE (
  id uuid,
  email text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT u.id, u.email::text
  FROM auth.users u
  WHERE u.id = ANY(user_ids);
$$;

-- Create function to get time off requests with user details
CREATE OR REPLACE FUNCTION get_time_off_requests()
RETURNS TABLE (
  id uuid,
  employee_id uuid,
  employee_email text,
  employee_full_name text,
  start_date date,
  end_date date,
  type time_off_type_enum,
  status time_off_status_enum,
  notes text,
  reviewed_by uuid,
  reviewer_email text,
  reviewer_full_name text,
  reviewed_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.employee_id,
    e.email::text as employee_email,
    ep.full_name as employee_full_name,
    r.start_date,
    r.end_date,
    r.type,
    r.status,
    r.notes,
    r.reviewed_by,
    rv.email::text as reviewer_email,
    rp.full_name as reviewer_full_name,
    r.reviewed_at,
    r.submitted_at,
    r.created_at,
    r.updated_at
  FROM time_off_requests r
  LEFT JOIN auth.users e ON e.id = r.employee_id
  LEFT JOIN profiles ep ON ep.id = r.employee_id
  LEFT JOIN auth.users rv ON rv.id = r.reviewed_by
  LEFT JOIN profiles rp ON rp.id = r.reviewed_by
  WHERE (
    auth.uid() = r.employee_id
    OR EXISTS (
      SELECT 1 FROM employees emp
      WHERE emp.id = auth.uid()
      AND emp.user_role IN ('Manager', 'Admin')
    )
  )
  ORDER BY r.submitted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_time_off_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_time_off_requests_updated_at ON time_off_requests;
CREATE TRIGGER update_time_off_requests_updated_at
  BEFORE UPDATE ON time_off_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_time_off_updated_at();

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own time off requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Users can view their own time off requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Managers can update time off request status" ON public.time_off_requests;
DROP POLICY IF EXISTS "Managers can view all time off requests" ON public.time_off_requests;

-- Create time off request policies
CREATE POLICY "Users can create their own time off requests" ON public.time_off_requests
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Users can view their own time off requests" ON public.time_off_requests
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Managers can update time off request status" ON public.time_off_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM employees emp
      WHERE emp.id = auth.uid()
      AND emp.user_role IN ('Manager', 'Admin')
    )
  );

CREATE POLICY "Managers can view all time off requests" ON public.time_off_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees emp
      WHERE emp.id = auth.uid()
      AND emp.user_role IN ('Manager', 'Admin')
    )
  );

-- Grant function permissions
GRANT EXECUTE ON FUNCTION get_users_by_ids(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_time_off_requests() TO authenticated; 