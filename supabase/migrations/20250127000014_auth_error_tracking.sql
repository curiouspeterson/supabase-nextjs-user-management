-- Auth Error Tracking Migration
BEGIN;

-- Drop existing objects if they exist
DROP TABLE IF EXISTS public.auth_errors CASCADE;
DROP FUNCTION IF EXISTS public.log_auth_error CASCADE;
DROP FUNCTION IF EXISTS public.get_auth_error_history CASCADE;

-- Add auth errors table
CREATE TABLE public.auth_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    error_code TEXT NOT NULL,
    error_message TEXT,
    error_details JSONB DEFAULT '{}'::JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_auth_errors_user ON public.auth_errors(user_id);
CREATE INDEX idx_auth_errors_action ON public.auth_errors(action_type);
CREATE INDEX idx_auth_errors_created ON public.auth_errors(created_at);

-- Function to log auth error
CREATE OR REPLACE FUNCTION public.log_auth_error(
    p_user_id UUID,
    p_action TEXT,
    p_error_code TEXT,
    p_error_message TEXT,
    p_error_details JSONB DEFAULT '{}'::JSONB,
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
        user_id,
        action_type,
        error_code,
        error_message,
        error_details,
        ip_address,
        user_agent
    )
    VALUES (
        p_user_id,
        p_action,
        p_error_code,
        p_error_message,
        p_error_details,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_error_id;

    RETURN v_error_id;
END;
$$;

-- Function to get auth error history
CREATE OR REPLACE FUNCTION public.get_auth_error_history(
    p_user_id UUID DEFAULT NULL,
    p_action TEXT DEFAULT NULL,
    p_start_time TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '24 hours'),
    p_end_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    error_id UUID,
    user_id UUID,
    action_type TEXT,
    error_code TEXT,
    error_message TEXT,
    error_details JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ae.id as error_id,
        ae.user_id,
        ae.action_type,
        ae.error_code,
        ae.error_message,
        ae.error_details,
        ae.created_at
    FROM public.auth_errors ae
    WHERE (p_user_id IS NULL OR ae.user_id = p_user_id)
    AND (p_action IS NULL OR ae.action_type = p_action)
    AND ae.created_at BETWEEN p_start_time AND p_end_time
    ORDER BY ae.created_at DESC;
END;
$$;

-- Add RLS policies
ALTER TABLE public.auth_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own auth errors"
ON public.auth_errors
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

-- Grant permissions
GRANT SELECT ON public.auth_errors TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_auth_error TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_error_history TO authenticated;

COMMIT; 