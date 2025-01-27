-- Error Metrics Tracking Migration
BEGIN;

-- Add error metrics table for tracking component-level error metrics
CREATE TABLE IF NOT EXISTS public.error_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component TEXT NOT NULL,
    error_count INTEGER NOT NULL DEFAULT 0,
    recovery_attempts INTEGER NOT NULL DEFAULT 0,
    successful_recoveries INTEGER NOT NULL DEFAULT 0,
    last_error TIMESTAMPTZ,
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_error_metrics_component 
ON public.error_metrics(component);

CREATE INDEX IF NOT EXISTS idx_error_metrics_last_error 
ON public.error_metrics(last_error);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_error_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_error_metrics_timestamp
    BEFORE UPDATE ON public.error_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_error_metrics_updated_at();

-- Function to log error metrics
CREATE OR REPLACE FUNCTION public.log_error_metrics(
    p_component TEXT,
    p_metrics JSONB,
    p_error_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_metric_id UUID;
BEGIN
    INSERT INTO public.error_metrics (
        component,
        error_count,
        recovery_attempts,
        successful_recoveries,
        last_error,
        error_details
    )
    VALUES (
        p_component,
        (p_metrics->>'errorCount')::INTEGER,
        (p_metrics->>'recoveryAttempts')::INTEGER,
        (p_metrics->>'successfulRecoveries')::INTEGER,
        CASE 
            WHEN p_metrics->>'lastError' IS NOT NULL 
            THEN (p_metrics->>'lastError')::TIMESTAMPTZ 
            ELSE NULL 
        END,
        p_error_details
    )
    ON CONFLICT (component)
    DO UPDATE SET
        error_count = EXCLUDED.error_count,
        recovery_attempts = EXCLUDED.recovery_attempts,
        successful_recoveries = EXCLUDED.successful_recoveries,
        last_error = EXCLUDED.last_error,
        error_details = EXCLUDED.error_details
    RETURNING id INTO v_metric_id;
    
    RETURN v_metric_id;
END;
$$;

-- Function to get component error metrics
CREATE OR REPLACE FUNCTION public.get_component_error_metrics(
    p_component TEXT,
    p_time_window INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE (
    error_count INTEGER,
    recovery_attempts INTEGER,
    successful_recoveries INTEGER,
    recovery_rate NUMERIC,
    last_error TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.error_count,
        e.recovery_attempts,
        e.successful_recoveries,
        CASE 
            WHEN e.recovery_attempts > 0 
            THEN (e.successful_recoveries::NUMERIC / e.recovery_attempts::NUMERIC * 100)
            ELSE 0
        END as recovery_rate,
        e.last_error
    FROM public.error_metrics e
    WHERE e.component = p_component
        AND (e.last_error IS NULL OR e.last_error > NOW() - p_time_window);
END;
$$;

-- Function to analyze error patterns
CREATE OR REPLACE FUNCTION public.analyze_error_patterns(
    p_time_window INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE (
    component TEXT,
    total_errors INTEGER,
    total_recoveries INTEGER,
    recovery_rate NUMERIC,
    avg_recovery_attempts NUMERIC,
    last_error TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.component,
        SUM(e.error_count) as total_errors,
        SUM(e.successful_recoveries) as total_recoveries,
        CASE 
            WHEN SUM(e.recovery_attempts) > 0 
            THEN (SUM(e.successful_recoveries)::NUMERIC / SUM(e.recovery_attempts)::NUMERIC * 100)
            ELSE 0
        END as recovery_rate,
        CASE 
            WHEN SUM(e.error_count) > 0 
            THEN (SUM(e.recovery_attempts)::NUMERIC / SUM(e.error_count)::NUMERIC)
            ELSE 0
        END as avg_recovery_attempts,
        MAX(e.last_error) as last_error
    FROM public.error_metrics e
    WHERE e.last_error > NOW() - p_time_window
    GROUP BY e.component
    ORDER BY total_errors DESC;
END;
$$;

-- Add RLS policies
ALTER TABLE public.error_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all error metrics"
ON public.error_metrics
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

-- Grant necessary permissions
GRANT SELECT ON public.error_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_error_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_component_error_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_error_patterns TO authenticated;

COMMIT; 