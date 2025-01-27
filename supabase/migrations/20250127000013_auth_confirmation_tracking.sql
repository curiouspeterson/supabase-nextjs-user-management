-- Auth Confirmation Tracking Migration
BEGIN;

-- Add auth confirmation attempts table
CREATE TABLE IF NOT EXISTS public.auth_confirmation_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT,
    type TEXT NOT NULL,
    token_hash TEXT,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_auth_confirmation_attempts_email 
ON public.auth_confirmation_attempts(email);

CREATE INDEX IF NOT EXISTS idx_auth_confirmation_attempts_created 
ON public.auth_confirmation_attempts(created_at);

CREATE INDEX IF NOT EXISTS idx_auth_confirmation_attempts_ip 
ON public.auth_confirmation_attempts(ip_address);

-- Function to log confirmation attempt
CREATE OR REPLACE FUNCTION public.log_confirmation_attempt(
    p_email TEXT,
    p_type TEXT,
    p_token_hash TEXT,
    p_ip_address TEXT,
    p_user_agent TEXT,
    p_success BOOLEAN,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt_id UUID;
BEGIN
    INSERT INTO public.auth_confirmation_attempts (
        email,
        type,
        token_hash,
        ip_address,
        user_agent,
        success,
        error_message
    )
    VALUES (
        p_email,
        p_type,
        p_token_hash,
        p_ip_address,
        p_user_agent,
        p_success,
        p_error_message
    )
    RETURNING id INTO v_attempt_id;

    RETURN v_attempt_id;
END;
$$;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_confirmation_rate_limit(
    p_email TEXT,
    p_ip_address TEXT,
    p_window_minutes INT DEFAULT 60,
    p_max_attempts INT DEFAULT 5
)
RETURNS TABLE (
    allowed BOOLEAN,
    remaining_attempts INT,
    next_allowed_attempt TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_attempts INT;
    v_window_start TIMESTAMPTZ;
    v_last_attempt TIMESTAMPTZ;
BEGIN
    -- Set window start time
    v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Get attempt count and last attempt time
    SELECT 
        COUNT(*),
        MAX(created_at)
    INTO 
        v_attempts,
        v_last_attempt
    FROM public.auth_confirmation_attempts
    WHERE (email = p_email OR ip_address = p_ip_address)
    AND created_at > v_window_start;

    RETURN QUERY
    SELECT 
        v_attempts < p_max_attempts,
        p_max_attempts - v_attempts,
        CASE 
            WHEN v_attempts >= p_max_attempts 
            THEN v_last_attempt + (p_window_minutes || ' minutes')::INTERVAL
            ELSE NULL
        END;
END;
$$;

-- Add RLS policies
ALTER TABLE public.auth_confirmation_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all confirmation attempts"
ON public.auth_confirmation_attempts
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

-- Grant permissions
GRANT SELECT ON public.auth_confirmation_attempts TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_confirmation_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_confirmation_rate_limit TO authenticated;

COMMIT; 