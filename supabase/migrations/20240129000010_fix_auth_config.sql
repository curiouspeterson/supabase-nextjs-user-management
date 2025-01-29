-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update auth configuration
UPDATE auth.users
SET 
  instance_id = '00000000-0000-0000-0000-000000000000',
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  confirmation_sent_at = NOW(),
  is_sso_user = false,
  role = 'authenticated',
  aud = 'authenticated',
  raw_app_meta_data = jsonb_build_object(
    'provider', 'email',
    'providers', ARRAY['email']::text[],
    'role', CASE 
      WHEN email = 'admin@example.com' THEN 'ADMIN'
      WHEN email = 'manager@example.com' THEN 'MANAGER'
      ELSE 'EMPLOYEE'
    END
  ),
  raw_user_meta_data = jsonb_build_object(
    'role', CASE 
      WHEN email = 'admin@example.com' THEN 'ADMIN'
      WHEN email = 'manager@example.com' THEN 'MANAGER'
      ELSE 'EMPLOYEE'
    END
  ),
  created_at = NOW(),
  updated_at = NOW(),
  last_sign_in_at = NULL,
  confirmation_token = NULL
WHERE email IN ('admin@example.com', 'manager@example.com', 'employee@example.com');

-- Add RLS policies for auth schema
DROP POLICY IF EXISTS "Users can view their own data" ON auth.users;
CREATE POLICY "Users can view their own data" 
  ON auth.users 
  FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can update their own data" ON auth.users;
CREATE POLICY "Authenticated users can update their own data" 
  ON auth.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, authenticator, authenticated, service_role, anon;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, authenticator, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, authenticator, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, authenticator, service_role;

-- Grant specific permissions
GRANT SELECT ON auth.users TO anon, authenticated;
GRANT UPDATE ON auth.users TO authenticated;

-- Set proper search paths
ALTER ROLE authenticator SET search_path TO auth, public, extensions;
ALTER ROLE authenticated SET search_path TO auth, public, extensions;
ALTER ROLE anon SET search_path TO auth, public, extensions;

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY; 
