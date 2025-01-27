-- Consolidated Scheduler Enhancements Migration

-- Add role column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

COMMENT ON COLUMN profiles.role IS 'User role for authorization (e.g., user, admin)';

-- Add new columns for scheduling enhancements
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS allow_overtime BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS max_weekly_hours INTEGER NOT NULL DEFAULT 40;

-- Add new table for shift preferences
CREATE TABLE IF NOT EXISTS public.employee_shift_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    shift_type_id UUID NOT NULL REFERENCES public.shift_types(id) ON DELETE CASCADE,
    preference_level INTEGER NOT NULL DEFAULT 0, -- negative for dislike, positive for preference
    effective_date DATE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT preference_level_range CHECK (preference_level BETWEEN -3 AND 3),
    CONSTRAINT date_range_valid CHECK (expiry_date IS NULL OR expiry_date > effective_date)
);

-- Add indexes for quick preference lookups
CREATE INDEX IF NOT EXISTS idx_shift_preferences_employee ON public.employee_shift_preferences(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_preferences_dates ON public.employee_shift_preferences(effective_date, expiry_date);

-- Add trigger for updated_at
CREATE TRIGGER update_employee_shift_preferences_updated_at
    BEFORE UPDATE ON public.employee_shift_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Add new columns for better coverage tracking
ALTER TABLE public.daily_coverage
ADD COLUMN IF NOT EXISTS supervisor_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS overtime_hours INTEGER NOT NULL DEFAULT 0;

-- Add function to validate schedule patterns
CREATE OR REPLACE FUNCTION validate_shift_pattern()
RETURNS trigger AS $$
DECLARE
    v_pattern_type shift_pattern_type_enum;
    v_consecutive_days INTEGER;
    v_last_shift_duration INTEGER;
BEGIN
    -- Get employee's pattern type
    SELECT ep.pattern_type INTO v_pattern_type
    FROM public.employee_patterns ep
    WHERE ep.employee_id = NEW.employee_id
    AND NEW.date BETWEEN ep.start_date AND COALESCE(ep.end_date, NEW.date)
    ORDER BY ep.start_date DESC
    LIMIT 1;

    -- Count consecutive days
    WITH consecutive_shifts AS (
        SELECT s.date, s.shift_id,
               sh.duration_hours,
               COUNT(*) OVER (ORDER BY s.date) as consecutive_count
        FROM public.schedules s
        JOIN public.shifts sh ON s.shift_id = sh.id
        WHERE s.employee_id = NEW.employee_id
        AND s.date BETWEEN NEW.date - INTERVAL '7 days' AND NEW.date
        ORDER BY s.date DESC
    )
    SELECT COUNT(*), MAX(duration_hours)
    INTO v_consecutive_days, v_last_shift_duration
    FROM consecutive_shifts;

    -- Validate based on pattern type
    CASE v_pattern_type
        WHEN '4x10' THEN
            IF v_consecutive_days >= 4 THEN
                RAISE EXCEPTION 'Pattern violation: Cannot exceed 4 consecutive days for 4x10 pattern';
            END IF;
        WHEN '3x12_1x4' THEN
            IF v_consecutive_days >= 3 AND v_last_shift_duration = 12 THEN
                RAISE EXCEPTION 'Pattern violation: Cannot exceed 3 consecutive 12-hour shifts for 3x12 pattern';
            END IF;
        ELSE
            -- Custom patterns handled separately
            NULL;
    END CASE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for pattern validation
CREATE TRIGGER validate_shift_pattern_trigger
    BEFORE INSERT OR UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION validate_shift_pattern();

-- Add function to calculate weekly hours
CREATE OR REPLACE FUNCTION calculate_weekly_hours(p_employee_id UUID, p_date DATE)
RETURNS INTEGER AS $$
DECLARE
    v_total_hours INTEGER;
BEGIN
    SELECT COALESCE(SUM(sh.duration_hours), 0)
    INTO v_total_hours
    FROM public.schedules s
    JOIN public.shifts sh ON s.shift_id = sh.id
    WHERE s.employee_id = p_employee_id
    AND s.date BETWEEN date_trunc('week', p_date::timestamp)::date
                   AND (date_trunc('week', p_date::timestamp) + interval '6 days')::date;
    
    RETURN v_total_hours;
END;
$$ LANGUAGE plpgsql;

-- Add function to validate overtime
CREATE OR REPLACE FUNCTION validate_overtime()
RETURNS trigger AS $$
DECLARE
    v_weekly_hours INTEGER;
    v_max_hours INTEGER;
    v_allow_overtime BOOLEAN;
BEGIN
    -- Get employee's overtime settings
    SELECT max_weekly_hours, allow_overtime
    INTO v_max_hours, v_allow_overtime
    FROM public.employees
    WHERE id = NEW.employee_id;

    -- Calculate total weekly hours including new shift
    SELECT calculate_weekly_hours(NEW.employee_id, NEW.date)
    INTO v_weekly_hours;

    -- Add hours from new shift
    SELECT v_weekly_hours + duration_hours
    INTO v_weekly_hours
    FROM public.shifts
    WHERE id = NEW.shift_id;

    -- Validate overtime
    IF v_weekly_hours > v_max_hours AND NOT v_allow_overtime THEN
        RAISE EXCEPTION 'Overtime not allowed: Weekly hours (%) would exceed maximum (%)', 
            v_weekly_hours, v_max_hours;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for overtime validation
CREATE TRIGGER validate_overtime_trigger
    BEFORE INSERT OR UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION validate_overtime();

-- Add RPC function to update employee and profile
CREATE OR REPLACE FUNCTION update_employee_and_profile(
    p_employee_id UUID,
    p_full_name TEXT,
    p_username TEXT,
    p_employee_role employee_role,
    p_weekly_hours_scheduled INTEGER,
    p_default_shift_type_id UUID DEFAULT NULL,
    p_allow_overtime BOOLEAN DEFAULT false,
    p_max_weekly_hours INTEGER DEFAULT 40
)
RETURNS public.employees AS $$
DECLARE
    v_employee public.employees;
BEGIN
    -- Check if user has permission to update employees
    IF NOT EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.id = auth.uid()
        AND e.employee_role IN ('MANAGER'::employee_role, 'ADMIN'::employee_role)
    ) THEN
        RAISE EXCEPTION 'Permission denied: Only managers and admins can update employees';
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET 
        full_name = p_full_name,
        username = p_username,
        updated_at = now()
    WHERE id = p_employee_id;

    -- Update employee
    UPDATE public.employees
    SET 
        employee_role = p_employee_role,
        weekly_hours_scheduled = p_weekly_hours_scheduled,
        default_shift_type_id = p_default_shift_type_id,
        allow_overtime = p_allow_overtime,
        max_weekly_hours = p_max_weekly_hours,
        updated_at = now()
    WHERE id = p_employee_id
    RETURNING * INTO v_employee;

    RETURN v_employee;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_employee_and_profile(
    UUID,
    TEXT,
    TEXT,
    employee_role,
    INTEGER,
    UUID,
    BOOLEAN,
    INTEGER
) TO authenticated; 