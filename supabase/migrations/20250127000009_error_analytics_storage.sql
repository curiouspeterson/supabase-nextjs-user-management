-- Error Analytics Storage Migration
BEGIN;

-- Add error analytics storage table
CREATE TABLE IF NOT EXISTS public.error_analytics_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    data JSONB NOT NULL,
    size_bytes INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed TIMESTAMPTZ,
    retention_days INTEGER DEFAULT 30,
    UNIQUE(component, storage_key)
);

-- Add storage quota table
CREATE TABLE IF NOT EXISTS public.storage_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component TEXT UNIQUE NOT NULL,
    max_size_bytes INTEGER NOT NULL DEFAULT 5242880, -- 5MB default
    current_size_bytes INTEGER NOT NULL DEFAULT 0,
    quota_alert_threshold FLOAT NOT NULL DEFAULT 0.8,
    last_cleanup TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_error_analytics_last_accessed 
ON public.error_analytics_storage(last_accessed);

CREATE INDEX IF NOT EXISTS idx_error_analytics_component 
ON public.error_analytics_storage(component);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_error_analytics_storage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_error_analytics_storage_timestamp
    BEFORE UPDATE ON public.error_analytics_storage
    FOR EACH ROW
    EXECUTE FUNCTION public.update_error_analytics_storage_updated_at();

-- Function to save error analytics data
CREATE OR REPLACE FUNCTION public.save_error_analytics_data(
    p_component TEXT,
    p_storage_key TEXT,
    p_data JSONB,
    p_size_bytes INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_storage_id UUID;
    v_current_quota public.storage_quotas%ROWTYPE;
    v_new_total_size INTEGER;
BEGIN
    -- Get or create quota record
    INSERT INTO public.storage_quotas (component)
    VALUES (p_component)
    ON CONFLICT (component) DO UPDATE
    SET updated_at = NOW()
    RETURNING * INTO v_current_quota;

    -- Calculate new total size
    v_new_total_size := v_current_quota.current_size_bytes + p_size_bytes;

    -- Check quota
    IF v_new_total_size > v_current_quota.max_size_bytes THEN
        RAISE EXCEPTION 'Storage quota exceeded for component %', p_component
        USING HINT = 'Consider cleaning up old data or increasing quota';
    END IF;

    -- Insert or update data
    INSERT INTO public.error_analytics_storage (
        component,
        storage_key,
        data,
        size_bytes,
        last_accessed
    )
    VALUES (
        p_component,
        p_storage_key,
        p_data,
        p_size_bytes,
        NOW()
    )
    ON CONFLICT (component, storage_key)
    DO UPDATE SET
        data = EXCLUDED.data,
        size_bytes = EXCLUDED.size_bytes,
        last_accessed = NOW()
    RETURNING id INTO v_storage_id;

    -- Update quota usage
    UPDATE public.storage_quotas
    SET current_size_bytes = v_new_total_size,
        updated_at = NOW()
    WHERE component = p_component;

    RETURN v_storage_id;
END;
$$;

-- Function to get error analytics data
CREATE OR REPLACE FUNCTION public.get_error_analytics_data(
    p_component TEXT,
    p_storage_key TEXT
)
RETURNS TABLE (
    data JSONB,
    size_bytes INTEGER,
    last_accessed TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.error_analytics_storage
    SET last_accessed = NOW()
    WHERE component = p_component
    AND storage_key = p_storage_key
    RETURNING data, size_bytes, last_accessed;
END;
$$;

-- Function to cleanup old data
CREATE OR REPLACE FUNCTION public.cleanup_error_analytics_storage(
    p_component TEXT,
    p_older_than_days INTEGER DEFAULT 30
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
    v_freed_bytes INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM public.error_analytics_storage
        WHERE component = p_component
        AND (
            (last_accessed < NOW() - (retention_days || ' days')::INTERVAL)
            OR
            (last_accessed < NOW() - (p_older_than_days || ' days')::INTERVAL)
        )
        RETURNING size_bytes
    )
    SELECT COUNT(*), COALESCE(SUM(size_bytes), 0)
    INTO v_deleted_count, v_freed_bytes
    FROM deleted;

    -- Update quota usage
    UPDATE public.storage_quotas
    SET current_size_bytes = GREATEST(0, current_size_bytes - v_freed_bytes),
        last_cleanup = NOW()
    WHERE component = p_component;

    RETURN v_deleted_count;
END;
$$;

-- Function to check storage quota status
CREATE OR REPLACE FUNCTION public.check_storage_quota_status(
    p_component TEXT
)
RETURNS TABLE (
    current_size_bytes INTEGER,
    max_size_bytes INTEGER,
    usage_percentage FLOAT,
    needs_cleanup BOOLEAN,
    last_cleanup TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sq.current_size_bytes,
        sq.max_size_bytes,
        CASE
            WHEN sq.max_size_bytes > 0 
            THEN (sq.current_size_bytes::FLOAT / sq.max_size_bytes::FLOAT * 100)
            ELSE 0
        END as usage_percentage,
        CASE
            WHEN sq.current_size_bytes >= (sq.max_size_bytes * sq.quota_alert_threshold)
            THEN TRUE
            ELSE FALSE
        END as needs_cleanup,
        sq.last_cleanup
    FROM public.storage_quotas sq
    WHERE component = p_component;
END;
$$;

-- Add RLS policies
ALTER TABLE public.error_analytics_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their component data"
ON public.error_analytics_storage
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Users can manage their component quotas"
ON public.storage_quotas
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.error_analytics_storage TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.storage_quotas TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_error_analytics_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_error_analytics_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_error_analytics_storage TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_storage_quota_status TO authenticated;

COMMIT; 