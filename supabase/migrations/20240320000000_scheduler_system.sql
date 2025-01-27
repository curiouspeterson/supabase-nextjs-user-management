-- Consolidated Scheduler System Migration

-- Create scheduler metrics table
CREATE TABLE IF NOT EXISTS public.scheduler_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coverage_deficit INTEGER NOT NULL DEFAULT 0,
    overtime_violations INTEGER NOT NULL DEFAULT 0,
    pattern_errors INTEGER NOT NULL DEFAULT 0,
    schedule_generation_time INTEGER NOT NULL DEFAULT 0,
    last_run_status TEXT NOT NULL CHECK (last_run_status IN ('success', 'warning', 'error')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for quick access to recent metrics
CREATE INDEX IF NOT EXISTS idx_scheduler_metrics_created_at 
ON public.scheduler_metrics (created_at DESC);

-- Create error logging table
CREATE TABLE scheduler_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_details TEXT
);

-- Create index on error_type for faster lookups
CREATE INDEX idx_scheduler_errors_type ON scheduler_errors(error_type);

-- Create enums if they don't exist
DO $$ 
BEGIN
    CREATE TYPE shift_duration_category AS ENUM (
        'SHORT',
        'REGULAR',
        'EXTENDED',
        'LONG'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    CREATE TYPE schedule_status AS ENUM (
        'DRAFT',
        'PENDING',
        'APPROVED',
        'PUBLISHED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    CREATE TYPE employee_role AS ENUM (
        'STAFF',
        'SUPERVISOR',
        'MANAGER',
        'ADMIN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add scheduler configuration
CREATE TABLE IF NOT EXISTS scheduler_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key TEXT NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    environment TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_active_config UNIQUE (config_key, environment, is_active)
);

-- Insert default scheduler configurations
INSERT INTO scheduler_config (config_key, config_value, description, environment)
VALUES
(
    'scheduler_constraints',
    '{
        "max_weekly_hours": 48,
        "max_consecutive_days": 5,
        "min_hours_between_shifts": 11,
        "max_daily_hours": 12,
        "max_overtime_hours": 10,
        "preferred_shift_length": 8,
        "max_shifts_per_day": 3,
        "optimization_timeout_ms": 30000,
        "max_retry_attempts": 3,
        "retry_delay_ms": 1000
    }'::jsonb,
    'Default scheduler constraints for development',
    'development'
),
(
    'scheduler_constraints',
    '{
        "max_weekly_hours": 40,
        "max_consecutive_days": 6,
        "min_hours_between_shifts": 12,
        "max_daily_hours": 10,
        "max_overtime_hours": 8,
        "preferred_shift_length": 8,
        "max_shifts_per_day": 2,
        "optimization_timeout_ms": 60000,
        "max_retry_attempts": 5,
        "retry_delay_ms": 2000
    }'::jsonb,
    'Default scheduler constraints for production',
    'production'
);

-- Update schedules table with new status enum
BEGIN;
    -- Add temporary column with new type
    ALTER TABLE schedules ADD COLUMN status_new schedule_status;

    -- Update with converted values
    UPDATE schedules 
    SET status_new = CASE status::text
        WHEN 'Draft' THEN 'DRAFT'::schedule_status
        WHEN 'Pending' THEN 'PENDING'::schedule_status
        WHEN 'Approved' THEN 'APPROVED'::schedule_status
        WHEN 'Published' THEN 'PUBLISHED'::schedule_status
        WHEN 'Cancelled' THEN 'CANCELLED'::schedule_status
        ELSE 'DRAFT'::schedule_status
    END;

    -- Drop old column and rename new one
    ALTER TABLE schedules DROP COLUMN status;
    ALTER TABLE schedules RENAME COLUMN status_new TO status;
    ALTER TABLE schedules ALTER COLUMN status SET NOT NULL;
COMMIT;

-- Update shifts table with new duration category
BEGIN;
    -- Drop existing constraint if exists
    DO $$ 
    BEGIN
        ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_duration_check;
    EXCEPTION
        WHEN undefined_object THEN null;
    END $$;

    -- Add temporary column with new type
    ALTER TABLE shifts ADD COLUMN duration_category_new shift_duration_category;

    -- Update with converted values
    UPDATE shifts 
    SET duration_category_new = CASE duration_category::text
        WHEN '4 hours' THEN 'SHORT'::shift_duration_category
        WHEN '8 hours' THEN 'REGULAR'::shift_duration_category
        WHEN '10 hours' THEN 'EXTENDED'::shift_duration_category
        WHEN '12 hours' THEN 'LONG'::shift_duration_category
        ELSE 'REGULAR'::shift_duration_category
    END;

    -- Drop old column and rename new one
    ALTER TABLE shifts DROP COLUMN duration_category;
    ALTER TABLE shifts RENAME COLUMN duration_category_new TO duration_category;
    ALTER TABLE shifts ALTER COLUMN duration_category SET NOT NULL;

    -- Add duration check
    ALTER TABLE shifts ADD CONSTRAINT shifts_duration_check 
        CHECK (duration_hours > 0 AND duration_hours <= 24);
