-- Scheduler System Migration
-- This migration sets up the scheduler system including schedules, patterns, and shifts
BEGIN;

------ Schedule Related Enums ------
-- Schedule operation enum
CREATE TYPE public.schedule_operation AS ENUM (
    'PUBLISH',
    'UNPUBLISH',
    'UPDATE',
    'DELETE'
);

CREATE TYPE public.coverage_status_enum AS ENUM (
    'Under',
    'Met',
    'Over'
);

CREATE TYPE public.day_of_week_enum AS ENUM (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);

CREATE TYPE public.shift_duration_category AS ENUM (
    'SHORT',
    'REGULAR',
    'EXTENDED',
    'LONG'
);

------ Employee Tables ------
-- Employees table
CREATE TABLE public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_role public.employee_role NOT NULL DEFAULT 'STAFF',
    weekly_hours_scheduled INTEGER NOT NULL DEFAULT 40,
    default_shift_type_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time off requests table
CREATE TABLE public.time_off_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    type public.time_off_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

------ Scheduler Config ------
CREATE TABLE IF NOT EXISTS public.scheduler_config (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    timezone text NOT NULL DEFAULT 'UTC',
    business_hours_start time NOT NULL DEFAULT '09:00:00',
    business_hours_end time NOT NULL DEFAULT '17:00:00',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id)
);

------ Schedule Tables ------
-- Schedules table
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES auth.users(id),
    date DATE NOT NULL,
    shift_id UUID NOT NULL,
    status public.schedule_status NOT NULL DEFAULT 'DRAFT',
    timezone text NOT NULL DEFAULT 'UTC',
    period_start timestamp with time zone NOT NULL DEFAULT now(),
    period_end timestamp with time zone NOT NULL DEFAULT now() + interval '8 hours',
    last_operation_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schedule settings table
CREATE TABLE public.schedule_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    day_start_time TIME NOT NULL DEFAULT '05:00:00',
    day_end_time TIME NOT NULL DEFAULT '23:00:00',
    allow_overlapping_shifts BOOLEAN NOT NULL DEFAULT false,
    max_overlap_count INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- Schedule operations table
CREATE TABLE public.schedule_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    operation schedule_operation NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'rolled_back'))
);

