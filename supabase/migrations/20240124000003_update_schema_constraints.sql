-- Drop trigger on auth.users first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all policies that reference the employees table
DROP POLICY IF EXISTS "Managers and admins can manage all records" ON public.employees;
DROP POLICY IF EXISTS "Users can update their own record" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can view employees" ON public.employees;
DROP POLICY IF EXISTS "Managers can update employee records" ON public.employees;
DROP POLICY IF EXISTS "Managers can manage all schedules" ON public.schedules;
DROP POLICY IF EXISTS "Managers can manage shift types" ON public.shift_types;
DROP POLICY IF EXISTS "Managers can manage shifts" ON public.shifts;
DROP POLICY IF EXISTS "Managers can manage staffing requirements" ON public.staffing_requirements;
DROP POLICY IF EXISTS "Managers can update time off request status" ON public.time_off_requests;
DROP POLICY IF EXISTS "Managers can view all time off requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can manage assigned shifts" ON public.assigned_shifts;

-- Drop functions that reference the employees table
DROP FUNCTION IF EXISTS auth.check_user_role(uuid);
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_employee_and_profile(uuid, text, text, text, integer, uuid);

-- Drop CHECK constraints on employees table
ALTER TABLE public.employees 
DROP CONSTRAINT IF EXISTS employees_employee_role_check,
DROP CONSTRAINT IF EXISTS employees_user_role_check;

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE employee_role_enum AS ENUM ('Dispatcher', 'Shift Supervisor', 'Management');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('Employee', 'Manager', 'Admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE time_off_type_enum AS ENUM ('Vacation', 'Sick', 'Personal', 'Training');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE time_off_status_enum AS ENUM ('Pending', 'Approved', 'Declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE day_of_week_enum AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE schedule_status_enum AS ENUM ('Draft', 'Published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Now alter the column types
ALTER TABLE employees 
ALTER COLUMN employee_role TYPE employee_role_enum 
  USING CASE employee_role 
    WHEN 'Dispatcher' THEN 'Dispatcher'::employee_role_enum
    WHEN 'Shift Supervisor' THEN 'Shift Supervisor'::employee_role_enum
    WHEN 'Management' THEN 'Management'::employee_role_enum
  END,
ALTER COLUMN user_role TYPE user_role_enum 
  USING CASE user_role
    WHEN 'Employee' THEN 'Employee'::user_role_enum
    WHEN 'Manager' THEN 'Manager'::user_role_enum
    WHEN 'Admin' THEN 'Admin'::user_role_enum
  END;

-- Recreate the auth.check_user_role function
CREATE OR REPLACE FUNCTION auth.check_user_role(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees
    WHERE id = user_id
    AND user_role IN ('Manager', 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role_enum
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role user_role_enum;
BEGIN
  SELECT user_role INTO v_user_role
  FROM public.employees
  WHERE id = auth.uid();
  RETURN v_user_role;
END;
$$;

-- Recreate the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shift_type_id uuid;
  v_error text;
  v_detail text;
BEGIN
  RAISE NOTICE 'Creating new user with ID: %, Email: %, Metadata: %', new.id, new.email, new.raw_user_meta_data;
  
  BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'avatar_url', null), now());
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating profile: %', SQLERRM;
      RAISE EXCEPTION 'Profile creation failed: %', SQLERRM;
  END;
  
  BEGIN
    IF new.raw_user_meta_data->>'default_shift_type_id' IS NULL THEN
      SELECT id INTO v_shift_type_id FROM shift_types WHERE name = 'Day Shift' LIMIT 1;
    ELSE
      BEGIN
        v_shift_type_id := (new.raw_user_meta_data->>'default_shift_type_id')::uuid;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Invalid UUID for default_shift_type_id: %', new.raw_user_meta_data->>'default_shift_type_id';
          RAISE EXCEPTION 'Invalid default_shift_type_id format';
      END;
    END IF;

    INSERT INTO public.employees (id, employee_role, user_role, weekly_hours_scheduled, default_shift_type_id)
    VALUES (
      new.id,
      COALESCE((new.raw_user_meta_data->>'employee_role')::employee_role_enum, 'Dispatcher'::employee_role_enum),
      COALESCE((new.raw_user_meta_data->>'user_role')::user_role_enum, 'Employee'::user_role_enum),
      COALESCE((new.raw_user_meta_data->>'weekly_hours_scheduled')::integer, 40),
      v_shift_type_id
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating employee: %', SQLERRM;
      RAISE EXCEPTION 'Employee creation failed: %', SQLERRM;
  END;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT, v_detail = PG_EXCEPTION_DETAIL;
    RAISE WARNING 'Error in handle_new_user trigger: % (User ID: %, Email: %), Detail: %', v_error, new.id, new.email, v_detail;
    RAISE;
END;
$$;

-- Recreate the update_employee_and_profile function
CREATE OR REPLACE FUNCTION public.update_employee_and_profile(
  p_employee_id uuid,
  p_full_name text,
  p_employee_role text,
  p_user_role text,
  p_weekly_hours_scheduled integer,
  p_default_shift_type_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Start transaction
  BEGIN
    -- Update profile
    UPDATE public.profiles
    SET full_name = p_full_name,
        updated_at = now()
    WHERE id = p_employee_id;

    -- Update employee
    UPDATE public.employees
    SET employee_role = p_employee_role::employee_role_enum,
        user_role = p_user_role::user_role_enum,
        weekly_hours_scheduled = p_weekly_hours_scheduled,
        default_shift_type_id = p_default_shift_type_id
    WHERE id = p_employee_id;

    -- Get updated employee data
    SELECT jsonb_build_object(
      'id', e.id,
      'employee_role', e.employee_role,
      'user_role', e.user_role,
      'weekly_hours_scheduled', e.weekly_hours_scheduled,
      'default_shift_type_id', e.default_shift_type_id,
      'full_name', p.full_name,
      'updated_at', p.updated_at
    ) INTO v_result
    FROM public.employees e
    JOIN public.profiles p ON p.id = e.id
    WHERE e.id = p_employee_id;

    RETURN v_result;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error updating employee and profile: %', SQLERRM;
  END;
END;
$$;

-- Recreate trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recreate policies that reference the employees table
CREATE POLICY "Managers and admins can manage all records" ON public.employees
USING (auth.check_user_role(auth.uid()));

CREATE POLICY "Users can update their own record" ON public.employees
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view employees" ON public.employees
FOR SELECT USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Managers can update employee records" ON public.employees
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Managers can manage all schedules" ON public.schedules
USING (auth.check_user_role(auth.uid()));

CREATE POLICY "Managers can manage shift types" ON public.shift_types
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Managers can manage shifts" ON public.shifts
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Managers can manage staffing requirements" ON public.staffing_requirements
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Managers can update time off request status" ON public.time_off_requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Managers can view all time off requests" ON public.time_off_requests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Managers can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Managers can manage assigned shifts" ON public.assigned_shifts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables
DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_shift_types_updated_at ON shift_types;
CREATE TRIGGER update_shift_types_updated_at
  BEFORE UPDATE ON shift_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at(); 