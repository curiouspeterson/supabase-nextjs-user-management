-- Migration to fix auth passwords and permissions
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update auth users with proper password hashing and metadata
UPDATE auth.users
SET 
  encrypted_password = '$2a$10$Qz0U6QvvFxWVvg7Hs.XyPO6PJqm/Tpw5OQwlX.GzHmKz9U6c8q5Vy',  -- 'password123' hashed with bcrypt
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
  email_confirmed_at = NOW(),
  confirmation_sent_at = NOW(),
  is_sso_user = false,
  created_at = NOW(),
  updated_at = NOW(),
  last_sign_in_at = NULL
WHERE email IN ('admin@example.com', 'manager@example.com', 'employee@example.com');

-- Ensure proper auth schema permissions
GRANT USAGE ON SCHEMA auth TO postgres, authenticator, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, authenticator, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, authenticator, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, authenticator, service_role;

-- Grant specific table permissions
GRANT SELECT, INSERT, UPDATE ON auth.users TO authenticator;
GRANT SELECT, INSERT, UPDATE ON auth.refresh_tokens TO authenticator;

-- Ensure the auth schema is in the search path
ALTER ROLE authenticator SET search_path TO auth, public;
ALTER ROLE authenticated SET search_path TO auth, public; 