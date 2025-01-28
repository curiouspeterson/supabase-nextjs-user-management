-- Error Logging System Migration
BEGIN;

-- Error logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Error logging function
CREATE OR REPLACE FUNCTION public.log_scheduler_error(
    p_error_type TEXT,
    p_error_message TEXT,
    p_error_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.error_logs (
        error_type,
        error_message,
        error_details
    ) VALUES (
        p_error_type,
        p_error_message,
        p_error_details
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

-- Add updated_at trigger
CREATE TRIGGER update_error_logs_updated_at
    BEFORE UPDATE ON public.error_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create index for error type
CREATE INDEX idx_error_logs_type ON public.error_logs(error_type);

COMMIT; 