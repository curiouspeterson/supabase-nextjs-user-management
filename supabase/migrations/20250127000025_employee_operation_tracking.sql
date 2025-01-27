-- Employee Operation Tracking Migration
BEGIN;

-- Create employee operation type
CREATE TYPE public.employee_operation AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'RESTORE'
);

-- Create employee operation severity
CREATE TYPE public.operation_severity AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

-- Create employee operations table
CREATE TABLE public.employee_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operation employee_operation NOT NULL,
    severity operation_severity NOT NULL DEFAULT 'LOW',
    status TEXT NOT NULL DEFAULT 'pending',
    error_code TEXT,
    error_details TEXT,
    stack_trace TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    client_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'retrying'))
);

-- Function to track employee operation
CREATE OR REPLACE FUNCTION public.track_employee_operation(
    p_employee_id UUID,
    p_operation employee_operation,
    p_severity operation_severity DEFAULT 'LOW',
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_client_info JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_operation_id UUID;
BEGIN
    INSERT INTO public.employee_operations (
        employee_id,
        operation,
        severity,
        metadata,
        client_info,
        created_by
    ) VALUES (
        p_employee_id,
        p_operation,
        p_severity,
        p_metadata,
        p_client_info,
        auth.uid()
    )
    RETURNING id INTO v_operation_id;

    RETURN v_operation_id;
END;
$$;

-- Function to complete employee operation
CREATE OR REPLACE FUNCTION public.complete_employee_operation(
    p_operation_id UUID,
    p_status TEXT DEFAULT 'completed',
    p_error_code TEXT DEFAULT NULL,
    p_error_details TEXT DEFAULT NULL,
    p_stack_trace TEXT DEFAULT NULL
)
RETURNS public.employee_operations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_operation public.employee_operations;
BEGIN
    UPDATE public.employee_operations
    SET status = p_status,
        error_code = p_error_code,
        error_details = p_error_details,
        stack_trace = p_stack_trace,
        updated_at = NOW(),
        retry_count = CASE 
            WHEN p_status = 'retrying' 
            THEN retry_count + 1 
            ELSE retry_count 
        END,
        last_retry_at = CASE 
            WHEN p_status = 'retrying' 
            THEN NOW() 
            ELSE last_retry_at 
        END
    WHERE id = p_operation_id
    RETURNING * INTO v_operation;

    RETURN v_operation;
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employee_operations_employee 
ON public.employee_operations(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_operations_status 
ON public.employee_operations(status);

CREATE INDEX IF NOT EXISTS idx_employee_operations_created 
ON public.employee_operations(created_at DESC);

-- Enable RLS
ALTER TABLE public.employee_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all employee operations"
ON public.employee_operations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Users can view their own operations"
ON public.employee_operations
FOR SELECT
TO authenticated
USING (
    employee_id = auth.uid() OR
    created_by = auth.uid()
);

-- Grant permissions
GRANT SELECT ON public.employee_operations TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_employee_operation TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_employee_operation TO authenticated;

COMMIT; 