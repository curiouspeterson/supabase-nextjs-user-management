-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create shift_types table
CREATE TABLE IF NOT EXISTS public.shift_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_type_id UUID NOT NULL REFERENCES public.shift_types(id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours INTEGER NOT NULL,
    duration_category TEXT NOT NULL CHECK (duration_category IN ('4 hours', '8 hours', '10 hours', '12 hours')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_duration CHECK (duration_hours > 0 AND duration_hours <= 12)
);

-- Create employees table if not exists
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    employee_role TEXT NOT NULL CHECK (employee_role IN ('Dispatcher', 'Shift Supervisor', 'Manager')),
    weekly_hours_scheduled INTEGER NOT NULL DEFAULT 0,
    default_shift_type_id UUID REFERENCES public.shift_types(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create shift_patterns table
CREATE TABLE IF NOT EXISTS public.shift_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    pattern TEXT NOT NULL,
    is_forbidden BOOLEAN NOT NULL DEFAULT false,
    length INTEGER NOT NULL,
    pattern_type TEXT NOT NULL CHECK (pattern_type IN ('4x10', '3x12_1x4', 'Custom')),
    shift_duration INTEGER NOT NULL,
    days_on INTEGER NOT NULL,
    days_off INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_pattern_length CHECK (length > 0 AND length <= 28)
);

-- Create employee_patterns table
CREATE TABLE IF NOT EXISTS public.employee_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    pattern_id UUID NOT NULL REFERENCES public.shift_patterns(id),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date > start_date)
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    shift_id UUID NOT NULL REFERENCES public.shifts(id),
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Approved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
);

-- Create staffing_requirements table
CREATE TABLE IF NOT EXISTS public.staffing_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    minimum_employees INTEGER NOT NULL,
    shift_supervisor_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_minimum CHECK (minimum_employees > 0)
);

-- Create time_off_requests table
CREATE TABLE IF NOT EXISTS public.time_off_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Vacation', 'Sick Leave', 'Training')),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Declined')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create daily_coverage table
CREATE TABLE IF NOT EXISTS public.daily_coverage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    period_id UUID NOT NULL REFERENCES public.staffing_requirements(id),
    actual_coverage INTEGER NOT NULL DEFAULT 0,
    coverage_status TEXT NOT NULL DEFAULT 'Under' CHECK (coverage_status IN ('Under', 'Met', 'Over')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_date_period UNIQUE (date, period_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedules_date ON public.schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_employee ON public.schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_off_dates ON public.time_off_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_coverage_date ON public.daily_coverage(date);
CREATE INDEX IF NOT EXISTS idx_employee_patterns_date ON public.employee_patterns(start_date, end_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
DO $$ BEGIN
    CREATE TRIGGER update_shift_types_updated_at
        BEFORE UPDATE ON public.shift_types
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_shifts_updated_at
        BEFORE UPDATE ON public.shifts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_employees_updated_at
        BEFORE UPDATE ON public.employees
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_shift_patterns_updated_at
        BEFORE UPDATE ON public.shift_patterns
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_employee_patterns_updated_at
        BEFORE UPDATE ON public.employee_patterns
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_schedules_updated_at
        BEFORE UPDATE ON public.schedules
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_staffing_requirements_updated_at
        BEFORE UPDATE ON public.staffing_requirements
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_time_off_requests_updated_at
        BEFORE UPDATE ON public.time_off_requests
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_daily_coverage_updated_at
        BEFORE UPDATE ON public.daily_coverage
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to check schedule conflicts
CREATE OR REPLACE FUNCTION check_schedule_conflicts()
RETURNS trigger AS $$
DECLARE
    v_conflict_count INTEGER;
BEGIN
    -- Check for time off conflicts
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.time_off_requests
    WHERE employee_id = NEW.employee_id
    AND status = 'Approved'
    AND NEW.date BETWEEN start_date AND end_date;

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Schedule conflicts with approved time off';
    END IF;

    -- Check for overlapping shifts
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.schedules s
    JOIN public.shifts sh ON s.shift_id = sh.id
    WHERE s.employee_id = NEW.employee_id
    AND s.date = NEW.date
    AND s.id != NEW.id;

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Employee already scheduled for this date';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add conflict check trigger
CREATE TRIGGER check_schedule_conflicts_trigger
    BEFORE INSERT OR UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION check_schedule_conflicts(); 