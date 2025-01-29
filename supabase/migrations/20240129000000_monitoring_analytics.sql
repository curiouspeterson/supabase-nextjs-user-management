-- Migration: Add Monitoring and Analytics System
BEGIN;

------ Enum Types ------
DO $$ BEGIN
    CREATE TYPE public.error_status_code AS ENUM (
        'BAD_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND',
        'METHOD_NOT_ALLOWED', 'CONFLICT', 'UNPROCESSABLE_ENTITY',
        'TOO_MANY_REQUESTS', 'INTERNAL_ERROR', 'NOT_IMPLEMENTED',
        'SERVICE_UNAVAILABLE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.operation_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.jwt_algorithm AS ENUM (
        'HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512',
        'ES256', 'ES384', 'ES512'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

------ Error Tracking Tables ------
CREATE TABLE IF NOT EXISTS public.error_analytics_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    retention_days INTEGER NOT NULL DEFAULT 30,
    alert_threshold INTEGER NOT NULL DEFAULT 100,
    notification_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.error_analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_code error_status_code NOT NULL,
    component_name TEXT NOT NULL,
    error_message TEXT,
    stack_trace TEXT,
    user_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.error_analytics_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_name TEXT NOT NULL,
    error_count INTEGER NOT NULL DEFAULT 0,
    time_period TIMESTAMPTZ NOT NULL,
    severity operation_severity NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.error_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_code error_status_code NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    last_occurrence TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity operation_severity NOT NULL DEFAULT 'LOW',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

------ JWT Audit Tables ------
CREATE TABLE IF NOT EXISTS public.jwt_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    token_id TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    algorithm jwt_algorithm NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jwt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    algorithm jwt_algorithm NOT NULL,
    validity_period INTERVAL NOT NULL,
    claims JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

------ Network Monitoring Tables ------
CREATE TABLE IF NOT EXISTS public.network_retry_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    average_latency FLOAT,
    last_retry TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

------ Storage Management ------
CREATE TABLE IF NOT EXISTS public.storage_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    storage_type TEXT NOT NULL,
    max_size_mb INTEGER NOT NULL,
    current_usage_mb INTEGER NOT NULL DEFAULT 0,
    alert_threshold_percentage INTEGER NOT NULL DEFAULT 80,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, storage_type)
);

------ Indexes ------
CREATE INDEX IF NOT EXISTS idx_error_analytics_data_code ON public.error_analytics_data(error_code);
CREATE INDEX IF NOT EXISTS idx_error_analytics_data_component ON public.error_analytics_data(component_name);
CREATE INDEX IF NOT EXISTS idx_error_analytics_data_created ON public.error_analytics_data(created_at);

CREATE INDEX IF NOT EXISTS idx_error_analytics_trends_component ON public.error_analytics_trends(component_name);
CREATE INDEX IF NOT EXISTS idx_error_analytics_trends_period ON public.error_analytics_trends(time_period);

CREATE INDEX IF NOT EXISTS idx_error_metrics_code ON public.error_metrics(error_code);
CREATE INDEX IF NOT EXISTS idx_error_metrics_severity ON public.error_metrics(severity);

CREATE INDEX IF NOT EXISTS idx_jwt_audit_logs_user ON public.jwt_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_jwt_audit_logs_token ON public.jwt_audit_logs(token_id);

CREATE INDEX IF NOT EXISTS idx_network_retry_metrics_endpoint ON public.network_retry_metrics(endpoint);

------ Functions ------
CREATE OR REPLACE FUNCTION public.update_error_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.log_jwt_token(
    p_user_id UUID,
    p_token_id TEXT,
    p_algorithm jwt_algorithm,
    p_validity_period INTERVAL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.jwt_audit_logs (
        user_id,
        token_id,
        algorithm,
        issued_at,
        expires_at,
        metadata
    ) VALUES (
        p_user_id,
        p_token_id,
        p_algorithm,
        NOW(),
        NOW() + p_validity_period,
        p_metadata
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

------ Triggers ------
CREATE TRIGGER update_error_analytics_config_timestamp
    BEFORE UPDATE ON public.error_analytics_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_error_analytics_timestamp();

CREATE TRIGGER update_error_analytics_trends_timestamp
    BEFORE UPDATE ON public.error_analytics_trends
    FOR EACH ROW
    EXECUTE FUNCTION public.update_error_analytics_timestamp();

CREATE TRIGGER update_error_metrics_timestamp
    BEFORE UPDATE ON public.error_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_error_analytics_timestamp();

------ RLS Policies ------
ALTER TABLE public.error_analytics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_analytics_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jwt_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jwt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_retry_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_quotas ENABLE ROW LEVEL SECURITY;

-- Error Analytics Config Policies
CREATE POLICY "Admins can manage error analytics config"
    ON public.error_analytics_config
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- Error Analytics Data Policies
CREATE POLICY "Users can insert error analytics data"
    ON public.error_analytics_data
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Error Analytics Trends Policies
CREATE POLICY "Users can view their component error analytics"
    ON public.error_analytics_trends
    FOR SELECT
    TO authenticated
    USING (true);

-- Error Metrics Policies
CREATE POLICY "Admins can view all error metrics"
    ON public.error_metrics
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- JWT Audit Logs Policies
CREATE POLICY "Users can view their own JWT audit logs"
    ON public.jwt_audit_logs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all JWT audit logs"
    ON public.jwt_audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- JWT Templates Policies
CREATE POLICY "Admins can manage JWT templates"
    ON public.jwt_templates
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- Network Retry Metrics Policies
CREATE POLICY "Admins can view all network retry metrics"
    ON public.network_retry_metrics
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- Storage Quotas Policies
CREATE POLICY "Users can manage their component quotas"
    ON public.storage_quotas
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

COMMIT; 