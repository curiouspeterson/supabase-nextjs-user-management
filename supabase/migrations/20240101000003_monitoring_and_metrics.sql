-- Monitoring and Metrics Migration
-- This migration sets up health monitoring, metrics tracking, and alert system
BEGIN;

------ TABLES ------
-- Alert templates table
CREATE TABLE public.alert_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category alert_category NOT NULL,
    name TEXT NOT NULL,
    message_template TEXT NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'MEDIUM',
    is_active BOOLEAN NOT NULL DEFAULT true,
    context_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- Alerts table
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.alert_templates(id),
    message TEXT NOT NULL,
    context JSONB NOT NULL DEFAULT '{}'::jsonb,
    severity alert_severity NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Health check configuration table
CREATE TABLE public.health_check_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    check_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    schedule TEXT NOT NULL DEFAULT '0 * * * *',
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, check_name)
);

-- Health check results table
CREATE TABLE public.health_check_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    config_id UUID NOT NULL REFERENCES public.health_check_config(id),
    status TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    duration_ms INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduler metrics table
CREATE TABLE public.scheduler_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status public.system_status NOT NULL DEFAULT 'HEALTHY',
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    context JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_metrics_schema CHECK (
        jsonb_typeof(metrics->'coverage_deficit') = 'number' AND
        jsonb_typeof(metrics->'overtime_violations') = 'number' AND
        jsonb_typeof(metrics->'pattern_errors') = 'number' AND
        jsonb_typeof(metrics->'schedule_generation_time') = 'number'
    )
);

-- Status colors table
CREATE TABLE public.status_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    status public.system_status NOT NULL,
    color_class TEXT NOT NULL,
    background_class TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, status)
);

------ INDEXES ------
CREATE INDEX idx_alerts_org_date ON public.alerts(organization_id, created_at);
CREATE INDEX idx_alerts_template ON public.alerts(template_id);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_health_results_org_date ON public.health_check_results(organization_id, created_at);
CREATE INDEX idx_health_results_config ON public.health_check_results(config_id);
CREATE INDEX idx_health_results_status ON public.health_check_results(status);
CREATE INDEX idx_metrics_org_time ON public.scheduler_metrics(organization_id, timestamp DESC);
CREATE INDEX idx_metrics_status ON public.scheduler_metrics(status);

------ FUNCTIONS ------
-- Generate health alerts function
CREATE OR REPLACE FUNCTION public.generate_health_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert alerts for consecutive days
    INSERT INTO public.alerts (
        organization_id,
        template_id,
        message,
        context,
        severity
    )
    SELECT 
        e.organization_id,
        t.id as template_id,
        format(t.message_template, e.full_name, count(*)) as message,
        jsonb_build_object(
            'employee_id', e.id,
            'employee_name', e.full_name,
            'consecutive_days', count(*)
        ) as context,
        t.severity
    FROM public.employees e
    JOIN public.schedules s ON s.employee_id = e.id
    JOIN public.alert_templates t ON t.organization_id = e.organization_id
    WHERE t.category = 'SCHEDULE'
    AND t.name = 'consecutive_days'
    GROUP BY e.id, e.organization_id, e.full_name, t.id, t.message_template, t.severity
    HAVING count(*) > 7;

    -- Insert alerts for coverage gaps
    INSERT INTO public.alerts (
        organization_id,
        template_id,
        message,
        context,
        severity
    )
    SELECT 
        c.organization_id,
        t.id as template_id,
        format(t.message_template, c.date, p.name) as message,
        jsonb_build_object(
            'date', c.date,
            'period', p.name,
            'required', c.required_coverage,
            'actual', c.actual_coverage
        ) as context,
        t.severity
    FROM public.coverage c
    JOIN public.periods p ON p.id = c.period_id
    JOIN public.alert_templates t ON t.organization_id = c.organization_id
    WHERE t.category = 'COVERAGE'
    AND t.name = 'coverage_gap'
    AND c.actual_coverage < c.required_coverage;
END;
$$;

-- Get metrics history function
CREATE OR REPLACE FUNCTION public.get_metrics_history(
    p_organization_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_interval INTERVAL DEFAULT '1 hour'::INTERVAL
)
RETURNS TABLE (
    timestamp TIMESTAMPTZ,
    status public.system_status,
    metrics JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        time_bucket(p_interval, m.timestamp) AS timestamp,
        mode() WITHIN GROUP (ORDER BY m.status) AS status,
        jsonb_build_object(
            'coverage_deficit', avg((m.metrics->>'coverage_deficit')::numeric),
            'overtime_violations', sum((m.metrics->>'overtime_violations')::numeric),
            'pattern_errors', sum((m.metrics->>'pattern_errors')::numeric),
            'schedule_generation_time', avg((m.metrics->>'schedule_generation_time')::numeric)
        ) AS metrics
    FROM public.scheduler_metrics m
    WHERE m.organization_id = p_organization_id
    AND m.timestamp BETWEEN p_start_date AND p_end_date
    GROUP BY time_bucket(p_interval, m.timestamp)
    ORDER BY timestamp DESC;
END;
$$;

------ TRIGGERS ------
-- Add updated_at triggers
CREATE TRIGGER update_alert_templates_updated_at
    BEFORE UPDATE ON public.alert_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_health_check_config_updated_at
    BEFORE UPDATE ON public.health_check_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_status_colors_updated_at
    BEFORE UPDATE ON public.status_colors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

------ DEFAULT DATA ------
-- Insert default status colors
INSERT INTO public.status_colors (organization_id, status, color_class, background_class)
SELECT 
    org.id,
    status,
    color_class,
    background_class
FROM public.organizations org
CROSS JOIN (
    VALUES 
        ('HEALTHY', 'text-green-700', 'bg-green-100'),
        ('DEGRADED', 'text-yellow-700', 'bg-yellow-100'),
        ('CRITICAL', 'text-red-700', 'bg-red-100'),
        ('MAINTENANCE', 'text-blue-700', 'bg-blue-100')
) AS colors(status, color_class, background_class)
ON CONFLICT (organization_id, status) DO UPDATE
SET
    color_class = EXCLUDED.color_class,
    background_class = EXCLUDED.background_class;

------ RLS POLICIES ------
-- Enable RLS
ALTER TABLE public.alert_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_check_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduler_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_colors ENABLE ROW LEVEL SECURITY;

-- Alert template policies
CREATE POLICY "Users can view their organization's alert templates"
    ON public.alert_templates
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = alert_templates.organization_id
        )
    );

-- Alert policies
CREATE POLICY "Users can view their organization's alerts"
    ON public.alerts
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = alerts.organization_id
        )
    );

-- Health check policies
CREATE POLICY "Users can view their organization's health checks"
    ON public.health_check_config
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = health_check_config.organization_id
        )
    );

CREATE POLICY "Users can view their organization's health results"
    ON public.health_check_results
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = health_check_results.organization_id
        )
    );

-- Metrics policies
CREATE POLICY "Users can view their organization's metrics"
    ON public.scheduler_metrics
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = scheduler_metrics.organization_id
        )
    );

-- Status color policies
CREATE POLICY "Users can view their organization's status colors"
    ON public.status_colors
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = status_colors.organization_id
        )
    );

------ GRANTS ------
GRANT SELECT ON public.alert_templates TO authenticated;
GRANT SELECT ON public.alerts TO authenticated;
GRANT SELECT ON public.health_check_config TO authenticated;
GRANT SELECT ON public.health_check_results TO authenticated;
GRANT SELECT ON public.scheduler_metrics TO authenticated;
GRANT SELECT ON public.status_colors TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_health_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_metrics_history TO authenticated;

COMMIT; 