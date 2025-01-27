-- Auth Error Tracking Migration
BEGIN;

-- Create auth error tracking table
CREATE TABLE IF NOT EXISTS public.auth_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type TEXT NOT NULL,
    error_code TEXT,
    error_message TEXT,
    error_details JSONB,
    user_id UUID REFERENCES auth.users(id),
    session_id UUID,
    request_path TEXT,
    request_method TEXT,
    ip_address TEXT,
    user_agent TEXT,
    retry_count INTEGER DEFAULT 0,
    resolved_at TIMESTAMPTZ,
    resolution_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_auth_errors_user 
ON public.auth_errors(user_id);

CREATE INDEX IF NOT EXISTS idx_auth_errors_type 
ON public.auth_errors(error_type);

-- Function to log auth errors
CREATE OR REPLACE FUNCTION public.log_auth_error(
    p_error_type TEXT,
    p_error_code TEXT,
    p_error_message TEXT,
    p_error_details JSONB,
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
    INSERT INTO public.auth_errors (
        error_type,
        error_code,
        error_message,
        error_details,
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

-- Function to resolve auth error
CREATE OR REPLACE FUNCTION public.resolve_auth_error(
    p_error_id UUID,
    p_resolution_details TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.auth_errors
    SET resolved_at = NOW(),
        resolution_details = p_resolution_details
    WHERE id = p_error_id
    AND resolved_at IS NULL;
    
    RETURN FOUND;
END;
$$;

-- Add RLS policies
ALTER TABLE public.auth_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all auth errors"
ON public.auth_errors
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Users can view their own auth errors"
ON public.auth_errors
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Grant necessary permissions
GRANT SELECT ON public.auth_errors TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_auth_error TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_auth_error TO authenticated;

COMMIT; 