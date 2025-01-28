-- Scheduler System Migration
-- This migration sets up the scheduler system including schedules, time off, and patterns
BEGIN;

------ ENUMS ------
-- Schedule status enum
CREATE TYPE public.schedule_status AS ENUM (
    'draft',
    'published',
    'archived'
);

-- Schedule operation enum
CREATE TYPE public.schedule_operation AS ENUM (
    'PUBLISH',
    'UNPUBLISH',
    'UPDATE',
    'DELETE'
);

------ TABLES ------
-- Schedules table
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES auth.users(id),
    date DATE NOT NULL,
    shift_id UUID NOT NULL,
    status schedule_status NOT NULL DEFAULT 'draft',
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

-- Time off requests table
CREATE TABLE public.time_off_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    type public.time_off_type NOT NULL DEFAULT 'PERSONAL',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    is_paid BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

------ INDEXES ------
CREATE INDEX idx_schedules_employee ON public.schedules(employee_id);
CREATE INDEX idx_schedules_organization ON public.schedules(organization_id);
CREATE INDEX idx_schedules_date ON public.schedules(date);
CREATE INDEX idx_schedule_operations_schedule ON public.schedule_operations(schedule_id);
CREATE INDEX idx_schedule_operations_status ON public.schedule_operations(status);
CREATE INDEX idx_time_off_employee ON public.time_off_requests(employee_id);
CREATE INDEX idx_time_off_dates ON public.time_off_requests(start_date, end_date);
CREATE INDEX idx_time_off_status ON public.time_off_requests(status);

------ FUNCTIONS ------
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
    AND (p_start_time, p_end_time) OVERLAPS (s.start_time, s.end_time);

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
            WHEN v_operation.operation = 'PUBLISH' THEN 'draft'::schedule_status
            WHEN v_operation.operation = 'UNPUBLISH' THEN 'published'::schedule_status
            ELSE status
        END
        WHERE id = v_operation.schedule_id;
    END IF;

    RETURN v_operation;
END;
$$;

------ TRIGGERS ------
-- Add updated_at triggers
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_schedule_settings_updated_at
    BEFORE UPDATE ON public.schedule_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_schedule_operations_updated_at
    BEFORE UPDATE ON public.schedule_operations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON public.time_off_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

------ RLS POLICIES ------
-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

-- Schedule policies
CREATE POLICY "Users can view their schedules"
    ON public.schedules
    FOR SELECT
    USING (
        employee_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = schedules.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- Schedule settings policies
CREATE POLICY "Users can view their organization's schedule settings"
    ON public.schedule_settings
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = schedule_settings.organization_id
        )
    );

-- Schedule operations policies
CREATE POLICY "Users can view their schedule operations"
    ON public.schedule_operations
    FOR SELECT
    USING (
        schedule_id IN (
            SELECT id FROM public.schedules
            WHERE employee_id = auth.uid()
        )
    );

-- Time off request policies
CREATE POLICY "Users can view their time off requests"
    ON public.time_off_requests
    FOR SELECT
    USING (
        employee_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = time_off_requests.organization_id
            AND role IN ('admin', 'manager')
        )
    );

------ GRANTS ------
GRANT SELECT ON public.schedules TO authenticated;
GRANT SELECT ON public.schedule_settings TO authenticated;
GRANT SELECT ON public.schedule_operations TO authenticated;
GRANT SELECT ON public.time_off_requests TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_shift_overlap TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_schedule_operation TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_schedule_operation TO authenticated;

COMMIT; 