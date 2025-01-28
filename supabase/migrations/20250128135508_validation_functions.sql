-- Add business hours validation function
CREATE OR REPLACE FUNCTION public.validate_business_hours(
    p_start_time time without time zone,
    p_end_time time without time zone,
    p_timezone text DEFAULT 'UTC'::text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    -- Convert times to UTC for comparison
    RETURN p_start_time < p_end_time;
END;
$$;

-- Add date range validation function
CREATE OR REPLACE FUNCTION public.validate_date_range(p_start timestamp with time zone, p_end timestamp with time zone, p_allow_null_end boolean DEFAULT false)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Handle null end date
    IF p_end IS NULL THEN
        RETURN p_allow_null_end;
    END IF;

    -- Validate range
    RETURN p_start <= p_end;
END;
$$;

-- Add split_midnight_shift function
CREATE OR REPLACE FUNCTION public.split_midnight_shift(
    p_start_time timestamp with time zone,
    p_end_time timestamp with time zone,
    p_timezone text DEFAULT 'UTC'
)
RETURNS TABLE (
    segment_date date,
    hours numeric
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_start_date date;
    v_end_date date;
    v_midnight timestamp with time zone;
    v_first_segment_hours numeric;
    v_second_segment_hours numeric;
BEGIN
    -- Get dates in the specified timezone
    v_start_date := (p_start_time AT TIME ZONE p_timezone)::date;
    v_end_date := (p_end_time AT TIME ZONE p_timezone)::date;
    
    -- If start and end dates are the same, return single segment
    IF v_start_date = v_end_date THEN
        RETURN QUERY
        SELECT 
            v_start_date,
            EXTRACT(EPOCH FROM (p_end_time - p_start_time))/3600;
        RETURN;
    END IF;
    
    -- Calculate midnight timestamp for split
    v_midnight := (v_start_date + INTERVAL '1 day')::timestamp AT TIME ZONE p_timezone;
    
    -- Calculate hours for each segment
    v_first_segment_hours := EXTRACT(EPOCH FROM (v_midnight - p_start_time))/3600;
    v_second_segment_hours := EXTRACT(EPOCH FROM (p_end_time - v_midnight))/3600;
    
    -- Return both segments
    RETURN QUERY
    SELECT v_start_date, v_first_segment_hours
    UNION ALL
    SELECT v_end_date, v_second_segment_hours;
END;
$$;

-- Add timezone validation function
CREATE OR REPLACE FUNCTION public.is_valid_timezone(p_timezone text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN p_timezone IN (SELECT name FROM pg_timezone_names);
END;
$$;