-- Monitoring and Logging Migration
-- This migration sets up the monitoring and logging system
BEGIN;

------ Error Logs Table ------
CREATE TABLE IF NOT EXISTS public.error_logs (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    error_code text NOT NULL,
    message text NOT NULL,
    severity public.auth_error_severity NOT NULL DEFAULT 'LOW',
    context jsonb,
    stack_trace text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid REFERENCES auth.users(id),
    resolution_notes text
);

------ Monitoring Tables ------
-- System metrics table
CREATE TABLE public.system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type TEXT NOT NULL,
    tags JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_details TEXT,
    context JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

------ Indexes ------
-- Error logs indexes
CREATE INDEX IF NOT EXISTS error_logs_error_code_idx ON public.error_logs (error_code);
CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON public.error_logs (severity);
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON public.error_logs (user_id);
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON public.error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_resolved_at_idx ON public.error_logs (resolved_at);

-- System metrics indexes
CREATE INDEX idx_system_metrics_name ON public.system_metrics(metric_name);
CREATE INDEX idx_system_metrics_timestamp ON public.system_metrics(timestamp DESC);

-- Performance metrics indexes
CREATE INDEX idx_performance_metrics_operation ON public.performance_metrics(operation);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(timestamp DESC);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

------ Logging Functions ------
-- Function to log errors
CREATE OR REPLACE FUNCTION public.log_error(
    p_error_code text,
    p_message text,
    p_severity public.auth_error_severity DEFAULT 'LOW',
    p_context jsonb DEFAULT NULL,
    p_stack_trace text DEFAULT NULL,
    p_user_id uuid DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id bigint;
BEGIN
    INSERT INTO public.error_logs (
        error_code,
        message,
        severity,
        context,
        stack_trace,
        user_id
    )
    VALUES (
        p_error_code,
        p_message,
        p_severity,
        p_context,
        p_stack_trace,
        p_user_id
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

-- Function to resolve error logs
CREATE OR REPLACE FUNCTION public.resolve_error_log(
    p_log_id bigint,
    p_resolved_by uuid,
    p_resolution_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.error_logs
    SET 
        resolved_at = timezone('utc'::text, now()),
        resolved_by = p_resolved_by,
        resolution_notes = p_resolution_notes
    WHERE 
        id = p_log_id
        AND resolved_at IS NULL;

    RETURN FOUND;
END;
$$;

-- Function to get unresolved errors
CREATE OR REPLACE FUNCTION public.get_unresolved_errors(
    p_severity public.auth_error_severity DEFAULT NULL,
    p_from_date timestamp with time zone DEFAULT NULL,
    p_to_date timestamp with time zone DEFAULT NULL
)
RETURNS TABLE (
    id bigint,
    error_code text,
    message text,
    severity public.auth_error_severity,
    context jsonb,
    stack_trace text,
    user_id uuid,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.error_code,
        e.message,
        e.severity,
        e.context,
        e.stack_trace,
        e.user_id,
        e.created_at
    FROM public.error_logs e
    WHERE 
        e.resolved_at IS NULL
        AND (p_severity IS NULL OR e.severity = p_severity)
        AND (p_from_date IS NULL OR e.created_at >= p_from_date)
        AND (p_to_date IS NULL OR e.created_at <= p_to_date)
    ORDER BY 
        CASE e.severity
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            WHEN 'LOW' THEN 4
        END,
        e.created_at DESC;
END;
$$;

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        metadata,
        ip_address,
        user_agent
    )
    VALUES (
        p_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values,
        p_metadata,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_audit_id;

    RETURN v_audit_id;
END;
$$;

-- Function to record system metrics
CREATE OR REPLACE FUNCTION public.record_system_metric(
    p_metric_name TEXT,
    p_metric_value NUMERIC,
    p_metric_type TEXT,
    p_tags JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_metric_id UUID;
BEGIN
    INSERT INTO public.system_metrics (
        metric_name,
        metric_value,
        metric_type,
        tags
    )
    VALUES (
        p_metric_name,
        p_metric_value,
        p_metric_type,
        p_tags
    )
    RETURNING id INTO v_metric_id;

    RETURN v_metric_id;
END;
$$;

-- Function to record performance metrics
CREATE OR REPLACE FUNCTION public.record_performance_metric(
    p_operation TEXT,
    p_duration_ms INTEGER,
    p_success BOOLEAN,
    p_error_details TEXT DEFAULT NULL,
    p_context JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_metric_id UUID;
BEGIN
    INSERT INTO public.performance_metrics (
        operation,
        duration_ms,
        success,
        error_details,
        context
    )
    VALUES (
        p_operation,
        p_duration_ms,
        p_success,
        p_error_details,
        p_context
    )
    RETURNING id INTO v_metric_id;

    RETURN v_metric_id;
END;
$$;

------ RLS Policies ------
-- Enable RLS on all tables
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Error logs policies
CREATE POLICY "Enable read access for authenticated users"
    ON public.error_logs
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users ou
            JOIN public.profiles p ON p.id = ou.user_id
            WHERE p.role IN ('ADMIN', 'MANAGER')
        )
    );

-- System metrics policies
CREATE POLICY "Enable read access for authenticated users"
    ON public.system_metrics
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users ou
            JOIN public.profiles p ON p.id = ou.user_id
            WHERE p.role IN ('ADMIN', 'MANAGER')
        )
    );

-- Performance metrics policies
CREATE POLICY "Enable read access for authenticated users"
    ON public.performance_metrics
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users ou
            JOIN public.profiles p ON p.id = ou.user_id
            WHERE p.role IN ('ADMIN', 'MANAGER')
        )
    );

-- Audit logs policies
CREATE POLICY "Enable read access for authenticated users"
    ON public.audit_logs
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users ou
            JOIN public.profiles p ON p.id = ou.user_id
            WHERE p.role IN ('ADMIN', 'MANAGER')
        )
    );

------ Grants ------
-- Grant permissions for monitoring functions
GRANT EXECUTE ON FUNCTION public.log_error TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_error_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unresolved_errors TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_system_metric TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_performance_metric TO authenticated;

-- Grant permissions for monitoring tables
GRANT SELECT ON public.error_logs TO authenticated;
GRANT SELECT ON public.system_metrics TO authenticated;
GRANT SELECT ON public.performance_metrics TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

COMMIT; 