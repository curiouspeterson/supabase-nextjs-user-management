-- Error Analytics Configuration Migration
BEGIN;

-- Add error analytics configuration table
CREATE TABLE IF NOT EXISTS public.error_analytics_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component TEXT NOT NULL UNIQUE,
    max_contexts INTEGER NOT NULL DEFAULT 100,
    max_user_agents INTEGER NOT NULL DEFAULT 50,
    max_urls INTEGER NOT NULL DEFAULT 100,
    max_trends INTEGER NOT NULL DEFAULT 1000,
    trend_period_ms INTEGER NOT NULL DEFAULT 3600000,
    retention_days INTEGER NOT NULL DEFAULT 30,
    batch_size INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add error analytics storage table
CREATE TABLE IF NOT EXISTS public.error_analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component TEXT NOT NULL,
    error_type TEXT NOT NULL,
    error_message TEXT,
    context JSONB,
    user_agent TEXT,
    url TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    batch_id UUID,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add error analytics trends table
CREATE TABLE IF NOT EXISTS public.error_analytics_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component TEXT NOT NULL,
    error_type TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    first_seen TIMESTAMPTZ NOT NULL,
    last_seen TIMESTAMPTZ NOT NULL,
    contexts JSONB DEFAULT '[]'::JSONB,
    user_agents JSONB DEFAULT '[]'::JSONB,
    urls JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_error_analytics_data_component 
ON public.error_analytics_data(component);

CREATE INDEX IF NOT EXISTS idx_error_analytics_data_timestamp 
ON public.error_analytics_data(timestamp);

CREATE INDEX IF NOT EXISTS idx_error_analytics_trends_component 
ON public.error_analytics_trends(component);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_error_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_error_analytics_config_timestamp
    BEFORE UPDATE ON public.error_analytics_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_error_analytics_timestamp();

CREATE TRIGGER update_error_analytics_trends_timestamp
    BEFORE UPDATE ON public.error_analytics_trends
    FOR EACH ROW
    EXECUTE FUNCTION public.update_error_analytics_timestamp();

-- Function to process error analytics batch
CREATE OR REPLACE FUNCTION public.process_error_analytics_batch(
    p_batch_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_config public.error_analytics_config%ROWTYPE;
    v_data public.error_analytics_data%ROWTYPE;
BEGIN
    FOR v_data IN 
        SELECT * FROM public.error_analytics_data 
        WHERE batch_id = p_batch_id 
        AND processed = false
    LOOP
        -- Get config for component
        SELECT * INTO v_config
        FROM public.error_analytics_config
        WHERE component = v_data.component;

        -- Insert or update trend
        INSERT INTO public.error_analytics_trends (
            component,
            error_type,
            count,
            first_seen,
            last_seen,
            contexts,
            user_agents,
            urls
        )
        VALUES (
            v_data.component,
            v_data.error_type,
            1,
            v_data.timestamp,
            v_data.timestamp,
            CASE WHEN v_data.context IS NOT NULL 
                THEN jsonb_build_array(v_data.context)
                ELSE '[]'::jsonb
            END,
            CASE WHEN v_data.user_agent IS NOT NULL 
                THEN jsonb_build_array(v_data.user_agent)
                ELSE '[]'::jsonb
            END,
            CASE WHEN v_data.url IS NOT NULL 
                THEN jsonb_build_array(v_data.url)
                ELSE '[]'::jsonb
            END
        )
        ON CONFLICT (component, error_type)
        DO UPDATE SET
            count = public.error_analytics_trends.count + 1,
            last_seen = v_data.timestamp,
            contexts = (
                SELECT jsonb_agg(value)
                FROM (
                    SELECT DISTINCT value
                    FROM jsonb_array_elements(
                        public.error_analytics_trends.contexts || 
                        CASE WHEN v_data.context IS NOT NULL 
                            THEN jsonb_build_array(v_data.context)
                            ELSE '[]'::jsonb
                        END
                    )
                    LIMIT COALESCE(v_config.max_contexts, 100)
                ) t
            ),
            user_agents = (
                SELECT jsonb_agg(value)
                FROM (
                    SELECT DISTINCT value
                    FROM jsonb_array_elements(
                        public.error_analytics_trends.user_agents || 
                        CASE WHEN v_data.user_agent IS NOT NULL 
                            THEN jsonb_build_array(v_data.user_agent)
                            ELSE '[]'::jsonb
                        END
                    )
                    LIMIT COALESCE(v_config.max_user_agents, 50)
                ) t
            ),
            urls = (
                SELECT jsonb_agg(value)
                FROM (
                    SELECT DISTINCT value
                    FROM jsonb_array_elements(
                        public.error_analytics_trends.urls || 
                        CASE WHEN v_data.url IS NOT NULL 
                            THEN jsonb_build_array(v_data.url)
                            ELSE '[]'::jsonb
                        END
                    )
                    LIMIT COALESCE(v_config.max_urls, 100)
                ) t
            );

        -- Mark data as processed
        UPDATE public.error_analytics_data
        SET processed = true
        WHERE id = v_data.id;
    END LOOP;
END;
$$;

-- Function to cleanup old error analytics data
CREATE OR REPLACE FUNCTION public.cleanup_error_analytics_data(
    p_component TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_config public.error_analytics_config%ROWTYPE;
BEGIN
    -- Get config for component
    SELECT * INTO v_config
    FROM public.error_analytics_config
    WHERE component = p_component;

    -- Delete old data
    DELETE FROM public.error_analytics_data
    WHERE component = p_component
    AND timestamp < NOW() - (COALESCE(v_config.retention_days, 30) || ' days')::INTERVAL;

    -- Cleanup old trends
    DELETE FROM public.error_analytics_trends
    WHERE component = p_component
    AND last_seen < NOW() - (COALESCE(v_config.retention_days, 30) || ' days')::INTERVAL;
END;
$$;

-- Add RLS policies
ALTER TABLE public.error_analytics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_analytics_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage error analytics config"
ON public.error_analytics_config
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Users can insert error analytics data"
ON public.error_analytics_data
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their component error analytics"
ON public.error_analytics_trends
FOR SELECT
TO authenticated
USING (true);

-- Grant permissions
GRANT SELECT ON public.error_analytics_config TO authenticated;
GRANT INSERT ON public.error_analytics_data TO authenticated;
GRANT SELECT ON public.error_analytics_trends TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_error_analytics_batch TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_error_analytics_data TO authenticated;

-- Insert default configuration
INSERT INTO public.error_analytics_config 
(component, max_contexts, max_user_agents, max_urls, max_trends, trend_period_ms, retention_days, batch_size)
VALUES 
('default', 100, 50, 100, 1000, 3600000, 30, 50)
ON CONFLICT (component) DO NOTHING;

COMMIT; 