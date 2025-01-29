-- Migration: Create User Management Function
BEGIN;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.create_user_with_profile(uuid, varchar, jsonb, jsonb, timestamptz, timestamptz);

-- Function to create a user with profile and employee record
CREATE OR REPLACE FUNCTION public.create_user_with_profile(
    p_id uuid,
    p_email varchar,
    p_raw_user_meta_data jsonb,
    p_raw_app_meta_data jsonb,
    p_created_at timestamptz,
    p_updated_at timestamptz
) RETURNS void AS $$
DECLARE
    v_employee_role employee_role;
    v_user_role user_role_enum;
    v_role text;
BEGIN
    -- Extract role from metadata
    v_role := p_raw_user_meta_data->>'employee_role';

    -- Determine roles based on employee_role
    CASE v_role
        WHEN 'Management' THEN
            v_employee_role := 'MANAGER'::employee_role;
            v_user_role := 'Manager'::user_role_enum;
        WHEN 'SUPERVISOR' THEN
            v_employee_role := 'SUPERVISOR'::employee_role;
            v_user_role := 'Employee'::user_role_enum;
        ELSE
            v_employee_role := 'STAFF'::employee_role;
            v_user_role := 'Employee'::user_role_enum;
    END CASE;

    -- Insert or update auth.user
    INSERT INTO auth.users (
        id,
        email,
        raw_user_meta_data,
        raw_app_meta_data,
        created_at,
        updated_at,
        instance_id,
        aud,
        role
    ) VALUES (
        p_id,
        p_email,
        p_raw_user_meta_data,
        p_raw_app_meta_data,
        p_created_at,
        p_updated_at,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated'
    ) ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        raw_user_meta_data = EXCLUDED.raw_user_meta_data,
        raw_app_meta_data = EXCLUDED.raw_app_meta_data,
        updated_at = EXCLUDED.updated_at;

    -- Create profile
    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        role,
        updated_at
    ) VALUES (
        p_id,
        COALESCE(p_raw_user_meta_data->>'username', split_part(p_email, '@', 1)),
        COALESCE(p_raw_user_meta_data->>'full_name', split_part(p_email, '@', 1)),
        v_user_role::text,
        p_updated_at
    ) ON CONFLICT (id) DO UPDATE
    SET
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = EXCLUDED.updated_at;

    -- Create employee record
    INSERT INTO public.employees (
        id,
        user_role,
        employee_role,
        created_at,
        updated_at
    ) VALUES (
        p_id,
        v_user_role,
        v_employee_role,
        p_created_at,
        p_updated_at
    ) ON CONFLICT (id) DO UPDATE
    SET
        user_role = EXCLUDED.user_role,
        employee_role = EXCLUDED.employee_role,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_user_with_profile(uuid, varchar, jsonb, jsonb, timestamptz, timestamptz) TO postgres;
GRANT EXECUTE ON FUNCTION public.create_user_with_profile(uuid, varchar, jsonb, jsonb, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_with_profile(uuid, varchar, jsonb, jsonb, timestamptz, timestamptz) TO service_role;

COMMIT; 