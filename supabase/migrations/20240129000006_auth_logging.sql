-- Create auth_logs table to store authentication-related events
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text,
  error_code text,
  error_message text,
  error_details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT SELECT ON public.auth_logs TO authenticated;
GRANT INSERT ON public.auth_logs TO authenticated;

-- Create policy to allow users to see their own logs
CREATE POLICY "Users can view their own logs"
  ON public.auth_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy to allow users to create their own logs
CREATE POLICY "Users can create their own logs"
  ON public.auth_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    CASE 
      WHEN user_id IS NOT NULL THEN user_id = auth.uid()
      ELSE true  -- Allow logging errors for unauthenticated users
    END
  );

-- Create function to log authentication errors and events
CREATE OR REPLACE FUNCTION public.log_auth_error(
  p_user_id uuid DEFAULT NULL,
  p_action text DEFAULT NULL,
  p_error_code text DEFAULT NULL,
  p_error_message text DEFAULT NULL,
  p_error_details jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  -- Add metadata for cookie errors
  IF p_action = 'cookie_operation' THEN
    p_error_details = jsonb_build_object(
      'cookie_operation', p_error_details->>'operation',
      'cookie_name', p_error_details->>'cookieName',
      'error_details', p_error_details->>'error'
    );
  END IF;

  -- For successful logins, set appropriate metadata
  IF p_action = 'login' AND p_error_code IS NULL THEN
    p_error_details = jsonb_build_object(
      'event_type', 'LOGIN_SUCCESS',
      'timestamp', extract(epoch from now())
    );
  END IF;

  INSERT INTO public.auth_logs (
    user_id,
    action,
    error_code,
    error_message,
    error_details,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    p_action,
    COALESCE(p_error_code, 'SUCCESS'),
    p_error_message,
    p_error_details,
    p_ip_address,
    p_user_agent,
    CASE 
      WHEN p_error_code IS NULL THEN 
        jsonb_build_object('event_type', 'SUCCESS')
      ELSE 
        jsonb_build_object('event_type', 'ERROR')
    END
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$; 