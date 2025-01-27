-- Validation Enhancements Migration
BEGIN;

-- Create validation history table
CREATE TABLE IF NOT EXISTS public.validation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES public.schedules(id),
    validation_type TEXT NOT NULL,
    is_valid BOOLEAN NOT NULL,
    error_code TEXT,
    error_message TEXT,
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_validation_history_schedule 
ON public.validation_history(schedule_id);

-- Create validation rules table
CREATE TABLE IF NOT EXISTS public.validation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_type TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    rule_config JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(rule_type, rule_name)
);

-- Function to validate shift pattern
CREATE OR REPLACE FUNCTION public.validate_shift_pattern(
    p_shifts JSONB,
    p_pattern JSONB,
    p_timezone TEXT DEFAULT 'UTC'
)
RETURNS TABLE (
    is_valid BOOLEAN,
    error_code TEXT,
    error_message TEXT,
    error_details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_shift RECORD;
    v_pattern_sequence TEXT[];
    v_current_index INTEGER;
    v_current_date DATE;
    v_shift_span TEXT;
BEGIN
    -- Validate timezone
    IF NOT public.is_valid_timezone(p_timezone) THEN
        RETURN QUERY SELECT 
            false,
            'INVALID_TIMEZONE',
            'Invalid timezone specified',
            jsonb_build_object('timezone', p_timezone);
        RETURN;
    END IF;

    -- Extract pattern sequence
    v_pattern_sequence := ARRAY(
        SELECT jsonb_array_elements_text(p_pattern->'sequence')
    );
    
    v_current_index := 0;
    
    -- Check each shift against pattern
    FOR v_shift IN SELECT * FROM jsonb_to_recordset(p_shifts) AS x(
        start_time TIME,
        end_time TIME,
        date DATE
    )
    LOOP
        -- Convert shift times to pattern format
        v_shift_span := v_shift.start_time::TEXT || '-' || v_shift.end_time::TEXT;
        
        -- Check if shift matches current pattern position
        IF NOT v_shift_span = ANY(string_to_array(v_pattern_sequence[v_current_index + 1], ',')) THEN
            RETURN QUERY SELECT 
                false,
                'PATTERN_MISMATCH',
                'Shift does not match pattern',
                jsonb_build_object(
                    'date', v_shift.date,
                    'shift_span', v_shift_span,
                    'expected_pattern', v_pattern_sequence[v_current_index + 1]
                );
            RETURN;
        END IF;
        
        -- Move to next pattern position
        v_current_index := (v_current_index + 1) % array_length(v_pattern_sequence, 1);
    END LOOP;
    
    -- If we get here, pattern is valid
    RETURN QUERY SELECT 
        true,
        NULL::TEXT,
        NULL::TEXT,
        NULL::JSONB;
END;
$$;

-- Function to validate staffing requirements
CREATE OR REPLACE FUNCTION public.validate_staffing_requirements(
    p_schedule_id UUID,
    p_date DATE,
    p_timezone TEXT DEFAULT 'UTC'
)
RETURNS TABLE (
    is_valid BOOLEAN,
    error_code TEXT,
    error_message TEXT,
    error_details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_requirement RECORD;
    v_staff_count INTEGER;
    v_supervisor_present BOOLEAN;
BEGIN
    -- For each staffing requirement
    FOR v_requirement IN 
        SELECT * FROM public.staffing_requirements 
        WHERE is_active = true
    LOOP
        -- Count staff during requirement period
        SELECT 
            COUNT(*) as staff_count,
            bool_or(e.employee_role = 'SUPERVISOR') as has_supervisor
        INTO v_staff_count, v_supervisor_present
        FROM public.schedules s
        JOIN public.shifts sh ON s.shift_id = sh.id
        JOIN public.employees e ON s.employee_id = e.id
        WHERE s.schedule_id = p_schedule_id
        AND s.date = p_date
        AND public.shifts_overlap(
            sh.start_time,
            sh.end_time,
            v_requirement.start_time,
            v_requirement.end_time
        );
        
        -- Check minimum staff requirement
        IF v_staff_count < v_requirement.minimum_staff THEN
            RETURN QUERY SELECT 
                false,
                'INSUFFICIENT_STAFF',
                'Insufficient staff during required period',
                jsonb_build_object(
                    'date', p_date,
                    'period', jsonb_build_object(
                        'start', v_requirement.start_time,
                        'end', v_requirement.end_time
                    ),
                    'actual_count', v_staff_count,
                    'required_count', v_requirement.minimum_staff
                );
            RETURN;
        END IF;
        
        -- Check supervisor requirement
        IF v_requirement.supervisor_required AND NOT v_supervisor_present THEN
            RETURN QUERY SELECT 
                false,
                'SUPERVISOR_REQUIRED',
                'No supervisor present during required period',
                jsonb_build_object(
                    'date', p_date,
                    'period', jsonb_build_object(
                        'start', v_requirement.start_time,
                        'end', v_requirement.end_time
                    )
                );
            RETURN;
        END IF;
    END LOOP;
    
    -- If we get here, all requirements are met
    RETURN QUERY SELECT 
        true,
        NULL::TEXT,
        NULL::TEXT,
        NULL::JSONB;
END;
$$;

-- Function to check if shifts overlap
CREATE OR REPLACE FUNCTION public.shifts_overlap(
    p_start1 TIME,
    p_end1 TIME,
    p_start2 TIME,
    p_end2 TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN (p_start1 < p_end2 AND p_end1 > p_start2);
END;
$$;

-- Add RLS policies
ALTER TABLE public.validation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view validation history"
ON public.validation_history
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers can insert validation history"
ON public.validation_history
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role IN ('MANAGER', 'ADMIN')
    )
);

CREATE POLICY "Managers can view validation rules"
ON public.validation_rules
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role IN ('MANAGER', 'ADMIN')
    )
);

CREATE POLICY "Admins can manage validation rules"
ON public.validation_rules
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

-- Grant necessary permissions
GRANT SELECT ON public.validation_history TO authenticated;
GRANT INSERT ON public.validation_history TO authenticated;
GRANT SELECT ON public.validation_rules TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_shift_pattern(JSONB, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_staffing_requirements(UUID, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shifts_overlap(TIME, TIME, TIME, TIME) TO authenticated;

COMMIT; 