COMMIT;

-- Update employees table with new role enum
BEGIN;
    -- Add temporary column with new type
    ALTER TABLE employees ADD COLUMN employee_role_new employee_role;

    -- Update with converted values
    UPDATE employees 
    SET employee_role_new = CASE employee_role::text
        WHEN 'Employee' THEN 'STAFF'::employee_role
        WHEN 'Shift Supervisor' THEN 'SUPERVISOR'::employee_role
        WHEN 'Management' THEN 'MANAGER'::employee_role
        ELSE 'STAFF'::employee_role
    END;

    -- Drop old column and rename new one
    ALTER TABLE employees DROP COLUMN employee_role;
    ALTER TABLE employees RENAME COLUMN employee_role_new TO employee_role;
    ALTER TABLE employees ALTER COLUMN employee_role SET NOT NULL;
COMMIT;

-- Create RLS policies for shift patterns
CREATE POLICY "Managers can create patterns"
ON public.shift_patterns
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = auth.uid() 
    AND employees.employee_role IN ('MANAGER'::employee_role, 'ADMIN'::employee_role)
));

CREATE POLICY "Managers can update patterns"
ON public.shift_patterns
FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = auth.uid() 
    AND employees.employee_role IN ('MANAGER'::employee_role, 'ADMIN'::employee_role)
));

CREATE POLICY "Managers can delete patterns"
ON public.shift_patterns
FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = auth.uid() 
    AND employees.employee_role IN ('MANAGER'::employee_role, 'ADMIN'::employee_role)
));

-- Create function to validate shift times
CREATE OR REPLACE FUNCTION validate_shift_times()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if shift crosses midnight
    IF NEW.end_time < NEW.start_time THEN
        -- For shifts crossing midnight, add 24 hours to end_time for duration calculation
        NEW.duration_hours := (
            EXTRACT(EPOCH FROM (NEW.end_time + INTERVAL '24 hours' - NEW.start_time)) / 3600
        )::numeric;
    ELSE
        -- For normal shifts, calculate duration directly
        NEW.duration_hours := (
            EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600
        )::numeric;
    END IF;

    -- Set duration category based on hours
    NEW.duration_category := CASE
        WHEN NEW.duration_hours <= 4 THEN 'SHORT'::shift_duration_category
        WHEN NEW.duration_hours <= 8 THEN 'REGULAR'::shift_duration_category
        WHEN NEW.duration_hours <= 10 THEN 'EXTENDED'::shift_duration_category
        ELSE 'LONG'::shift_duration_category
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for shift validation
CREATE TRIGGER validate_shift_times_trigger
    BEFORE INSERT OR UPDATE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION validate_shift_times();

-- Function to get pattern violations
CREATE OR REPLACE FUNCTION get_pattern_violations(start_date DATE)
RETURNS TABLE (
    employee_id UUID,
    violation_type TEXT,
    violation_date DATE,
    details TEXT
) AS $$
BEGIN
    -- Check for consecutive days violations
    RETURN QUERY
    WITH consecutive_days AS (
        SELECT 
            s.employee_id,
            s.date,
            COUNT(*) OVER (
                PARTITION BY s.employee_id, 
                DATE_TRUNC('week', s.date::timestamp)
            ) as days_worked
        FROM public.schedules s
        WHERE s.date >= start_date
        GROUP BY s.employee_id, s.date
    )
    SELECT 
        cd.employee_id,
        'consecutive_days'::TEXT as violation_type,
        cd.date as violation_date,
        'Exceeded maximum consecutive days'::TEXT as details
    FROM consecutive_days cd
    WHERE cd.days_worked > 6

    UNION ALL

    -- Check for forbidden shift patterns
    SELECT 
        s1.employee_id,
        'shift_pattern'::TEXT as violation_type,
        s1.date as violation_date,
        'Invalid shift pattern detected'::TEXT as details
    FROM public.schedules s1
    JOIN public.schedules s2 ON 
        s1.employee_id = s2.employee_id AND
        s2.date = s1.date + INTERVAL '1 day'
    JOIN public.shifts sh1 ON s1.shift_id = sh1.id
    JOIN public.shifts sh2 ON s2.shift_id = sh2.id
    WHERE 
        s1.date >= start_date AND
        (
            -- Night shift followed by morning shift
            (sh1.end_time > sh1.start_time AND sh2.start_time < '12:00:00'::TIME) OR
            -- Less than 8 hours between shifts
            (sh2.start_time - sh1.end_time < INTERVAL '8 hours')
        );

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Add timezone column to schedules
ALTER TABLE schedules 
ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC';

