-- Rate Limit Configuration Migration
BEGIN;

-- Add rate limit configuration table
CREATE TABLE IF NOT EXISTS public.rate_limit_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    max_requests INTEGER NOT NULL,
    window_seconds INTEGER NOT NULL,
    burst_limit INTEGER,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add rate limit metrics table
CREATE TABLE IF NOT EXISTS public.rate_limit_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL,
    user_id UUID,
    request_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL,
    last_request TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(key, user_id, window_start)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_metrics_key_user 
ON public.rate_limit_metrics(key, user_id);

CREATE INDEX IF NOT EXISTS idx_rate_limit_metrics_window 
ON public.rate_limit_metrics(window_start);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_rate_limit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rate_limit_config_timestamp
    BEFORE UPDATE ON public.rate_limit_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_rate_limit_timestamp();

CREATE TRIGGER update_rate_limit_metrics_timestamp
    BEFORE UPDATE ON public.rate_limit_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_rate_limit_timestamp();

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    allowed BOOLEAN,
    remaining INTEGER,
    reset_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_config public.rate_limit_config%ROWTYPE;
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
BEGIN
    -- Get rate limit config
    SELECT * INTO v_config
    FROM public.rate_limit_config
    WHERE key = p_key AND enabled = true;

    IF NOT FOUND THEN
        RETURN QUERY SELECT true::BOOLEAN, NULL::INTEGER, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Calculate current window
    v_window_start := date_trunc('second', NOW()) - 
                     (extract(epoch FROM NOW())::INTEGER % v_config.window_seconds || ' seconds')::INTERVAL;

    -- Get or create metrics record
    INSERT INTO public.rate_limit_metrics (
        key,
        user_id,
        request_count,
        window_start,
        last_request
    )
    VALUES (
        p_key,
        p_user_id,
        1,
        v_window_start,
        NOW()
    )
    ON CONFLICT (key, user_id, window_start)
    DO UPDATE SET
        request_count = public.rate_limit_metrics.request_count + 1,
        last_request = NOW()
    RETURNING request_count INTO v_current_count;

    -- Calculate remaining requests and reset time
    RETURN QUERY
    SELECT 
        (v_current_count <= COALESCE(v_config.burst_limit, v_config.max_requests))::BOOLEAN,
        GREATEST(0, COALESCE(v_config.burst_limit, v_config.max_requests) - v_current_count),
        v_window_start + (v_config.window_seconds || ' seconds')::INTERVAL;
END;
$$;

-- Function to get rate limit metrics
CREATE OR REPLACE FUNCTION public.get_rate_limit_metrics(
    p_key TEXT,
    p_user_id UUID DEFAULT NULL,
    p_window_start TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '24 hours')
)
RETURNS TABLE (
    window_start TIMESTAMPTZ,
    request_count INTEGER,
    last_request TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rm.window_start,
        rm.request_count,
        rm.last_request
    FROM public.rate_limit_metrics rm
    WHERE rm.key = p_key
    AND (p_user_id IS NULL OR rm.user_id = p_user_id)
    AND rm.window_start >= p_window_start
    ORDER BY rm.window_start DESC;
END;
$$;

-- Insert default configurations
INSERT INTO public.rate_limit_config 
(key, max_requests, window_seconds, burst_limit)
VALUES 
('auth', 5, 60, 10),
('api', 100, 60, 120)
ON CONFLICT (key) DO NOTHING;

-- Add RLS policies
ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rate limit config"
ON public.rate_limit_config
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Users can view their own rate limit metrics"
ON public.rate_limit_metrics
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
GRANT SELECT ON public.rate_limit_config TO authenticated;
GRANT SELECT ON public.rate_limit_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rate_limit_metrics TO authenticated;

COMMIT; 