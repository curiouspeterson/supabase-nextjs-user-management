-- Reset auth users to a clean state
UPDATE auth.users
SET 
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  confirmation_sent_at = NOW(),
  is_sso_user = false,
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
  confirmation_token = NULL,
  aud = 'authenticated'
WHERE email IN ('admin@example.com', 'manager@example.com', 'employee@example.com');

-- Ensure proper auth service configuration
ALTER ROLE authenticator SET search_path TO auth, public, extensions;
ALTER ROLE authenticated SET search_path TO auth, public, extensions;
ALTER ROLE anon SET search_path TO auth, public, extensions;

-- Grant necessary permissions for auth service
GRANT USAGE ON SCHEMA auth TO postgres, authenticator, authenticated, service_role, anon;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, authenticator, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, authenticator, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, authenticator, service_role;

-- Grant specific permissions for auth operations
GRANT SELECT, UPDATE ON auth.users TO authenticator;
GRANT SELECT, INSERT, UPDATE ON auth.refresh_tokens TO authenticator;
GRANT SELECT ON auth.users TO anon;

-- Ensure the auth schema is properly initialized
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY; 