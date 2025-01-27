-- Time Off Security Migration
BEGIN;

-- Create enum for time off request access levels
CREATE TYPE public.time_off_access_level AS ENUM (
    'SELF',
    'TEAM',
    'ALL'
);

-- Create table for time off access audit
CREATE TABLE IF NOT EXISTS public.time_off_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    accessed_user_id UUID REFERENCES auth.users(id),
    access_type time_off_access_level NOT NULL,
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_info JSONB,
    request_path TEXT,
    request_method TEXT
);

-- Create indexes for performance
CREATE INDEX idx_time_off_access_user ON public.time_off_access_logs(user_id);
CREATE INDEX idx_time_off_access_accessed ON public.time_off_access_logs(accessed_user_id);
CREATE INDEX idx_time_off_access_time ON public.time_off_access_logs(accessed_at);

-- Function to determine user's access level
CREATE OR REPLACE FUNCTION public.get_time_off_access_level(p_user_id UUID)
RETURNS time_off_access_level
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role TEXT;
    v_access_level time_off_access_level;
BEGIN
    -- Get user's role from metadata
    SELECT raw_user_meta_data->>'role'
    INTO v_user_role
    FROM auth.users
    WHERE id = p_user_id;

    -- Determine access level based on role
    CASE v_user_role
        WHEN 'ADMIN' THEN
            v_access_level := 'ALL';
        WHEN 'MANAGER' THEN
            v_access_level := 'TEAM';
        ELSE
            v_access_level := 'SELF';
    END CASE;

    RETURN v_access_level;
END;
$$;

-- Function to check if user can access another user's data
CREATE OR REPLACE FUNCTION public.can_access_user_data(p_accessor_id UUID, p_target_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_access_level time_off_access_level;
    v_team_id UUID;
    v_target_team_id UUID;
BEGIN
    -- Get accessor's access level
    v_access_level := public.get_time_off_access_level(p_accessor_id);

    -- Full access for admins
    IF v_access_level = 'ALL' THEN
        RETURN TRUE;
    END IF;

    -- Self access always allowed
    IF p_accessor_id = p_target_id THEN
        RETURN TRUE;
    END IF;

    -- Team access for managers
    IF v_access_level = 'TEAM' THEN
        -- Get team IDs
        SELECT team_id INTO v_team_id
        FROM public.employees
        WHERE user_id = p_accessor_id;

        SELECT team_id INTO v_target_team_id
        FROM public.employees
        WHERE user_id = p_target_id;

        RETURN v_team_id = v_target_team_id;
    END IF;

    -- Default to no access
    RETURN FALSE;
END;
$$;

-- Function to log access attempt
CREATE OR REPLACE FUNCTION public.log_time_off_access(
    p_user_id UUID,
    p_accessed_user_id UUID,
    p_access_type time_off_access_level,
    p_client_info JSONB DEFAULT NULL,
    p_request_path TEXT DEFAULT NULL,
    p_request_method TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.time_off_access_logs (
        user_id,
        accessed_user_id,
        access_type,
        client_info,
        request_path,
        request_method
    ) VALUES (
        p_user_id,
        p_accessed_user_id,
        p_access_type,
        p_client_info,
        p_request_path,
        p_request_method
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

-- Modified function to get time off requests with proper access control
CREATE OR REPLACE FUNCTION public.get_time_off_requests(
    p_user_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    employee_id UUID,
    employee_name TEXT,
    employee_email TEXT,
    start_date DATE,
    end_date DATE,
    request_type TEXT,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_access_level time_off_access_level;
    v_requesting_user_id UUID;
    v_team_id UUID;
BEGIN
    -- Get current user ID if not provided
    v_requesting_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Get user's access level
    v_access_level := public.get_time_off_access_level(v_requesting_user_id);
    
    -- Log access attempt
    PERFORM public.log_time_off_access(
        v_requesting_user_id,
        p_user_id,
        v_access_level
    );

    RETURN QUERY
    WITH filtered_requests AS (
        SELECT 
            r.id,
            r.employee_id,
            e.full_name as employee_name,
            CASE
                -- Show email only if user has appropriate access
                WHEN public.can_access_user_data(v_requesting_user_id, r.employee_id) THEN e.email
                ELSE NULL
            END as employee_email,
            r.start_date,
            r.end_date,
            r.request_type,
            r.status,
            r.notes,
            r.created_at,
            r.updated_at
        FROM public.time_off_requests r
        JOIN public.employees e ON r.employee_id = e.user_id
        WHERE 
            -- Date range filter if provided
            (p_start_date IS NULL OR r.start_date >= p_start_date) AND
            (p_end_date IS NULL OR r.end_date <= p_end_date) AND
            -- Access control based on level
            CASE 
                WHEN v_access_level = 'ALL' THEN TRUE
                WHEN v_access_level = 'TEAM' THEN EXISTS (
                    SELECT 1 FROM public.employees e2 
                    WHERE e2.user_id = r.employee_id 
                    AND e2.team_id = (
                        SELECT team_id FROM public.employees 
                        WHERE user_id = v_requesting_user_id
                    )
                )
                ELSE r.employee_id = v_requesting_user_id
            END
    )
    SELECT * FROM filtered_requests
    ORDER BY start_date DESC;
END;
$$;

-- Add RLS policies
ALTER TABLE public.time_off_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access logs"
ON public.time_off_access_logs
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
);

CREATE POLICY "Admins can view all access logs"
ON public.time_off_access_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'ADMIN'
    )
);

-- Grant permissions
GRANT SELECT ON public.time_off_access_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_time_off_access_level TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_user_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_time_off_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_time_off_requests TO authenticated;

COMMIT; 