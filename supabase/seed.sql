-- Seed file for importing users and creating related records
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
BEGIN
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
        COALESCE(p_raw_user_meta_data->>'role', 'Employee'),
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
        CASE 
            WHEN p_raw_user_meta_data->>'role' = 'Admin' THEN 'Admin'::user_role_enum
            WHEN p_raw_user_meta_data->>'role' = 'Manager' THEN 'Manager'::user_role_enum
            ELSE 'Employee'::user_role_enum
        END,
        CASE 
            WHEN p_raw_user_meta_data->>'role' = 'Admin' THEN 'ADMIN'::employee_role
            WHEN p_raw_user_meta_data->>'role' = 'Manager' THEN 'MANAGER'::employee_role
            ELSE 'STAFF'::employee_role
        END,
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

-- Sample user data
SELECT public.create_user_with_profile(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'admin@example.com'::varchar,
    '{"role": "Admin", "username": "admin", "full_name": "System Admin"}'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW()
);

SELECT public.create_user_with_profile(
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'manager@example.com'::varchar,
    '{"role": "Manager", "username": "manager", "full_name": "Team Manager"}'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW()
);

SELECT public.create_user_with_profile(
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'employee@example.com'::varchar,
    '{"role": "Employee", "username": "employee", "full_name": "Test Employee"}'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW()
);

COMMIT; 