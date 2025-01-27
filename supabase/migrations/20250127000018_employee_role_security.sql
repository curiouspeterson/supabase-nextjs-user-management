-- Employee Role Security Migration
BEGIN;

-- Create enum for employee roles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_role') THEN
        CREATE TYPE public.employee_role AS ENUM (
            'ADMIN',
            'MANAGER',
            'SUPERVISOR',
            'EMPLOYEE',
            'CONTRACTOR'
        );
    END IF;
END $$;

-- Create table for role mapping history
CREATE TABLE IF NOT EXISTS public.employee_role_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id),
    previous_role employee_role,
    new_role employee_role,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT,
    client_info JSONB
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_role_history_employee ON public.employee_role_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_role_history_changed_by ON public.employee_role_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_role_history_changed_at ON public.employee_role_history(changed_at);

-- Create table for employee access logs
CREATE TABLE IF NOT EXISTS public.employee_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accessor_id UUID REFERENCES auth.users(id),
    accessed_employee_id UUID REFERENCES public.employees(id),
    action_type TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    client_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_access_logs_accessor ON public.employee_access_logs(accessor_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed ON public.employee_access_logs(accessed_employee_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.employee_access_logs(created_at);

-- Function to validate role changes
CREATE OR REPLACE FUNCTION public.validate_role_change(
    p_employee_id UUID,
    p_new_role employee_role,
    p_changed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_role employee_role;
    v_changer_role employee_role;
BEGIN
    -- Get current role of the employee
    SELECT employee_role INTO v_current_role
    FROM public.employees
    WHERE id = p_employee_id;

    -- Get role of the person making the change
    SELECT employee_role INTO v_changer_role
    FROM public.employees
    WHERE id = p_changed_by;

    -- Only ADMIN can promote to ADMIN
    IF p_new_role = 'ADMIN' AND v_changer_role != 'ADMIN' THEN
        RETURN false;
    END IF;

    -- Only ADMIN and MANAGER can promote to MANAGER
    IF p_new_role = 'MANAGER' AND v_changer_role NOT IN ('ADMIN', 'MANAGER') THEN
        RETURN false;
    END IF;

    -- ADMIN and MANAGER can change any other roles
    IF v_changer_role IN ('ADMIN', 'MANAGER') THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update employee role with validation and logging
CREATE OR REPLACE FUNCTION public.update_employee_role(
    p_employee_id UUID,
    p_new_role employee_role,
    p_reason TEXT DEFAULT NULL,
    p_client_info JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_previous_role employee_role;
BEGIN
    -- Get current role
    SELECT employee_role INTO v_previous_role
    FROM public.employees
    WHERE id = p_employee_id;

    -- Validate the role change
    IF NOT public.validate_role_change(p_employee_id, p_new_role, auth.uid()) THEN
        RETURN false;
    END IF;

    -- Update the role
    UPDATE public.employees
    SET employee_role = p_new_role
    WHERE id = p_employee_id;

    -- Log the change
    INSERT INTO public.employee_role_history (
        employee_id,
        previous_role,
        new_role,
        changed_by,
        reason,
        client_info
    ) VALUES (
        p_employee_id,
        v_previous_role,
        p_new_role,
        auth.uid(),
        p_reason,
        p_client_info
    );

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log employee access
CREATE OR REPLACE FUNCTION public.log_employee_access(
    p_accessed_employee_id UUID,
    p_action_type TEXT,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL,
    p_client_info JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.employee_access_logs (
        accessor_id,
        accessed_employee_id,
        action_type,
        success,
        error_message,
        client_info
    ) VALUES (
        auth.uid(),
        p_accessed_employee_id,
        p_action_type,
        p_success,
        p_error_message,
        p_client_info
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get employees with proper access control
CREATE OR REPLACE FUNCTION public.get_employees(
    p_search_term TEXT DEFAULT NULL,
    p_role employee_role DEFAULT NULL,
    p_team_id UUID DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    role employee_role,
    team_id UUID,
    team_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_role TEXT;
BEGIN
    -- Get current user and role
    v_user_id := auth.uid();
    SELECT raw_user_meta_data->>'role'
    INTO v_user_role
    FROM auth.users
    WHERE id = v_user_id;

    -- Log access attempt
    PERFORM public.log_employee_access(
        NULL,
        'LIST',
        jsonb_build_object(
            'search_term', p_search_term,
            'role_filter', p_role,
            'team_filter', p_team_id
        )
    );

    RETURN QUERY
    SELECT 
        e.id,
        e.email,
        e.full_name,
        e.employee_role,
        e.team_id,
        t.name as team_name,
        e.created_at,
        e.updated_at
    FROM public.employees e
    LEFT JOIN public.teams t ON e.team_id = t.id
    WHERE 
        -- Access control based on role
        CASE 
            WHEN v_user_role = 'ADMIN' THEN TRUE
            WHEN v_user_role = 'MANAGER' THEN 
                e.team_id IN (
                    SELECT team_id 
                    FROM public.employees 
                    WHERE id = v_user_id
                )
            ELSE e.id = v_user_id
        END
        -- Apply filters
        AND (p_search_term IS NULL OR 
            e.full_name ILIKE '%' || p_search_term || '%' OR 
            e.email ILIKE '%' || p_search_term || '%')
        AND (p_role IS NULL OR e.employee_role = p_role)
        AND (p_team_id IS NULL OR e.team_id = p_team_id)
    ORDER BY e.full_name;
END;
$$;

-- Add RLS policies
ALTER TABLE public.employee_role_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Role History policies
DROP POLICY IF EXISTS "Users can view their own role history" ON public.employee_role_history;
CREATE POLICY "Users can view their own role history"
ON public.employee_role_history
FOR SELECT
TO authenticated
USING (
    employee_id = auth.uid() OR
    changed_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role IN ('ADMIN', 'MANAGER')
    )
);

-- Access Logs policies
DROP POLICY IF EXISTS "Users can view access logs they're involved in" ON public.employee_access_logs;
CREATE POLICY "Users can view access logs they're involved in"
ON public.employee_access_logs
FOR SELECT
TO authenticated
USING (
    accessor_id = auth.uid() OR
    accessed_employee_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

-- Grant permissions
GRANT SELECT ON public.employee_role_history TO authenticated;
GRANT SELECT ON public.employee_access_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_employee_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_employee_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_employees TO authenticated;

COMMIT; 