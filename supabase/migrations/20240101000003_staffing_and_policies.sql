-- Create staffing requirements table
CREATE TABLE IF NOT EXISTS "public"."staffing_requirements" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "period_name" text NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "minimum_employees" integer NOT NULL,
    "shift_supervisor_required" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "staffing_requirements_pkey" PRIMARY KEY ("id")
);

-- Enable RLS
ALTER TABLE "public"."staffing_requirements" ENABLE ROW LEVEL SECURITY;

-- Create staffing requirement policies
CREATE POLICY "Managers can manage staffing requirements"
ON public.staffing_requirements
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND user_role IN ('Manager', 'Admin')
    )
);

CREATE POLICY "Authenticated users can view staffing requirements"
ON public.staffing_requirements
FOR SELECT
USING (auth.role() = 'authenticated'::text);

-- Create employee deletion function
CREATE OR REPLACE FUNCTION public.delete_employee_transaction(p_employee_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employee_exists boolean;
BEGIN
  -- Check if employee exists first
  SELECT EXISTS (
    SELECT 1 
    FROM public.employees e
    WHERE e.id = p_employee_id
  ) INTO v_employee_exists;

  IF NOT v_employee_exists THEN
    RAISE EXCEPTION 'Employee with ID % does not exist', p_employee_id;
  END IF;

  -- Start explicit transaction
  BEGIN
    -- Lock the employee record first to prevent concurrent modifications
    PERFORM id 
    FROM public.employees e
    WHERE e.id = p_employee_id
    FOR UPDATE;

    -- Delete employee schedules first
    DELETE FROM public.schedules s
    WHERE s.employee_id = p_employee_id;
    
    -- Delete time off requests
    DELETE FROM public.time_off_requests t
    WHERE t.employee_id = p_employee_id;
    
    -- Delete employee record
    DELETE FROM public.employees e
    WHERE e.id = p_employee_id;
    
    -- Delete profile
    DELETE FROM public.profiles p
    WHERE p.id = p_employee_id;
    
    -- Note: auth.delete_user is handled by Supabase's GoTrue service
    -- In production, the user will be deleted via the Supabase client

  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to delete employee: %', SQLERRM;
  END;
END;
$$;

-- Create policy for profile deletions
CREATE POLICY "Enable admin profile deletion"
ON public.profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.delete_employee_transaction(uuid) TO authenticated;

-- Ensure function is visible to PostgREST
COMMENT ON FUNCTION public.delete_employee_transaction(uuid) IS 'Delete an employee and all related records';

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Additional cache invalidation
SELECT pg_notify('pgrst', 'reload config');
SELECT pg_notify('pgrst', 'reload cache'); 