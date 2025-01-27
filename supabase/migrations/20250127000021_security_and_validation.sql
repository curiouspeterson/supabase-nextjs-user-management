-- Security and Validation Improvements Migration
BEGIN;

-- Create password policy type
CREATE TYPE public.password_policy AS (
    min_length INTEGER,
    require_uppercase BOOLEAN,
    require_lowercase BOOLEAN,
    require_numbers BOOLEAN,
    require_special_chars BOOLEAN,
    max_repeated_chars INTEGER,
    prohibited_patterns TEXT[],
    max_age_days INTEGER,
    history_size INTEGER
);

-- Create time zone policy type
CREATE TYPE public.timezone_policy AS (
    allowed_zones TEXT[],
    default_zone TEXT,
    dst_handling TEXT
);

-- Create validation domains
CREATE DOMAIN public.email AS TEXT
CHECK (
    VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

CREATE DOMAIN public.phone_number AS TEXT
CHECK (
    VALUE ~ '^\+?[1-9]\d{1,14}$'
);

CREATE DOMAIN public.strong_password AS TEXT
CHECK (
    LENGTH(VALUE) >= 8 AND
    VALUE ~ '[A-Z]' AND
    VALUE ~ '[a-z]' AND
    VALUE ~ '[0-9]' AND
    VALUE ~ '[!@#$%^&*(),.?":{}|<>]'
);

-- Create password history table
CREATE TABLE IF NOT EXISTS public.password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, password_hash)
);

-- Create password policy table
CREATE TABLE IF NOT EXISTS public.password_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    policy password_policy NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create timezone configuration table
CREATE TABLE IF NOT EXISTS public.timezone_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    policy timezone_policy NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_info JSONB
);

-- Function to validate password against policy
CREATE OR REPLACE FUNCTION public.validate_password(
    p_password TEXT,
    p_policy_name TEXT DEFAULT 'default'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_policy password_policy;
BEGIN
    -- Get policy
    SELECT policy INTO v_policy
    FROM public.password_policies
    WHERE name = p_policy_name;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Password policy % not found', p_policy_name;
    END IF;

    -- Validate length
    IF LENGTH(p_password) < v_policy.min_length THEN
        RETURN FALSE;
    END IF;

    -- Validate character requirements
    IF v_policy.require_uppercase AND NOT p_password ~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;

    IF v_policy.require_lowercase AND NOT p_password ~ '[a-z]' THEN
        RETURN FALSE;
    END IF;

    IF v_policy.require_numbers AND NOT p_password ~ '[0-9]' THEN
        RETURN FALSE;
    END IF;

    IF v_policy.require_special_chars AND NOT p_password ~ '[!@#$%^&*(),.?":{}|<>]' THEN
        RETURN FALSE;
    END IF;

    -- Check repeated characters
    IF v_policy.max_repeated_chars IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM regexp_matches(p_password, '(.)\\1{' || v_policy.max_repeated_chars || ',}', 'g')
        ) THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- Check prohibited patterns
    IF v_policy.prohibited_patterns IS NOT NULL THEN
        FOR i IN 1..array_length(v_policy.prohibited_patterns, 1) LOOP
            IF p_password ~ v_policy.prohibited_patterns[i] THEN
                RETURN FALSE;
            END IF;
        END LOOP;
    END IF;

    RETURN TRUE;
END;
$$;

-- Function to check password history
CREATE OR REPLACE FUNCTION public.check_password_history(
    p_user_id UUID,
    p_new_password TEXT,
    p_policy_name TEXT DEFAULT 'default'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_policy password_policy;
BEGIN
    -- Get policy
    SELECT policy INTO v_policy
    FROM public.password_policies
    WHERE name = p_policy_name;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Password policy % not found', p_policy_name;
    END IF;

    -- Check if password exists in history
    RETURN NOT EXISTS (
        SELECT 1
        FROM public.password_history
        WHERE user_id = p_user_id
        AND password_hash = crypt(p_new_password, password_hash)
        AND created_at > NOW() - (v_policy.max_age_days || ' days')::INTERVAL
        ORDER BY created_at DESC
        LIMIT v_policy.history_size
    );
END;
$$;

-- Function to convert timestamp to specified timezone
CREATE OR REPLACE FUNCTION public.convert_timezone(
    p_timestamp TIMESTAMPTZ,
    p_target_zone TEXT,
    p_config_name TEXT DEFAULT 'default'
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_policy timezone_policy;
BEGIN
    -- Get policy
    SELECT policy INTO v_policy
    FROM public.timezone_configs
    WHERE name = p_config_name;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Timezone config % not found', p_config_name;
    END IF;

    -- Validate target zone
    IF NOT p_target_zone = ANY(v_policy.allowed_zones) THEN
        RAISE EXCEPTION 'Timezone % is not allowed', p_target_zone;
    END IF;

    -- Convert timestamp
    RETURN p_timestamp AT TIME ZONE p_target_zone;
END;
$$;

-- Function to create audit log entry
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
            WHEN TG_OP = 'INSERT' THEN NULL
            ELSE to_jsonb(OLD)
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN NULL
            ELSE to_jsonb(NEW)
        END,
        auth.uid(),
        jsonb_build_object(
            'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
            'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Insert default password policy
INSERT INTO public.password_policies (
    name,
    policy
) VALUES (
    'default',
    ROW(
        12, -- min_length
        true, -- require_uppercase
        true, -- require_lowercase
        true, -- require_numbers
        true, -- require_special_chars
        3, -- max_repeated_chars
        ARRAY['password', '123456', 'qwerty'], -- prohibited_patterns
        90, -- max_age_days
        5 -- history_size
    )::password_policy
) ON CONFLICT (name) DO UPDATE
SET policy = EXCLUDED.policy,
    updated_at = NOW();

-- Insert default timezone config
INSERT INTO public.timezone_configs (
    name,
    policy
) VALUES (
    'default',
    ROW(
        ARRAY(SELECT name FROM pg_timezone_names), -- allowed_zones
        'UTC', -- default_zone
        'observe' -- dst_handling
    )::timezone_policy
) ON CONFLICT (name) DO UPDATE
SET policy = EXCLUDED.policy,
    updated_at = NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_password_history_user_created 
ON public.password_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record 
ON public.audit_logs(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at 
ON public.audit_logs(changed_at DESC);

-- Add RLS policies
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timezone_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can manage policies
CREATE POLICY "Admins can manage password policies"
ON public.password_policies
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Admins can manage timezone configs"
ON public.timezone_configs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

-- Users can read their own password history
CREATE POLICY "Users can read their own password history"
ON public.password_history
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Admins can read all audit logs
CREATE POLICY "Admins can read all audit logs"
ON public.audit_logs
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
GRANT SELECT ON public.password_policies TO authenticated;
GRANT SELECT ON public.timezone_configs TO authenticated;
GRANT SELECT ON public.password_history TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

GRANT EXECUTE ON FUNCTION public.validate_password TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_password_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_timezone TO authenticated;

-- Add audit triggers to important tables
CREATE TRIGGER audit_employees
AFTER INSERT OR UPDATE OR DELETE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER audit_time_off_requests
AFTER INSERT OR UPDATE OR DELETE ON public.time_off_requests
FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER audit_schedules
AFTER INSERT OR UPDATE OR DELETE ON public.schedules
FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

COMMIT; 