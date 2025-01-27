-- Auth Error Logging Migration
BEGIN;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.log_auth_error(TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.log_auth_error(auth_error_type, TEXT, TEXT, JSONB, UUID, UUID, auth_error_severity);
DROP FUNCTION IF EXISTS public.log_auth_event(TEXT, UUID, JSONB);
DROP FUNCTION IF EXISTS public.log_auth_event(TEXT, UUID, JSONB, BOOLEAN, UUID, UUID);

-- Create auth error types enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.auth_error_type AS ENUM (
        'USER_HOOK',
        'AUTH_STATE',
        'SESSION',
        'TOKEN',
        'NETWORK',
        'RATE_LIMIT',
        'UNKNOWN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create auth error severity enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.auth_error_severity AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create auth error log table
CREATE TABLE IF NOT EXISTS public.auth_error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type auth_error_type NOT NULL,
    error_code TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB,
    severity auth_error_severity NOT NULL DEFAULT 'MEDIUM',
    user_id UUID,
    session_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_details JSONB,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    recovery_strategy TEXT
);

-- Create auth event log table
CREATE TABLE IF NOT EXISTS public.auth_event_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    user_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success BOOLEAN NOT NULL DEFAULT true,
    error_id UUID REFERENCES public.auth_error_logs(id),
    session_id UUID,
    ip_address TEXT,
    user_agent TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_auth_error_logs_user_id ON public.auth_error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_error_logs_error_type ON public.auth_error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_auth_error_logs_created_at ON public.auth_error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_event_logs_user_id ON public.auth_event_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_event_logs_event_type ON public.auth_event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_event_logs_created_at ON public.auth_event_logs(created_at);

-- Function to log auth errors with improved error handling
CREATE OR REPLACE FUNCTION public.log_auth_error(
    p_error_type auth_error_type,
    p_error_code TEXT,
    p_error_message TEXT,
    p_error_details JSONB DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_severity auth_error_severity DEFAULT 'MEDIUM'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_error_id UUID;
    v_ip_address TEXT;
    v_user_agent TEXT;
BEGIN
    -- Get client info from request
    v_ip_address := current_setting('request.headers', true)::jsonb->>'x-forwarded-for';
    v_user_agent := current_setting('request.headers', true)::jsonb->>'user-agent';

    -- Insert error log
    INSERT INTO public.auth_error_logs (
        error_type,
        error_code,
        error_message,
        error_details,
        severity,
        user_id,
        session_id,
        ip_address,
        user_agent
    )
    VALUES (
        p_error_type,
        p_error_code,
        p_error_message,
        p_error_details,
        p_severity,
        p_user_id,
        p_session_id,
        v_ip_address,
        v_user_agent
    )
    RETURNING id INTO v_error_id;

    RETURN v_error_id;
END;
$$;

-- Function to log auth events with error tracking
CREATE OR REPLACE FUNCTION public.log_auth_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_id UUID DEFAULT NULL,
    p_session_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event_id UUID;
    v_ip_address TEXT;
    v_user_agent TEXT;
BEGIN
    -- Get client info from request
    v_ip_address := current_setting('request.headers', true)::jsonb->>'x-forwarded-for';
    v_user_agent := current_setting('request.headers', true)::jsonb->>'user-agent';

    -- Insert event log
    INSERT INTO public.auth_event_logs (
        event_type,
        user_id,
        metadata,
        success,
        error_id,
        session_id,
        ip_address,
        user_agent
    )
    VALUES (
        p_event_type,
        p_user_id,
        p_metadata,
        p_success,
        p_error_id,
        p_session_id,
        v_ip_address,
        v_user_agent
    )
    RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$;

-- Add RLS policies
ALTER TABLE public.auth_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_event_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read all auth error logs" ON public.auth_error_logs;
DROP POLICY IF EXISTS "Admins can read all auth event logs" ON public.auth_event_logs;
DROP POLICY IF EXISTS "Users can read their own auth error logs" ON public.auth_error_logs;
DROP POLICY IF EXISTS "Users can read their own auth event logs" ON public.auth_event_logs;

-- Admins can read all logs
CREATE POLICY "Admins can read all auth error logs"
ON public.auth_error_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Admins can read all auth event logs"
ON public.auth_event_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

-- Users can read their own logs
CREATE POLICY "Users can read their own auth error logs"
ON public.auth_error_logs
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

CREATE POLICY "Users can read their own auth event logs"
ON public.auth_event_logs
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Grant permissions
GRANT SELECT ON public.auth_error_logs TO authenticated;
GRANT SELECT ON public.auth_event_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_auth_error(auth_error_type, TEXT, TEXT, JSONB, UUID, UUID, auth_error_severity) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_auth_event(TEXT, UUID, JSONB, BOOLEAN, UUID, UUID) TO authenticated;

COMMIT; 