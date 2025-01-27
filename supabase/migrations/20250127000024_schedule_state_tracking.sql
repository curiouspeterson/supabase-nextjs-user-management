-- Schedule State Tracking Migration
BEGIN;

-- Create schedule operation type if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_operation') THEN
        CREATE TYPE public.schedule_operation AS ENUM (
            'PUBLISH',
            'UNPUBLISH',
            'UPDATE',
            'DELETE'
        );
    END IF;
END$$;

-- Create schedule status type if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'schedule_status') THEN
        CREATE TYPE public.schedule_status AS ENUM (
            'draft',
            'published',
            'archived'
        );
    END IF;
END$$;

-- Create schedule state tracking table
CREATE TABLE IF NOT EXISTS public.schedule_operations (
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

-- Add status column to schedules if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'schedules' 
                  AND column_name = 'status') THEN
        ALTER TABLE public.schedules
        ADD COLUMN status schedule_status NOT NULL DEFAULT 'draft';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'schedules' 
                  AND column_name = 'last_operation_id') THEN
        ALTER TABLE public.schedules
        ADD COLUMN last_operation_id UUID REFERENCES public.schedule_operations(id);
    END IF;
END$$;

-- Function to track schedule operations
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

-- Function to complete schedule operation
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

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_schedule_operations_schedule 
ON public.schedule_operations(schedule_id);

CREATE INDEX IF NOT EXISTS idx_schedule_operations_status 
ON public.schedule_operations(status);

-- Enable RLS
ALTER TABLE public.schedule_operations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own schedule operations" ON public.schedule_operations;

-- Create RLS Policies
CREATE POLICY "Users can view their own schedule operations"
ON public.schedule_operations
FOR SELECT
TO authenticated
USING (
    schedule_id IN (
        SELECT id FROM public.schedules
        WHERE employee_id = auth.uid()
    )
);

-- Grant permissions
GRANT SELECT ON public.schedule_operations TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_schedule_operation TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_schedule_operation TO authenticated;

COMMIT; 