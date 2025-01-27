-- Period Validation Migration
BEGIN;

-- Create custom types
CREATE TYPE public.period_format AS ENUM (
    'HH:MM-HH:MM',
    'HH:MM:SS-HH:MM:SS',
    'HHMM-HHMM'
);

-- Create period validation functions
CREATE OR REPLACE FUNCTION public.validate_period_format(
    p_period_id TEXT,
    p_format period_format DEFAULT 'HH:MM-HH:MM'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_pattern TEXT;
BEGIN
    CASE p_format
        WHEN 'HH:MM-HH:MM' THEN
            v_pattern := '^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$';
        WHEN 'HH:MM:SS-HH:MM:SS' THEN
            v_pattern := '^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$';
        WHEN 'HHMM-HHMM' THEN
            v_pattern := '^([0-1][0-9]|2[0-3])[0-5][0-9]-([0-1][0-9]|2[0-3])[0-5][0-9]$';
    END CASE;

    RETURN p_period_id ~ v_pattern;
END;
$$;

-- Function to normalize period format
CREATE OR REPLACE FUNCTION public.normalize_period_format(
    p_period_id TEXT,
    p_source_format period_format DEFAULT 'HH:MM-HH:MM',
    p_target_format period_format DEFAULT 'HH:MM-HH:MM'
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_start_time TEXT;
    v_end_time TEXT;
    v_normalized TEXT;
BEGIN
    -- Validate input format
    IF NOT public.validate_period_format(p_period_id, p_source_format) THEN
        RAISE EXCEPTION 'Invalid period format: %', p_period_id;
    END IF;

    -- Extract times based on source format
    CASE p_source_format
        WHEN 'HH:MM-HH:MM' THEN
            v_start_time := split_part(p_period_id, '-', 1);
            v_end_time := split_part(p_period_id, '-', 2);
        WHEN 'HH:MM:SS-HH:MM:SS' THEN
            v_start_time := substring(split_part(p_period_id, '-', 1) from 1 for 5);
            v_end_time := substring(split_part(p_period_id, '-', 2) from 1 for 5);
        WHEN 'HHMM-HHMM' THEN
            v_start_time := substring(split_part(p_period_id, '-', 1) from 1 for 2) || ':' || 
                           substring(split_part(p_period_id, '-', 1) from 3 for 2);
            v_end_time := substring(split_part(p_period_id, '-', 2) from 1 for 2) || ':' || 
                         substring(split_part(p_period_id, '-', 2) from 3 for 2);
    END CASE;

    -- Format output based on target format
    CASE p_target_format
        WHEN 'HH:MM-HH:MM' THEN
            v_normalized := v_start_time || '-' || v_end_time;
        WHEN 'HH:MM:SS-HH:MM:SS' THEN
            v_normalized := v_start_time || ':00-' || v_end_time || ':00';
        WHEN 'HHMM-HHMM' THEN
            v_normalized := replace(v_start_time, ':', '') || '-' || replace(v_end_time, ':', '');
    END CASE;

    RETURN v_normalized;
END;
$$;

-- Function to check if period crosses midnight
CREATE OR REPLACE FUNCTION public.period_crosses_midnight(
    p_start_time TEXT,
    p_end_time TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN (
        to_timestamp(p_end_time, 'HH24:MI')::time < 
        to_timestamp(p_start_time, 'HH24:MI')::time
    );
END;
$$;

-- Add monitoring table for period format issues
CREATE TABLE IF NOT EXISTS public.period_format_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_id TEXT NOT NULL,
    source_format period_format NOT NULL,
    error_message TEXT NOT NULL,
    component TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution TEXT
);

-- Create indexes
CREATE INDEX idx_period_format_issues_component ON public.period_format_issues(component);
CREATE INDEX idx_period_format_issues_created ON public.period_format_issues(created_at);

-- Add RLS policies
ALTER TABLE public.period_format_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view period format issues"
ON public.period_format_issues
FOR SELECT
TO authenticated
USING (true);

-- Grant permissions
GRANT SELECT ON public.period_format_issues TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_period_format TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_period_format TO authenticated;
GRANT EXECUTE ON FUNCTION public.period_crosses_midnight TO authenticated;

COMMIT; 