------ Pattern System ------
-- Patterns table
CREATE TABLE IF NOT EXISTS public.patterns (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Shift types table
CREATE TABLE IF NOT EXISTS public.shift_types (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE,
    color text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pattern shifts table
CREATE TABLE IF NOT EXISTS public.pattern_shifts (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    pattern_id bigint NOT NULL,
    shift_type_id bigint NOT NULL,
    day_of_week smallint NOT NULL,
    start_time time with time zone NOT NULL,
    end_time time with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT pattern_shifts_pattern_id_fkey FOREIGN KEY (pattern_id) REFERENCES public.patterns(id) ON DELETE CASCADE,
    CONSTRAINT pattern_shifts_shift_type_id_fkey FOREIGN KEY (shift_type_id) REFERENCES public.shift_types(id) ON DELETE CASCADE,
    CONSTRAINT pattern_shifts_day_of_week_check CHECK ((day_of_week >= 0 AND day_of_week <= 6))
);

------ Validation Functions ------
-- Business hours validation
CREATE OR REPLACE FUNCTION public.validate_business_hours(
    start_time time,
    end_time time
) RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Ensure end time is after start time
    IF end_time <= start_time THEN
        RETURN false;
    END IF;

    -- Ensure shift is not longer than 24 hours
    IF (end_time - start_time) > interval '24 hours' THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- Date range validation
CREATE OR REPLACE FUNCTION public.validate_date_range(
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    allow_past boolean DEFAULT false
) RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if dates are valid
    IF start_date IS NULL OR end_date IS NULL THEN
        RETURN false;
    END IF;

    -- Ensure end date is after start date
    IF end_date < start_date THEN
        RETURN false;
    END IF;

    -- Check if past dates are allowed
    IF NOT allow_past AND start_date < CURRENT_TIMESTAMP THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- Timezone validation
CREATE OR REPLACE FUNCTION public.is_valid_timezone(
    timezone text
) RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if timezone is in pg_timezone_names
    RETURN EXISTS (
        SELECT 1 
        FROM pg_timezone_names 
        WHERE name = timezone
    );
END;
$$;

-- Validate shift overlap function
CREATE OR REPLACE FUNCTION public.validate_shift_overlap(
    p_shift_id UUID,
    p_employee_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    is_valid BOOLEAN,
    overlap_count INTEGER,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_organization_id UUID;
    v_allow_overlapping BOOLEAN;
    v_max_overlap INTEGER;
    v_overlap_count INTEGER;
BEGIN
    -- Get organization settings
    SELECT 
        s.organization_id,
        s.allow_overlapping_shifts,
        s.max_overlap_count
    INTO 
        v_organization_id,
        v_allow_overlapping,
        v_max_overlap
    FROM public.employees e
    JOIN public.organization_users ou ON ou.user_id = e.id
    JOIN public.schedule_settings s ON s.organization_id = ou.organization_id
    WHERE e.id = p_employee_id;

    -- Count overlapping shifts
    SELECT COUNT(*)
    INTO v_overlap_count
    FROM public.schedules s
    WHERE s.employee_id = p_employee_id
    AND s.id != p_shift_id
    AND (p_start_time, p_end_time) OVERLAPS (s.period_start, s.period_end);

    -- Validate overlap
    IF NOT v_allow_overlapping AND v_overlap_count > 0 THEN
        RETURN QUERY
        SELECT 
            FALSE,
            v_overlap_count,
            'Overlapping shifts are not allowed for this organization'::TEXT;
    ELSIF v_overlap_count >= v_max_overlap THEN
        RETURN QUERY
        SELECT 
            FALSE,
            v_overlap_count,
            format('Maximum overlap count of %s exceeded', v_max_overlap)::TEXT;
    ELSE
        RETURN QUERY
        SELECT 
            TRUE,
            v_overlap_count,
            'Shift overlap is valid'::TEXT;
    END IF;
END;
$$;

------ Schedule Operation Functions ------
-- Track schedule operation function
CREATE OR REPLACE FUNCTION public.track_schedule_operation(
    p_schedule_id UUID,
    p_operation schedule_operation,
    p_previous_state JSONB DEFAULT NULL,
    p_new_state JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_operation_id UUID;
BEGIN
    -- Insert operation record
    INSERT INTO public.schedule_operations (
        schedule_id,
        operation,
        previous_state,
        new_state,
        created_by,
        metadata
    ) VALUES (
        p_schedule_id,
        p_operation,
        p_previous_state,
        p_new_state,
        auth.uid(),
        p_metadata
    )
    RETURNING id INTO v_operation_id;

    -- Update schedule with last operation
    UPDATE public.schedules
    SET last_operation_id = v_operation_id,
        updated_at = NOW()
    WHERE id = p_schedule_id;

    RETURN v_operation_id;
END;
$$;

-- Complete schedule operation function
CREATE OR REPLACE FUNCTION public.complete_schedule_operation(
    p_operation_id UUID,
    p_status TEXT DEFAULT 'completed',
    p_error_details TEXT DEFAULT NULL
)
RETURNS public.schedule_operations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_operation public.schedule_operations;
BEGIN
    -- Update operation status
    UPDATE public.schedule_operations
    SET status = p_status,
        error_details = p_error_details,
        updated_at = NOW()
    WHERE id = p_operation_id
    RETURNING * INTO v_operation;

    -- If operation failed, update schedule status
    IF p_status = 'failed' THEN
        UPDATE public.schedules
        SET status = CASE
            WHEN v_operation.operation = 'PUBLISH' THEN 'DRAFT'
            WHEN v_operation.operation = 'UNPUBLISH' THEN 'PUBLISHED'
            ELSE status
        END
        WHERE id = v_operation.schedule_id;
    END IF;

    RETURN v_operation;
END;
$$;

------ Constraints ------
-- Add business hours validation constraint
ALTER TABLE "public"."schedules" ADD CONSTRAINT "valid_business_hours" 
    CHECK (validate_business_hours(period_start::time, period_end::time)) NOT VALID;
ALTER TABLE "public"."schedules" VALIDATE CONSTRAINT "valid_business_hours";

-- Add schedule dates validation constraint
ALTER TABLE "public"."schedules" ADD CONSTRAINT "valid_schedule_dates" 
    CHECK (validate_date_range(period_start, period_end, false)) NOT VALID;
ALTER TABLE "public"."schedules" VALIDATE CONSTRAINT "valid_schedule_dates";

-- Add timezone validation constraints
ALTER TABLE "public"."scheduler_config" ADD CONSTRAINT "scheduler_config_valid_timezone" 
    CHECK (is_valid_timezone(timezone)) NOT VALID;
ALTER TABLE "public"."scheduler_config" VALIDATE CONSTRAINT "scheduler_config_valid_timezone";

ALTER TABLE "public"."schedules" ADD CONSTRAINT "valid_timezone" 
    CHECK (is_valid_timezone(timezone)) NOT VALID;
ALTER TABLE "public"."schedules" VALIDATE CONSTRAINT "valid_timezone";

------ Indexes ------
CREATE INDEX idx_schedules_employee ON public.schedules(employee_id);
CREATE INDEX idx_schedules_organization ON public.schedules(organization_id);
CREATE INDEX idx_schedules_date ON public.schedules(date);
CREATE INDEX idx_schedule_operations_schedule ON public.schedule_operations(schedule_id);
CREATE INDEX idx_schedule_operations_status ON public.schedule_operations(status);
CREATE INDEX pattern_shifts_pattern_id_idx ON public.pattern_shifts (pattern_id);
CREATE INDEX pattern_shifts_shift_type_id_idx ON public.pattern_shifts (shift_type_id);
CREATE INDEX pattern_shifts_day_of_week_idx ON public.pattern_shifts (day_of_week);

-- Employee indexes
CREATE INDEX idx_employees_organization ON public.employees(organization_id);
CREATE INDEX idx_employees_role ON public.employees(employee_role);
CREATE INDEX idx_employees_active ON public.employees(is_active);

-- Time off request indexes
CREATE INDEX idx_time_off_requests_employee ON public.time_off_requests(employee_id);
CREATE INDEX idx_time_off_requests_organization ON public.time_off_requests(organization_id);
CREATE INDEX idx_time_off_requests_dates ON public.time_off_requests(start_date, end_date);
CREATE INDEX idx_time_off_requests_status ON public.time_off_requests(status);

------ Triggers ------
-- Employee updated_at trigger
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Time off request updated_at trigger
CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON public.time_off_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

------ RLS Policies ------
-- Enable RLS on all tables
ALTER TABLE public.scheduler_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_shifts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for scheduler tables
CREATE POLICY "Enable read access for authenticated users" ON public.scheduler_config
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.scheduler_config
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.scheduler_config
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON public.patterns
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.patterns
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.patterns
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON public.patterns
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.shift_types
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.shift_types
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.shift_types
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON public.shift_types
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.pattern_shifts
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.pattern_shifts
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.pattern_shifts
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON public.pattern_shifts
    FOR DELETE TO authenticated USING (true);

-- Enable RLS on new tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

-- Employee policies
CREATE POLICY "Users can view their own employee record"
    ON public.employees
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Managers can view organization employees"
    ON public.employees
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_users ou
            WHERE ou.user_id = auth.uid()
            AND ou.organization_id = employees.organization_id
            AND ou.role IN ('admin', 'manager')
        )
    );

-- Time off request policies
CREATE POLICY "Users can view their own time off requests"
    ON public.time_off_requests
    FOR SELECT
    USING (employee_id = auth.uid());

CREATE POLICY "Users can create their own time off requests"
    ON public.time_off_requests
    FOR INSERT
    WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can update their pending time off requests"
    ON public.time_off_requests
    FOR UPDATE
    USING (
        employee_id = auth.uid()
        AND status = 'pending'
    );

CREATE POLICY "Managers can view and manage organization time off requests"
    ON public.time_off_requests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_users ou
            WHERE ou.user_id = auth.uid()
            AND ou.organization_id = time_off_requests.organization_id
            AND ou.role IN ('admin', 'manager')
        )
    );

------ Grants ------
-- Grant permissions for employees
GRANT SELECT ON public.employees TO authenticated;
GRANT UPDATE (weekly_hours_scheduled, default_shift_type_id) ON public.employees TO authenticated;

-- Grant permissions for time off requests
GRANT SELECT, INSERT ON public.time_off_requests TO authenticated;
GRANT UPDATE (status, notes) ON public.time_off_requests TO authenticated;

COMMIT; 