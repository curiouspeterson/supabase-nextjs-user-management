-- Cookie Tracking and Validation Migration
BEGIN;

-- Add cookie_errors table for specific cookie-related error tracking
CREATE TABLE IF NOT EXISTS public.cookie_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type TEXT NOT NULL,
    error_code TEXT,
    error_message TEXT,
    error_details JSONB,
    cookie_name TEXT,
    cookie_operation TEXT,
    user_id UUID REFERENCES auth.users(id),
    session_id UUID,
    request_path TEXT,
    request_method TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_cookie_errors_user 
ON public.cookie_errors(user_id);

CREATE INDEX IF NOT EXISTS idx_cookie_errors_type 
ON public.cookie_errors(error_type);

CREATE INDEX IF NOT EXISTS idx_cookie_errors_cookie 
ON public.cookie_errors(cookie_name);

-- Function to log cookie errors
CREATE OR REPLACE FUNCTION public.log_cookie_error(
    p_error_type TEXT,
    p_error_code TEXT,
    p_error_message TEXT,
    p_error_details JSONB,
    p_cookie_name TEXT,
    p_cookie_operation TEXT,
    p_user_id UUID DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_request_path TEXT DEFAULT NULL,
    p_request_method TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_error_id UUID;
BEGIN
    INSERT INTO public.cookie_errors (
        error_type,
        error_code,
        error_message,
        error_details,
        cookie_name,
        cookie_operation,
        user_id,
        session_id,
        request_path,
        request_method,
        ip_address,
        user_agent
    )
    VALUES (
        p_error_type,
        p_error_code,
        p_error_message,
        p_error_details,
        p_cookie_name,
        p_cookie_operation,
        p_user_id,
        p_session_id,
        p_request_path,
        p_request_method,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_error_id;
    
    RETURN v_error_id;
END;
$$;

-- Function to validate cookie name
CREATE OR REPLACE FUNCTION public.is_valid_cookie_name(
    p_cookie_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Check if cookie name follows RFC 6265
    RETURN p_cookie_name ~ '^[a-zA-Z0-9!#$%&''*+\-.^_`|~]+$'
        AND length(p_cookie_name) <= 4096;
END;
$$;

-- Function to validate cookie value
CREATE OR REPLACE FUNCTION public.is_valid_cookie_value(
    p_cookie_value TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Check if cookie value follows RFC 6265
    RETURN p_cookie_value ~ '^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]*$'
        AND length(p_cookie_value) <= 4096;
END;
$$;

-- Add RLS policies
ALTER TABLE public.cookie_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all cookie errors"
ON public.cookie_errors
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Users can view their own cookie errors"
ON public.cookie_errors
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Grant necessary permissions
GRANT SELECT ON public.cookie_errors TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_cookie_error TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_cookie_name TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_cookie_value TO authenticated;

COMMIT; 