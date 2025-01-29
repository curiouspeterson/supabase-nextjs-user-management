-- Migration: Add Shift Management System
BEGIN;

------ Enum Types ------
DO $$ BEGIN
    CREATE TYPE public.shift_type_enum AS ENUM (
        'Day Shift Early',
        'Day Shift',
        'Swing Shift',
        'Night Shift'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

------ Tables ------
-- Create shift_types table first
DROP TABLE IF EXISTS public.shift_types CASCADE;
CREATE TABLE public.shift_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name shift_type_enum NOT NULL,
    description TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_overnight BOOLEAN NOT NULL DEFAULT false,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_shift_times CHECK (
        (NOT is_overnight AND start_time < end_time) OR
        (is_overnight AND start_time > end_time)
    )
);

-- Create shifts table
DROP TABLE IF EXISTS public.shifts CASCADE;
CREATE TABLE public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_type_id UUID NOT NULL,
    date DATE NOT NULL,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_shift_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT shifts_shift_type_id_fkey FOREIGN KEY (shift_type_id) REFERENCES public.shift_types(id) ON DELETE RESTRICT
);

-- Create shift_patterns table
DROP TABLE IF EXISTS public.shift_patterns CASCADE;
CREATE TABLE public.shift_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    rotation_days INTEGER NOT NULL DEFAULT 7,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pattern_details table
DROP TABLE IF EXISTS public.pattern_details CASCADE;
CREATE TABLE public.pattern_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id UUID NOT NULL,
    shift_type_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(pattern_id, day_of_week),
    CONSTRAINT pattern_details_pattern_id_fkey FOREIGN KEY (pattern_id) REFERENCES public.shift_patterns(id) ON DELETE CASCADE,
    CONSTRAINT pattern_details_shift_type_id_fkey FOREIGN KEY (shift_type_id) REFERENCES public.shift_types(id) ON DELETE RESTRICT
);

-- Create staffing_requirements table
DROP TABLE IF EXISTS public.staffing_requirements CASCADE;
CREATE TABLE public.staffing_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_type_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    minimum_staff INTEGER NOT NULL DEFAULT 1,
    preferred_staff INTEGER NOT NULL DEFAULT 1,
    maximum_staff INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_staff_numbers CHECK (
        minimum_staff > 0 
        AND preferred_staff >= minimum_staff
        AND (maximum_staff IS NULL OR maximum_staff >= preferred_staff)
    ),
    CONSTRAINT staffing_requirements_shift_type_id_fkey FOREIGN KEY (shift_type_id) REFERENCES public.shift_types(id) ON DELETE RESTRICT
);

------ Initial Data ------
-- Insert basic shift types
INSERT INTO public.shift_types (id, name, description, start_time, end_time, is_overnight, color)
VALUES
    ('a0bb0dda-bc72-412e-ac66-5d23f1cfac27', 'Day Shift Early', 'Early morning shift starting at 5 AM', '05:00:00', '13:00:00', false, '#4CAF50'),
    ('b1cc1eeb-cd84-5237-bd77-6e442ff1bd38', 'Day Shift', 'Standard day shift starting at 9 AM', '09:00:00', '17:00:00', false, '#2196F3'),
    ('c2dd2ffc-de95-6348-ce88-7f653f2fce49', 'Swing Shift', 'Afternoon to evening shift', '16:00:00', '00:00:00', true, '#FFC107'),
    ('d3ee3ffd-ef06-7459-df99-8f664f3fdf50', 'Night Shift', 'Overnight shift', '23:00:00', '07:00:00', true, '#9C27B0')
ON CONFLICT (id) DO UPDATE
SET 
    description = EXCLUDED.description,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    is_overnight = EXCLUDED.is_overnight,
    color = EXCLUDED.color;

------ Indexes ------
CREATE INDEX IF NOT EXISTS idx_shifts_type ON public.shifts(shift_type_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON public.shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON public.shifts(status);

CREATE INDEX IF NOT EXISTS idx_pattern_details_pattern ON public.pattern_details(pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_details_day ON public.pattern_details(day_of_week);

CREATE INDEX IF NOT EXISTS idx_staffing_requirements_type ON public.staffing_requirements(shift_type_id);
CREATE INDEX IF NOT EXISTS idx_staffing_requirements_day ON public.staffing_requirements(day_of_week);

------ Functions ------
CREATE OR REPLACE FUNCTION public.validate_shift_times()
RETURNS TRIGGER AS $$
DECLARE
    shift_start TIME;
    shift_end TIME;
    is_overnight BOOLEAN;
BEGIN
    SELECT start_time, end_time, is_overnight INTO shift_start, shift_end, is_overnight
    FROM public.shift_types
    WHERE id = NEW.shift_type_id;

    -- Validate actual times against shift type times if provided
    IF NEW.actual_start_time IS NOT NULL AND NEW.actual_end_time IS NOT NULL THEN
        IF is_overnight THEN
            -- For overnight shifts, end time should be after start time in the next day
            IF NEW.actual_end_time <= NEW.actual_start_time THEN
                RAISE EXCEPTION 'For overnight shifts, end time must be after start time in the next day';
            END IF;
        ELSE
            -- For regular shifts, times should be within the same day
            IF NEW.actual_start_time::time < shift_start OR
               NEW.actual_end_time::time > shift_end THEN
                RAISE EXCEPTION 'Actual shift times must be within shift type times';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------ Triggers ------
CREATE TRIGGER validate_shift_times_trigger
    BEFORE INSERT OR UPDATE ON public.shifts
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_shift_times();

CREATE TRIGGER update_shift_types_timestamp
    BEFORE UPDATE ON public.shift_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shifts_timestamp
    BEFORE UPDATE ON public.shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shift_patterns_timestamp
    BEFORE UPDATE ON public.shift_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_staffing_requirements_timestamp
    BEFORE UPDATE ON public.staffing_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

------ RLS Policies ------
ALTER TABLE public.shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_requirements ENABLE ROW LEVEL SECURITY;

-- Shift Types Policies
CREATE POLICY "Anyone can view shift types"
    ON public.shift_types FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can modify shift types"
    ON public.shift_types FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- Shifts Policies
CREATE POLICY "Users can view their assigned shifts"
    ON public.shifts FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM schedules
            WHERE schedules.shift_id = shifts.id
            AND schedules.employee_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all shifts"
    ON public.shifts FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- Shift Patterns Policies
CREATE POLICY "Anyone can view shift patterns"
    ON public.shift_patterns FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can modify patterns"
    ON public.shift_patterns FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- Pattern Details Policies
CREATE POLICY "Anyone can view pattern details"
    ON public.pattern_details FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can modify pattern details"
    ON public.pattern_details FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

-- Staffing Requirements Policies
CREATE POLICY "Anyone can view staffing requirements"
    ON public.staffing_requirements FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can modify staffing requirements"
    ON public.staffing_requirements FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()
            AND employees.employee_role = 'ADMIN'
        )
    );

COMMIT; 
