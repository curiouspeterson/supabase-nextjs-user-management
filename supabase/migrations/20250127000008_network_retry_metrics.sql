-- Network Retry Metrics Migration
BEGIN;

-- Add network retry metrics table
CREATE TABLE IF NOT EXISTS public.network_retry_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    total_retries INTEGER NOT NULL DEFAULT 0,
    successful_retries INTEGER NOT NULL DEFAULT 0,
    failed_retries INTEGER NOT NULL DEFAULT 0,
    last_retry TIMESTAMPTZ,
    avg_retry_delay NUMERIC,
    max_retry_delay NUMERIC,
    retry_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_network_retry_metrics_component 
ON public.network_retry_metrics(component);

CREATE INDEX IF NOT EXISTS idx_network_retry_metrics_endpoint 
ON public.network_retry_metrics(endpoint);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_network_retry_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_network_retry_metrics_timestamp
    BEFORE UPDATE ON public.network_retry_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_network_retry_metrics_updated_at();

-- Function to log network retry metrics
CREATE OR REPLACE FUNCTION public.log_network_retry_metrics(
    p_component TEXT,
    p_endpoint TEXT,
    p_metrics JSONB,
    p_retry_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_metric_id UUID;
BEGIN
    INSERT INTO public.network_retry_metrics (
        component,
        endpoint,
        total_retries,
        successful_retries,
        failed_retries,
        last_retry,
        avg_retry_delay,
        max_retry_delay,
        retry_details
    )
    VALUES (
        p_component,
        p_endpoint,
        (p_metrics->>'totalRetries')::INTEGER,
        (p_metrics->>'successfulRetries')::INTEGER,
        (p_metrics->>'failedRetries')::INTEGER,
        CASE 
            WHEN p_metrics->>'lastRetry' IS NOT NULL 
            THEN (p_metrics->>'lastRetry')::TIMESTAMPTZ 
            ELSE NULL 
        END,
        (p_metrics->>'avgRetryDelay')::NUMERIC,
        (p_metrics->>'maxRetryDelay')::NUMERIC,
        p_retry_details
    )
    ON CONFLICT (component, endpoint)
    DO UPDATE SET
        total_retries = EXCLUDED.total_retries,
        successful_retries = EXCLUDED.successful_retries,
        failed_retries = EXCLUDED.failed_retries,
        last_retry = EXCLUDED.last_retry,
        avg_retry_delay = EXCLUDED.avg_retry_delay,
        max_retry_delay = EXCLUDED.max_retry_delay,
        retry_details = EXCLUDED.retry_details;

    RETURN v_metric_id;
END;
$$;

-- Function to analyze network retry patterns
CREATE OR REPLACE FUNCTION public.analyze_network_retry_patterns(
    p_time_window INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE (
    component TEXT,
    endpoint TEXT,
    total_retries INTEGER,
    success_rate NUMERIC,
    avg_retry_delay NUMERIC,
    max_retry_delay NUMERIC,
    last_retry TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.component,
        n.endpoint,
        n.total_retries,
        CASE 
            WHEN n.total_retries > 0 
            THEN (n.successful_retries::NUMERIC / n.total_retries::NUMERIC * 100)
            ELSE 0
        END as success_rate,
        n.avg_retry_delay,
        n.max_retry_delay,
        n.last_retry
    FROM public.network_retry_metrics n
    WHERE n.last_retry > NOW() - p_time_window
    ORDER BY n.total_retries DESC;
END;
$$;

-- Add RLS policies
ALTER TABLE public.network_retry_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all network retry metrics"
ON public.network_retry_metrics
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
GRANT SELECT ON public.network_retry_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_network_retry_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_network_retry_patterns TO authenticated;

COMMIT; 