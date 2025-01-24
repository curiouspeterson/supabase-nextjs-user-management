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

-- Drop existing function and type
DROP FUNCTION IF EXISTS public.delete_employee_transaction(uuid);
DROP FUNCTION IF EXISTS public.delete_employee_transaction(p_employee_id uuid);

-- Clear schema cache
SELECT pg_stat_clear_snapshot();
SELECT pg_notify('pgrst', 'reload schema');

-- Create employee deletion function
CREATE OR REPLACE FUNCTION public.delete_employee_transaction(p_employee_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employee_exists boolean;
  v_error_message text;
BEGIN
  -- Check if employee exists first
  SELECT EXISTS (
    SELECT 1 
    FROM public.employees emp
    WHERE emp.id = p_employee_id
  ) INTO v_employee_exists;

  IF NOT v_employee_exists THEN
    RAISE EXCEPTION 'Employee with ID % does not exist', p_employee_id;
  END IF;

  -- Start explicit transaction
  BEGIN
    -- Lock the employee record first to prevent concurrent modifications
    PERFORM emp.id 
    FROM public.employees emp
    WHERE emp.id = p_employee_id
    FOR UPDATE;

    -- Delete employee schedules first
    DELETE FROM public.schedules sch
    WHERE sch.employee_id = p_employee_id;
    
    -- Delete time off requests
    DELETE FROM public.time_off_requests tor
    WHERE tor.employee_id = p_employee_id;
    
    -- Delete employee record
    DELETE FROM public.employees emp
    WHERE emp.id = p_employee_id;
    
    -- Delete profile
    DELETE FROM public.profiles prf
    WHERE prf.id = p_employee_id;

  EXCEPTION
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
      RAISE EXCEPTION 'Failed to delete employee: %', v_error_message;
  END;
END;
$$;

-- Drop any existing grants
REVOKE ALL ON FUNCTION public.delete_employee_transaction(p_employee_id uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_employee_transaction(p_employee_id uuid) FROM authenticated;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.delete_employee_transaction(p_employee_id uuid) TO authenticated;

-- Ensure function is visible to PostgREST
COMMENT ON FUNCTION public.delete_employee_transaction(p_employee_id uuid) IS 'Delete an employee and all related records';

-- Force multiple schema cache reloads with delays
DO $$
BEGIN
  -- Initial cache clear
  PERFORM pg_stat_clear_snapshot();
  
  -- Multiple notifications with different messages
  PERFORM pg_notify('pgrst', 'reload schema');
  PERFORM pg_notify('pgrst', 'reload config');
  PERFORM pg_notify('pgrst', 'reload cache');
  
  -- Wait a bit and send more notifications
  PERFORM pg_sleep(0.1);
  PERFORM pg_notify('pgrst', 'reload schema');
  PERFORM pg_notify('pgrst', 'reload cache');
  
  -- Final reload for good measure
  PERFORM pg_sleep(0.1);
  PERFORM pg_notify('pgrst', 'reload schema');
END $$;

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