-- Error Status Codes Migration
BEGIN;

-- Create error status codes enum
CREATE TYPE public.error_status_code AS ENUM (
    'BAD_REQUEST',           -- 400
    'UNAUTHORIZED',          -- 401
    'FORBIDDEN',            -- 403
    'NOT_FOUND',            -- 404
    'METHOD_NOT_ALLOWED',   -- 405
    'CONFLICT',             -- 409
    'UNPROCESSABLE_ENTITY', -- 422
    'TOO_MANY_REQUESTS',    -- 429
    'INTERNAL_ERROR',       -- 500
    'NOT_IMPLEMENTED',      -- 501
    'SERVICE_UNAVAILABLE'   -- 503
);

-- Create error status code mappings table
CREATE TABLE IF NOT EXISTS public.error_status_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_code TEXT NOT NULL UNIQUE,
    status_code error_status_code NOT NULL,
    http_code INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function to get HTTP code from error code
CREATE OR REPLACE FUNCTION public.get_error_http_code(p_error_code TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT http_code
        FROM public.error_status_codes
        WHERE error_code = p_error_code
    );
END;
$$;

-- Insert default mappings
INSERT INTO public.error_status_codes (error_code, status_code, http_code, description)
VALUES
    ('APP_ERROR', 'INTERNAL_ERROR', 500, 'Generic application error'),
    ('VALIDATION_ERROR', 'UNPROCESSABLE_ENTITY', 422, 'Data validation error'),
    ('AUTH_ERROR', 'UNAUTHORIZED', 401, 'Authentication error'),
    ('SECURITY_ERROR', 'FORBIDDEN', 403, 'Security violation error'),
    ('NETWORK_ERROR', 'SERVICE_UNAVAILABLE', 503, 'Network communication error'),
    ('RATE_LIMIT_ERROR', 'TOO_MANY_REQUESTS', 429, 'Rate limit exceeded'),
    ('NOT_FOUND_ERROR', 'NOT_FOUND', 404, 'Resource not found'),
    ('CONFLICT_ERROR', 'CONFLICT', 409, 'Resource conflict error'),
    ('METHOD_ERROR', 'METHOD_NOT_ALLOWED', 405, 'Method not allowed'),
    ('STORAGE_ERROR', 'INTERNAL_ERROR', 500, 'Storage operation error'),
    ('STORAGE_QUOTA_ERROR', 'UNPROCESSABLE_ENTITY', 422, 'Storage quota exceeded'),
    ('ERROR_ANALYTICS_ERROR', 'INTERNAL_ERROR', 500, 'Error analytics operation failed')
ON CONFLICT (error_code) DO UPDATE
SET
    status_code = EXCLUDED.status_code,
    http_code = EXCLUDED.http_code,
    description = EXCLUDED.description;

-- Add RLS policies
ALTER TABLE public.error_status_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read error status codes"
ON public.error_status_codes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify error status codes"
ON public.error_status_codes
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

-- Grant permissions
GRANT SELECT ON public.error_status_codes TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_error_http_code TO authenticated;

COMMIT; 