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

-- Drop existing function
DROP FUNCTION IF EXISTS public.delete_employee_transaction();
DROP FUNCTION IF EXISTS public.delete_employee_transaction(uuid);
DROP FUNCTION IF EXISTS public.delete_employee_transaction(employee_id uuid);

-- Create employee deletion function
CREATE OR REPLACE FUNCTION public.delete_employee_transaction(id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete employee schedules first
  DELETE FROM public.schedules
  WHERE employee_id = id;
  
  -- Delete time off requests
  DELETE FROM public.time_off_requests 
  WHERE employee_id = id;
  
  -- Delete employee record
  DELETE FROM public.employees
  WHERE id = id;
  
  -- Delete profile
  DELETE FROM public.profiles
  WHERE id = id;
END;
$$;

-- Grant execute permission
REVOKE ALL ON FUNCTION public.delete_employee_transaction(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_employee_transaction(uuid) TO authenticated;

-- Add comment for PostgREST
COMMENT ON FUNCTION public.delete_employee_transaction(uuid) IS 'Deletes an employee and all related records';

-- Force schema cache reload
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
  PERFORM pg_sleep(0.1);
  PERFORM pg_notify('pgrst', 'reload config');
  PERFORM pg_sleep(0.1);
  PERFORM pg_notify('pgrst', 'reload cache');
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