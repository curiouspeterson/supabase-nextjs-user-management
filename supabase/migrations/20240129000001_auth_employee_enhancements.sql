-- Migration: Add Authentication and Employee Management Enhancements
BEGIN;

------ Enum Types ------
DO $$ BEGIN
    CREATE TYPE public.employee_operation AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.employee_role_enum AS ENUM ('Dispatcher', 'Shift Supervisor', 'Management');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.time_off_access_level AS ENUM ('SELF', 'TEAM', 'ALL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

------ Authentication Tables ------
CREATE TABLE IF NOT EXISTS public.auth_confirmation_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    confirmed_at TIMESTAMPTZ,
    token_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.auth_error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    error_code error_status_code NOT NULL,
    error_message TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.password_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    min_length INTEGER NOT NULL DEFAULT 8,
    require_uppercase BOOLEAN NOT NULL DEFAULT true,
    require_lowercase BOOLEAN NOT NULL DEFAULT true,
    require_numbers BOOLEAN NOT NULL DEFAULT true,
    require_special_chars BOOLEAN NOT NULL DEFAULT true,
    password_history_count INTEGER NOT NULL DEFAULT 3,
    max_age_days INTEGER NOT NULL DEFAULT 90,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

------ Employee Management Tables ------
CREATE TABLE IF NOT EXISTS public.employee_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employee_role_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    previous_role employee_role_enum,
    new_role employee_role_enum NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

------ Indexes ------
CREATE INDEX IF NOT EXISTS idx_auth_confirmation_attempts_user ON public.auth_confirmation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_confirmation_attempts_expires ON public.auth_confirmation_attempts(expires_at);

CREATE INDEX IF NOT EXISTS idx_auth_error_logs_user ON public.auth_error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_error_logs_code ON public.auth_error_logs(error_code);
CREATE INDEX IF NOT EXISTS idx_auth_error_logs_created ON public.auth_error_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_password_history_user ON public.password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created ON public.password_history(created_at);

CREATE INDEX IF NOT EXISTS idx_employee_access_logs_employee ON public.employee_access_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_access_logs_action ON public.employee_access_logs(action);
CREATE INDEX IF NOT EXISTS idx_employee_access_logs_created ON public.employee_access_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_employee_role_history_employee ON public.employee_role_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_role_history_created ON public.employee_role_history(created_at);

------ Functions ------
CREATE OR REPLACE FUNCTION public.log_employee_access(
    p_employee_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.employee_access_logs (
        employee_id,
        action,
        resource_type,
        resource_id,
        ip_address,
        user_agent
    ) VALUES (
        p_employee_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.record_role_change(
    p_employee_id UUID,
    p_new_role employee_role_enum,
    p_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_previous_role employee_role_enum;
    v_log_id UUID;
BEGIN
    -- Get the current role
    SELECT employee_role INTO v_previous_role
    FROM public.employees
    WHERE id = p_employee_id;

    -- Record the change
    INSERT INTO public.employee_role_history (
        employee_id,
        previous_role,
        new_role,
        changed_by,
        reason
    ) VALUES (
        p_employee_id,
        v_previous_role,
        p_new_role,
        auth.uid(),
        p_reason
    ) RETURNING id INTO v_log_id;

    -- Update the employee record
    UPDATE public.employees
    SET employee_role = p_new_role,
        updated_at = NOW()
    WHERE id = p_employee_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

------ RLS Policies ------
ALTER TABLE public.auth_confirmation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_role_history ENABLE ROW LEVEL SECURITY;

-- Auth Confirmation Attempts Policies
CREATE POLICY "Users can view their own confirmation attempts"
    ON public.auth_confirmation_attempts
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Auth Error Logs Policies
CREATE POLICY "Users can view their own error logs"
    ON public.auth_error_logs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all error logs"
    ON public.auth_error_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- Password History Policies
CREATE POLICY "Users can read their own password history"
    ON public.password_history
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Password Policies Policies
CREATE POLICY "Admins can manage password policies"
    ON public.password_policies
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- Employee Access Logs Policies
CREATE POLICY "Users can view their own access logs"
    ON public.employee_access_logs
    FOR SELECT
    TO authenticated
    USING (employee_id = auth.uid());

CREATE POLICY "Admins can view all access logs"
    ON public.employee_access_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- Employee Role History Policies
CREATE POLICY "Users can view their own role history"
    ON public.employee_role_history
    FOR SELECT
    TO authenticated
    USING (employee_id = auth.uid());

CREATE POLICY "Admins can view all role history"
    ON public.employee_role_history
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

COMMIT; 