-- Create user role function
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

-- Create new user handler
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

-- Create employee update function
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

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create employee-related policies
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Managers can view all profiles" ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE id = auth.uid()
      AND user_role IN ('Manager', 'Admin')
    )
  );

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

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_employee_and_profile(uuid, text, text, text, integer, uuid) TO authenticated; 