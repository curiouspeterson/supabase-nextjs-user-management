-- Cookie Metrics and Monitoring Migration
BEGIN;

-- Add cookie metrics table for tracking cookie usage and performance
CREATE TABLE IF NOT EXISTS public.cookie_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cookie_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    duration_ms INTEGER,
    user_id UUID REFERENCES auth.users(id),
    session_id UUID,
    request_path TEXT,
    request_method TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_cookie_metrics_name 
ON public.cookie_metrics(cookie_name);

CREATE INDEX IF NOT EXISTS idx_cookie_metrics_operation 
ON public.cookie_metrics(operation);

CREATE INDEX IF NOT EXISTS idx_cookie_metrics_user 
ON public.cookie_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_cookie_metrics_success 
ON public.cookie_metrics(success);

-- Function to log cookie metrics
CREATE OR REPLACE FUNCTION public.log_cookie_metric(
    p_cookie_name TEXT,
    p_operation TEXT,
    p_success BOOLEAN,
    p_duration_ms INTEGER DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_request_path TEXT DEFAULT NULL,
    p_request_method TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_metric_id UUID;
BEGIN
    INSERT INTO public.cookie_metrics (
        cookie_name,
        operation,
        success,
        duration_ms,
        user_id,
        session_id,
        request_path,
        request_method,
        user_agent
    )
    VALUES (
        p_cookie_name,
        p_operation,
        p_success,
        p_duration_ms,
        p_user_id,
        p_session_id,
        p_request_path,
        p_request_method,
        p_user_agent
    )
    RETURNING id INTO v_metric_id;
    
    RETURN v_metric_id;
END;
$$;

-- Function to get cookie success rate
CREATE OR REPLACE FUNCTION public.get_cookie_success_rate(
    p_cookie_name TEXT,
    p_operation TEXT DEFAULT NULL,
    p_time_window INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE (
    total_operations BIGINT,
    successful_operations BIGINT,
    success_rate NUMERIC,
    avg_duration_ms NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_operations,
        COUNT(*) FILTER (WHERE success)::BIGINT as successful_operations,
        (COUNT(*) FILTER (WHERE success)::NUMERIC / COUNT(*)::NUMERIC * 100) as success_rate,
        AVG(duration_ms)::NUMERIC as avg_duration_ms
    FROM public.cookie_metrics
    WHERE cookie_name = p_cookie_name
        AND (p_operation IS NULL OR operation = p_operation)
        AND created_at > NOW() - p_time_window;
END;
$$;

-- Add RLS policies
ALTER TABLE public.cookie_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all cookie metrics"
ON public.cookie_metrics
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Users can view their own cookie metrics"
ON public.cookie_metrics
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Grant necessary permissions
GRANT SELECT ON public.cookie_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_cookie_metric TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cookie_success_rate TO authenticated;

COMMIT; 