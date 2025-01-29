-- Extensions and Policies Migration
-- This migration adds cross-system functionality, additional policies, and schema extensions
BEGIN;

------ Security Functions ------
-- Create security check functions
CREATE OR REPLACE FUNCTION public.can_view_employee_overview(p_employee_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Allow if user is viewing their own overview
    IF auth.uid() = p_employee_id THEN
        RETURN TRUE;
    END IF;

    -- Allow if user is admin/manager in the employee's organization
    RETURN EXISTS (
        SELECT 1
        FROM public.employees e
        JOIN public.organization_users ou ON ou.organization_id = e.organization_id
        WHERE e.id = p_employee_id
        AND ou.user_id = auth.uid()
        AND ou.role IN ('admin', 'manager')
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_organization_metrics(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Allow if user is a member of the organization
    RETURN EXISTS (
        SELECT 1
        FROM public.organization_users ou
        WHERE ou.organization_id = p_organization_id
        AND ou.user_id = auth.uid()
    );
END;
$$;

------ Cross-System Functions ------
-- Get employee schedule summary
CREATE OR REPLACE FUNCTION public.get_employee_schedule_summary(
    p_employee_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    total_shifts INTEGER,
    total_hours NUMERIC,
    avg_shift_length NUMERIC,
    schedule_status_counts JSONB,
    time_off_requests INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT s.id)::INTEGER as total_shifts,
        ROUND(SUM(EXTRACT(EPOCH FROM (s.period_end - s.period_start))/3600), 2) as total_hours,
        ROUND(AVG(EXTRACT(EPOCH FROM (s.period_end - s.period_start))/3600), 2) as avg_shift_length,
        COALESCE(
            (
                SELECT jsonb_object_agg(status, COUNT(*))
                FROM public.schedules s2
                WHERE s2.employee_id = e.id
                AND s2.date BETWEEN p_start_date AND p_end_date
                AND s2.status IS NOT NULL
                GROUP BY s2.employee_id
            ),
            '{}'::jsonb
        ) as schedule_status_counts,
        COUNT(DISTINCT tor.id)::INTEGER as time_off_requests
    FROM public.employees e
    LEFT JOIN public.schedules s ON s.employee_id = e.id
        AND s.date BETWEEN p_start_date AND p_end_date
    LEFT JOIN public.time_off_requests tor ON tor.employee_id = e.id
        AND tor.start_date <= p_end_date
        AND tor.end_date >= p_start_date
    WHERE e.id = p_employee_id;
END;
$$;

-- Validate employee availability
CREATE OR REPLACE FUNCTION public.validate_employee_availability(
    p_employee_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ
)
RETURNS TABLE (
    is_available BOOLEAN,
    conflict_type TEXT,
    details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check for existing schedules
    IF EXISTS (
        SELECT 1
        FROM public.schedules s
        WHERE 
            s.employee_id = p_employee_id
            AND s.period_start < p_end_time
            AND s.period_end > p_start_time
    ) THEN
        RETURN QUERY
        SELECT 
            FALSE,
            'SCHEDULE_CONFLICT'::TEXT,
            jsonb_build_object(
                'message', 'Employee already has a schedule during this time'
            );
        RETURN;
    END IF;

    -- Check for time off requests
    IF EXISTS (
        SELECT 1
        FROM public.time_off_requests t
        WHERE 
            t.employee_id = p_employee_id
            AND t.status = 'approved'
            AND DATE(t.start_date) <= DATE(p_start_time)
            AND DATE(t.end_date) >= DATE(p_end_time)
    ) THEN
        RETURN QUERY
        SELECT 
            FALSE,
            'TIME_OFF_CONFLICT'::TEXT,
            jsonb_build_object(
                'message', 'Employee has approved time off during this period'
            );
        RETURN;
    END IF;

    -- Check weekly hours constraints
    DECLARE
        v_weekly_hours NUMERIC;
        v_max_weekly_hours NUMERIC;
    BEGIN
        SELECT COALESCE(SUM(
            EXTRACT(EPOCH FROM (s.period_end - s.period_start))/3600
        ), 0)
        INTO v_weekly_hours
        FROM public.schedules s
        WHERE 
            s.employee_id = p_employee_id
            AND DATE_TRUNC('week', s.date) = DATE_TRUNC('week', DATE(p_start_time));

        SELECT COALESCE(weekly_hours_scheduled, 40)
        INTO v_max_weekly_hours
        FROM public.employees
        WHERE id = p_employee_id;

        IF (v_weekly_hours + EXTRACT(EPOCH FROM (p_end_time - p_start_time))/3600) > v_max_weekly_hours THEN
            RETURN QUERY
            SELECT 
                FALSE,
                'WEEKLY_HOURS_EXCEEDED'::TEXT,
                jsonb_build_object(
                    'current_hours', v_weekly_hours,
                    'max_hours', v_max_weekly_hours,
                    'additional_hours', EXTRACT(EPOCH FROM (p_end_time - p_start_time))/3600
                );
            RETURN;
        END IF;
    END;

    -- If all checks pass
    RETURN QUERY
    SELECT 
        TRUE,
        NULL::TEXT,
        NULL::JSONB;
END;
$$;

------ Cross-System Views ------
-- Employee schedule overview
CREATE OR REPLACE VIEW public.employee_schedule_overview AS
SELECT * 
FROM (
    WITH schedule_stats AS (
        SELECT 
            s.employee_id,
            s.status,
            COUNT(*) as status_count
        FROM public.schedules s
        WHERE s.status IS NOT NULL
        GROUP BY s.employee_id, s.status
    )
    SELECT 
        e.id as employee_id,
        p.full_name,
        p.role as user_role,
        e.employee_role,
        e.organization_id,
        COUNT(DISTINCT s.id) as total_shifts,
        COUNT(DISTINCT DATE_TRUNC('week', s.date)) as weeks_scheduled,
        ROUND(AVG(EXTRACT(EPOCH FROM (s.period_end - s.period_start))/3600), 2) as avg_shift_hours,
        COUNT(DISTINCT tor.id) as time_off_requests,
        COALESCE(
            (
                SELECT jsonb_object_agg(status, status_count)
                FROM schedule_stats ss
                WHERE ss.employee_id = e.id
            ),
            '{}'::jsonb
        ) as schedule_status_counts
    FROM public.employees e
    JOIN public.profiles p ON p.id = e.id
    LEFT JOIN public.schedules s ON s.employee_id = e.id
    LEFT JOIN public.time_off_requests tor ON tor.employee_id = e.id
    GROUP BY e.id, p.full_name, p.role, e.employee_role, e.organization_id
) sub
WHERE public.can_view_employee_overview(employee_id);

-- Schedule metrics view
CREATE OR REPLACE VIEW public.schedule_metrics AS
SELECT *
FROM (
    WITH schedule_dates AS (
        SELECT 
            s.organization_id,
            DATE_TRUNC('day', s.date) as schedule_date,
            s.id as schedule_id,
            s.employee_id,
            s.period_start,
            s.period_end,
            s.status
        FROM public.schedules s
    ),
    status_stats AS (
        SELECT 
            organization_id,
            schedule_date,
            status,
            COUNT(*) as status_count
        FROM schedule_dates
        WHERE status IS NOT NULL
        GROUP BY organization_id, schedule_date, status
    )
    SELECT
        sd.schedule_date,
        sd.organization_id,
        o.name as organization_name,
        COUNT(DISTINCT sd.schedule_id) as total_schedules,
        COUNT(DISTINCT sd.employee_id) as total_employees,
        SUM(EXTRACT(EPOCH FROM (sd.period_end - sd.period_start))/3600) as total_hours,
        ROUND(AVG(EXTRACT(EPOCH FROM (sd.period_end - sd.period_start))/3600), 2) as avg_shift_length,
        COALESCE(
            (
                SELECT jsonb_object_agg(status, status_count)
                FROM status_stats ss
                WHERE 
                    ss.schedule_date = sd.schedule_date
                    AND ss.organization_id = sd.organization_id
            ),
            '{}'::jsonb
        ) as status_counts,
        COUNT(DISTINCT tor.id) as time_off_requests,
        COUNT(DISTINCT so.id) as schedule_operations
    FROM schedule_dates sd
    JOIN public.organizations o ON o.id = sd.organization_id
    LEFT JOIN public.time_off_requests tor ON tor.organization_id = sd.organization_id
        AND DATE(tor.start_date) <= sd.schedule_date 
        AND DATE(tor.end_date) >= sd.schedule_date
    LEFT JOIN public.schedule_operations so ON so.schedule_id = sd.schedule_id
    GROUP BY sd.organization_id, o.name, sd.schedule_date
) sub
WHERE public.can_view_organization_metrics(organization_id);

------ Security Settings ------
-- Enable security barrier and invoker rights on views
ALTER VIEW public.employee_schedule_overview SET (security_barrier = true, security_invoker = true);
ALTER VIEW public.schedule_metrics SET (security_barrier = true, security_invoker = true);

------ Additional Constraints and Triggers ------
-- Create trigger function for time off validation
CREATE OR REPLACE FUNCTION public.validate_schedule_time_off()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.time_off_requests t
        WHERE 
            t.employee_id = NEW.employee_id
            AND t.status = 'approved'
            AND NEW.date BETWEEN t.start_date AND t.end_date
    ) THEN
        RAISE EXCEPTION 'Cannot schedule during approved time off period'
            USING HINT = 'Check time off requests for conflicts';
    END IF;

    RETURN NEW;
END;
$$;

-- Add trigger for time off validation
CREATE TRIGGER validate_schedule_time_off
    BEFORE INSERT OR UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_schedule_time_off();

-- Ensure schedule operations maintain status flow
ALTER TABLE public.schedule_operations
ADD CONSTRAINT valid_operation_status_flow
CHECK (
    (status = 'pending' AND previous_state IS NOT NULL) OR
    (status IN ('completed', 'failed', 'rolled_back') AND new_state IS NOT NULL)
);

------ Grants ------
-- Grant access to security check functions
GRANT EXECUTE ON FUNCTION public.can_view_employee_overview TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_organization_metrics TO authenticated;

-- Grant access to cross-system functions
GRANT EXECUTE ON FUNCTION public.get_employee_schedule_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_employee_availability TO authenticated;

-- Grant access to views
GRANT SELECT ON public.employee_schedule_overview TO authenticated;
GRANT SELECT ON public.schedule_metrics TO authenticated;

-- Grant access to referenced tables for view functionality
GRANT SELECT ON public.schedules TO authenticated;
GRANT SELECT ON public.time_off_requests TO authenticated;
GRANT SELECT ON public.schedule_operations TO authenticated;
GRANT SELECT ON public.shift_types TO authenticated;

COMMIT; 