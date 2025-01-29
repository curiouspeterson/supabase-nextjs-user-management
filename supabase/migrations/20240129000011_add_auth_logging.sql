-- Create debug log table
CREATE TABLE IF NOT EXISTS auth.debug_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamptz DEFAULT now(),
  email text,
  action text,
  details jsonb
);

-- Create auth debug logging function
CREATE OR REPLACE FUNCTION auth.log_auth_debug(
  p_user_id uuid,
  p_email text,
  p_action text,
  p_details jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO auth.debug_log (
    email,
    action,
    details
  )
  VALUES (
    p_email,
    p_action,
    jsonb_build_object(
      'user_id', p_user_id,
      'details', p_details,
      'user_record', (
        SELECT jsonb_build_object(
          'id', id,
          'email', email,
          'role', role,
          'aud', aud,
          'has_password', encrypted_password IS NOT NULL,
          'confirmed', email_confirmed_at IS NOT NULL,
          'last_sign_in', last_sign_in_at,
          'created', created_at,
          'updated', updated_at,
          'metadata', raw_app_meta_data
        )
        FROM auth.users
        WHERE email = p_email
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to log auth attempts
CREATE OR REPLACE FUNCTION auth.tr_log_auth_attempt() RETURNS trigger AS $$
BEGIN
  PERFORM auth.log_auth_debug(
    NEW.id,
    NEW.email,
    TG_OP,
    jsonb_build_object(
      'trigger_event', TG_OP,
      'old_record', to_jsonb(OLD),
      'new_record', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_auth_attempt_logging ON auth.users;
CREATE TRIGGER tr_auth_attempt_logging
  AFTER INSERT OR UPDATE
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.tr_log_auth_attempt();

-- Grant permissions
GRANT EXECUTE ON FUNCTION auth.log_auth_debug(uuid, text, text, jsonb) TO postgres, authenticator, service_role;
GRANT EXECUTE ON FUNCTION auth.tr_log_auth_attempt() TO postgres, authenticator, service_role;

-- Add function to check user state
CREATE OR REPLACE FUNCTION auth.check_user_state(p_email text)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_user_exists boolean;
  v_user_record auth.users%ROWTYPE;
BEGIN
  -- First check if user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = p_email
  ) INTO v_user_exists;
  
  -- Get user record if exists
  SELECT * INTO v_user_record 
  FROM auth.users 
  WHERE email = p_email;

  SELECT jsonb_build_object(
    'user_exists', v_user_exists,
    'user_details', CASE 
      WHEN v_user_exists THEN jsonb_build_object(
        'id', v_user_record.id,
        'email', v_user_record.email,
        'role', v_user_record.role,
        'aud', v_user_record.aud,
        'has_password', v_user_record.encrypted_password IS NOT NULL,
        'password_format', CASE 
          WHEN v_user_record.encrypted_password LIKE '$2a$%' THEN 'bcrypt'
          WHEN v_user_record.encrypted_password LIKE '$2b$%' THEN 'bcrypt_b'
          ELSE 'unknown'
        END,
        'confirmed', v_user_record.email_confirmed_at IS NOT NULL,
        'last_sign_in', v_user_record.last_sign_in_at,
        'created', v_user_record.created_at,
        'updated', v_user_record.updated_at,
        'metadata', v_user_record.raw_app_meta_data
      )
      ELSE NULL
    END
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION auth.check_user_state(text) TO postgres, authenticator, service_role;

-- Log initial state of test users
SELECT auth.check_user_state(email) as user_state
FROM auth.users
WHERE email IN ('admin@example.com', 'manager@example.com', 'employee@example.com'); 