-- Create function to log scheduler errors
CREATE OR REPLACE FUNCTION log_scheduler_error(
    p_error_type TEXT,
    p_error_message TEXT,
    p_error_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_error_id UUID;
BEGIN
    INSERT INTO scheduler_errors (error_type, error_message, error_details)
    VALUES (p_error_type, p_error_message, p_error_details)
    RETURNING id INTO v_error_id;
    
    RETURN v_error_id;
END;
$$;

-- Add validation function for timezone
CREATE OR REPLACE FUNCTION is_valid_timezone(p_timezone TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM pg_timezone_names
        WHERE name = p_timezone
    );
END;
$$;

-- Add constraint to ensure valid timezone
ALTER TABLE schedules
ADD CONSTRAINT valid_timezone CHECK (is_valid_timezone(timezone));

-- Add function to handle midnight shifts with timezone
CREATE OR REPLACE FUNCTION split_midnight_shift(
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_timezone TEXT
)
RETURNS TABLE (
    segment_date DATE,
    hours NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_current_date DATE;
    v_segment_start TIMESTAMPTZ;
    v_segment_end TIMESTAMPTZ;
BEGIN
    -- Convert times to specified timezone
    v_start_date := (p_start_time AT TIME ZONE p_timezone)::DATE;
    v_end_date := (p_end_time AT TIME ZONE p_timezone)::DATE;
    
    -- Handle single day case
    IF v_start_date = v_end_date THEN
        RETURN QUERY
        SELECT 
            v_start_date,
            EXTRACT(EPOCH FROM (p_end_time - p_start_time))/3600;
        RETURN;
    END IF;
    
    -- First day
    v_segment_end := (v_start_date + 1) AT TIME ZONE p_timezone;
    RETURN QUERY
    SELECT 
        v_start_date,
        EXTRACT(EPOCH FROM (v_segment_end - p_start_time))/3600;
    
    -- Middle days
    v_current_date := v_start_date + 1;
    WHILE v_current_date < v_end_date LOOP
        v_segment_start := v_current_date AT TIME ZONE p_timezone;
        v_segment_end := (v_current_date + 1) AT TIME ZONE p_timezone;
        RETURN QUERY
        SELECT 
            v_current_date,
            EXTRACT(EPOCH FROM (v_segment_end - v_segment_start))/3600;
        v_current_date := v_current_date + 1;
    END LOOP;
    
    -- Last day
    IF v_start_date != v_end_date THEN
        v_segment_start := v_end_date AT TIME ZONE p_timezone;
        RETURN QUERY
        SELECT 
            v_end_date,
            EXTRACT(EPOCH FROM (p_end_time - v_segment_start))/3600;
    END IF;
END;
$$;

-- Function to validate shift assignment
CREATE OR REPLACE FUNCTION public.validate_shift_assignment(
    p_employee_id uuid,
    p_shift_id uuid,
    p_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_shift record;
    v_employee record;
    v_validation jsonb;
    v_weekly_hours numeric;
    v_last_shift record;
    v_staffing_requirement record;
BEGIN
    -- Initialize validation result
    v_validation := jsonb_build_object(
        'valid', true,
        'errors', jsonb_build_array(),
        'warnings', jsonb_build_array()
    );
    
    -- Get shift details
    SELECT * INTO v_shift
    FROM public.shifts
    WHERE id = p_shift_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'errors', jsonb_build_array('Shift not found'),
            'warnings', jsonb_build_array()
        );
    END IF;
    
    -- Get employee details
    SELECT * INTO v_employee
    FROM public.employees
    WHERE id = p_employee_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'errors', jsonb_build_array('Employee not found'),
            'warnings', jsonb_build_array()
        );
    END IF;
    
    -- Calculate weekly hours including this shift
    SELECT COALESCE(SUM(s.duration_hours), 0) INTO v_weekly_hours
    FROM public.schedules sch
    JOIN public.shifts s ON s.id = sch.shift_id
    WHERE sch.employee_id = p_employee_id
    AND sch.date BETWEEN date_trunc('week', p_date) AND date_trunc('week', p_date) + interval '6 days';
    
    v_weekly_hours := v_weekly_hours + v_shift.duration_hours;
    
    -- Check weekly hours limit
    IF v_weekly_hours > v_employee.weekly_hours_scheduled AND NOT v_employee.allow_overtime THEN
        v_validation := jsonb_set(
            v_validation,
            '{valid}',
            'false'::jsonb
        );
        v_validation := jsonb_set(
            v_validation,
            '{errors}',
            (v_validation->>'errors')::jsonb || jsonb_build_array('Would exceed weekly hours limit')
        );
    END IF;
    
    -- Get last shift for rest period check
    SELECT s.* INTO v_last_shift
    FROM public.schedules sch
    JOIN public.shifts s ON s.id = sch.shift_id
    WHERE sch.employee_id = p_employee_id
    AND sch.date < p_date
    ORDER BY sch.date DESC, s.end_time DESC
    LIMIT 1;
    
    IF FOUND THEN
        -- Calculate rest period
        DECLARE
            v_last_end timestamp;
            v_next_start timestamp;
            v_rest_hours numeric;
        BEGIN
            v_last_end := (v_last_shift.date + v_last_shift.end_time)::timestamp;
            v_next_start := (p_date + v_shift.start_time)::timestamp;
            v_rest_hours := EXTRACT(epoch FROM (v_next_start - v_last_end))/3600;
            
            IF v_rest_hours < 8 THEN
                v_validation := jsonb_set(
                    v_validation,
                    '{valid}',
                    'false'::jsonb
                );
                v_validation := jsonb_set(
                    v_validation,
                    '{errors}',
                    (v_validation->>'errors')::jsonb || jsonb_build_array('Insufficient rest period')
                );
            ELSIF v_rest_hours < 10 THEN
                v_validation := jsonb_set(
                    v_validation,
                    '{warnings}',
                    (v_validation->>'warnings')::jsonb || jsonb_build_array('Less than recommended rest period')
                );
            END IF;
        END;
    END IF;
    
    -- Check staffing requirements
    SELECT * INTO v_staffing_requirement
    FROM public.staffing_requirements
    WHERE start_time <= v_shift.start_time
    AND end_time >= v_shift.end_time
    AND shift_supervisor_required = (v_employee.employee_role = 'SUPERVISOR'::employee_role);
    
    IF FOUND THEN
        -- Check current coverage
        DECLARE
            v_current_coverage integer;
        BEGIN
            SELECT COUNT(*) INTO v_current_coverage
            FROM public.schedules sch
            JOIN public.shifts s ON s.id = sch.shift_id
            JOIN public.employees e ON e.id = sch.employee_id
            WHERE sch.date = p_date
            AND s.start_time >= v_staffing_requirement.start_time
            AND s.end_time <= v_staffing_requirement.end_time
            AND (
                (v_employee.employee_role = 'SUPERVISOR'::employee_role AND e.employee_role = 'SUPERVISOR'::employee_role)
                OR
                (v_employee.employee_role != 'SUPERVISOR'::employee_role AND e.employee_role != 'SUPERVISOR'::employee_role)
            );
            
            IF v_current_coverage >= v_staffing_requirement.minimum_employees THEN
                v_validation := jsonb_set(
                    v_validation,
                    '{warnings}',
                    (v_validation->>'warnings')::jsonb || jsonb_build_array('Exceeds required staffing level')
                );
            END IF;
        END;
    END IF;
    
    RETURN v_validation;
END;
$$;

-- Function to get available shifts for an employee
CREATE OR REPLACE FUNCTION public.get_available_shifts(
    p_employee_id uuid,
    p_date date
)
RETURNS TABLE (
    shift_id uuid,
    shift_type_id uuid,
    start_time time,
    end_time time,
    duration_hours integer,
    validation jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as shift_id,
        s.shift_type_id,
        s.start_time,
        s.end_time,
        s.duration_hours,
        public.validate_shift_assignment(p_employee_id, s.id, p_date) as validation
    FROM public.shifts s
    WHERE EXISTS (
        SELECT 1
        FROM public.staffing_requirements sr
        WHERE sr.start_time <= s.start_time
        AND sr.end_time >= s.end_time
    )
    ORDER BY s.start_time;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_shift_assignment(uuid, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_shift_assignment(uuid, uuid, date) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_available_shifts(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_shifts(uuid, date) TO service_role; 