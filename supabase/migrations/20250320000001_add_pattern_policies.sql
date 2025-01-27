-- Create employee role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE employee_role_enum AS ENUM ('Dispatcher', 'Shift Supervisor', 'Manager');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enable RLS on shift_patterns table
ALTER TABLE public.shift_patterns ENABLE ROW LEVEL SECURITY;

-- Create policies for shift_patterns table
CREATE POLICY "Managers can create patterns"
  ON public.shift_patterns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = auth.uid()
      AND e.employee_role::text IN ('Manager', 'Shift Supervisor')
    )
  );

CREATE POLICY "Managers can update patterns"
  ON public.shift_patterns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = auth.uid()
      AND e.employee_role::text IN ('Manager', 'Shift Supervisor')
    )
  );

CREATE POLICY "Managers can delete patterns"
  ON public.shift_patterns
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = auth.uid()
      AND e.employee_role::text IN ('Manager', 'Shift Supervisor')
    )
  );

CREATE POLICY "All authenticated users can view patterns"
  ON public.shift_patterns
  FOR SELECT
  TO authenticated
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.shift_patterns IS 'Shift patterns for employee scheduling. Only managers and shift supervisors can create/update/delete patterns, but all authenticated users can view them.'; 