-- Logging and Audit Migration
-- This migration sets up request logging, operation tracking, and audit trails
BEGIN;

------ ENUMS ------
-- Log level enum
CREATE TYPE public.log_level AS ENUM (
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR'
);

-- Employee operation enum
CREATE TYPE public.employee_operation AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'RESTORE'
);

-- Operation severity enum
CREATE TYPE public.operation_severity AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

------ TABLES ------
-- Request logs table
CREATE TABLE public.request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level public.log_level NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    request_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    user_data JSONB,
    metadata JSONB,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        jsonb_typeof(request_data) = 'object' AND
        (user_data IS NULL OR jsonb_typeof(user_data) = 'object') AND
        (metadata IS NULL OR jsonb_typeof(metadata) = 'object')
    )
);

-- Employee operations table
CREATE TABLE public.employee_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operation employee_operation NOT NULL,
    severity operation_severity NOT NULL DEFAULT 'LOW',
    status TEXT NOT NULL DEFAULT 'pending',
    error_code TEXT,
    error_details TEXT,
    stack_trace TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    client_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'retrying'))
);

-- Audit logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_info JSONB,
    CONSTRAINT valid_operation CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
);

------ INDEXES ------
CREATE INDEX idx_request_logs_level ON public.request_logs(level);
CREATE INDEX idx_request_logs_created_at ON public.request_logs(created_at DESC);
CREATE INDEX idx_request_logs_org ON public.request_logs(organization_id);
CREATE INDEX idx_employee_operations_employee ON public.employee_operations(employee_id);
CREATE INDEX idx_employee_operations_status ON public.employee_operations(status);
CREATE INDEX idx_employee_operations_created ON public.employee_operations(created_at DESC);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_at ON public.audit_logs(changed_at DESC);

------ FUNCTIONS ------
-- Track employee operation function
CREATE OR REPLACE FUNCTION public.track_employee_operation(
    p_employee_id UUID,
    p_operation employee_operation,
    p_severity operation_severity DEFAULT 'LOW',
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_client_info JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_operation_id UUID;
BEGIN
    INSERT INTO public.employee_operations (
        employee_id,
        operation,
        severity,
        metadata,
        client_info,
        created_by
    ) VALUES (
        p_employee_id,
        p_operation,
        p_severity,
        p_metadata,
        p_client_info,
        auth.uid()
    )
    RETURNING id INTO v_operation_id;

    RETURN v_operation_id;
END;
$$;

-- Complete employee operation function
CREATE OR REPLACE FUNCTION public.complete_employee_operation(
    p_operation_id UUID,
    p_status TEXT DEFAULT 'completed',
    p_error_code TEXT DEFAULT NULL,
    p_error_details TEXT DEFAULT NULL,
    p_stack_trace TEXT DEFAULT NULL
)
RETURNS public.employee_operations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_operation public.employee_operations;
BEGIN
    UPDATE public.employee_operations
    SET status = p_status,
        error_code = p_error_code,
        error_details = p_error_details,
        stack_trace = p_stack_trace,
        updated_at = NOW(),
        retry_count = CASE 
            WHEN p_status = 'retrying' 
            THEN retry_count + 1 
            ELSE retry_count 
        END,
        last_retry_at = CASE 
            WHEN p_status = 'retrying' 
            THEN NOW() 
            ELSE last_retry_at 
        END
    WHERE id = p_operation_id
    RETURNING * INTO v_operation;

    RETURN v_operation;
END;
$$;

-- Log request function
CREATE OR REPLACE FUNCTION public.log_request(
    p_level public.log_level DEFAULT 'INFO',
    p_message TEXT,
    p_request_data JSONB DEFAULT '{}'::jsonb,
    p_user_data JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_organization_id UUID;
    v_log_id UUID;
BEGIN
    -- Get organization ID from user data if available
    IF p_user_data IS NOT NULL AND p_user_data ? 'id' THEN
        SELECT organization_id INTO v_organization_id
        FROM public.organization_users
        WHERE user_id = (p_user_data->>'id')::UUID
        LIMIT 1;
    END IF;

    -- Insert log entry
    INSERT INTO public.request_logs (
        level,
        message,
        request_data,
        user_data,
        metadata,
        organization_id
    )
    VALUES (
        p_level,
        p_message,
        p_request_data,
        p_user_data,
        p_metadata,
        v_organization_id
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

-- Create audit log function
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        changed_by,
        client_info
    ) VALUES (
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        CASE 
            WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE'
            THEN to_jsonb(OLD)
            ELSE NULL
        END,
        CASE 
            WHEN TG_OP = 'UPDATE' OR TG_OP = 'INSERT'
            THEN to_jsonb(NEW)
            ELSE NULL
        END,
        auth.uid(),
        jsonb_build_object(
            'application_name', current_setting('application_name', true),
            'ip_address', inet_client_addr(),
            'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
        )
    );
    
    RETURN NULL;
END;
$$;

------ TRIGGERS ------
-- Add updated_at trigger
CREATE TRIGGER update_employee_operations_updated_at
    BEFORE UPDATE ON public.employee_operations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Add audit triggers for key tables
CREATE TRIGGER audit_employees
    AFTER INSERT OR UPDATE OR DELETE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER audit_time_off_requests
    AFTER INSERT OR UPDATE OR DELETE ON public.time_off_requests
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER audit_schedules
    AFTER INSERT OR UPDATE OR DELETE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

------ RLS POLICIES ------
-- Enable RLS
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Request logs policies
CREATE POLICY "Admins can view all logs"
    ON public.request_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'ADMIN'
        )
    );

-- Employee operations policies
CREATE POLICY "Admins can view all employee operations"
    ON public.employee_operations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Users can view their own operations"
    ON public.employee_operations
    FOR SELECT
    USING (
        employee_id = auth.uid() OR
        created_by = auth.uid()
    );

-- Audit logs policies
CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'ADMIN'
        )
    );

------ GRANTS ------
GRANT SELECT ON public.request_logs TO authenticated;
GRANT SELECT ON public.employee_operations TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_employee_operation TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_employee_operation TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_request TO authenticated;

COMMIT; 