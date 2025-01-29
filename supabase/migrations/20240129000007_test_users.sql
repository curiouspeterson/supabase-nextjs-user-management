-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set passwords for test users
-- Note: These are development-only passwords. In production, never store passwords in plain text or migrations.
UPDATE auth.users
SET 
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  last_sign_in_at = NULL,
  raw_app_meta_data = raw_app_meta_data || 
    jsonb_build_object(
      'provider', 'email',
      'providers', ARRAY['email']
    )::jsonb
WHERE email IN ('admin@example.com', 'manager@example.com', 'employee@example.com');

-- Create profiles for test users with proper roles
INSERT INTO public.profiles (id, role, full_name, username)
SELECT 
  id,
  CASE 
    WHEN email = 'admin@example.com' THEN 'Admin'
    WHEN email = 'manager@example.com' THEN 'Manager'
    ELSE 'Employee'
  END,
  CASE 
    WHEN email = 'admin@example.com' THEN 'System Admin'
    WHEN email = 'manager@example.com' THEN 'Team Manager'
    ELSE 'Test Employee'
  END,
  split_part(email, '@', 1)
FROM auth.users
WHERE email IN ('admin@example.com', 'manager@example.com', 'employee@example.com')
ON CONFLICT (id) DO UPDATE
SET 
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username;

-- Create employee records for test users
INSERT INTO public.employees (id, user_role, employee_role)
SELECT 
  id,
  CASE 
    WHEN email = 'admin@example.com' THEN 'Admin'::user_role_enum
    WHEN email = 'manager@example.com' THEN 'Manager'::user_role_enum
    ELSE 'Employee'::user_role_enum
  END,
  CASE 
    WHEN email = 'admin@example.com' THEN 'ADMIN'::employee_role
    WHEN email = 'manager@example.com' THEN 'MANAGER'::employee_role
    ELSE 'STAFF'::employee_role
  END
FROM auth.users
WHERE email IN ('admin@example.com', 'manager@example.com', 'employee@example.com')
ON CONFLICT (id) DO UPDATE
SET 
  user_role = EXCLUDED.user_role,
  employee_role = EXCLUDED.employee_role;

-- Grant necessary permissions for the auth schema
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, service_role; 