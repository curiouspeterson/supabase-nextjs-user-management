-- Timezone Enhancements Migration
BEGIN;

-- Function to validate timezone string
CREATE OR REPLACE FUNCTION public.is_valid_timezone(p_timezone TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM pg_timezone_names
        WHERE name = p_timezone
    );
END;
$$;

-- Function to convert time between timezones
CREATE OR REPLACE FUNCTION public.convert_time_between_zones(
    p_time TIME,
    p_source_timezone TEXT,
    p_target_timezone TEXT
)
RETURNS TIME
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_timestamp TIMESTAMP;
    v_converted TIME;
BEGIN
    -- Validate timezones
    IF NOT public.is_valid_timezone(p_source_timezone) THEN
        RAISE EXCEPTION 'Invalid source timezone: %', p_source_timezone;
    END IF;
    
    IF NOT public.is_valid_timezone(p_target_timezone) THEN
        RAISE EXCEPTION 'Invalid target timezone: %', p_target_timezone;
    END IF;

    -- Use current date for the conversion
    v_timestamp := (CURRENT_DATE || ' ' || p_time)::TIMESTAMP;
    
    -- Convert between timezones
    v_converted := (v_timestamp AT TIME ZONE p_source_timezone AT TIME ZONE p_target_timezone)::TIME;
    
    RETURN v_converted;
END;
$$;

-- Function to get week number in a specific timezone
CREATE OR REPLACE FUNCTION public.get_week_number(
    p_date DATE,
    p_timezone TEXT DEFAULT 'UTC'
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_timestamp TIMESTAMP;
    v_iso_week INTEGER;
BEGIN
    -- Validate timezone
    IF NOT public.is_valid_timezone(p_timezone) THEN
        RAISE EXCEPTION 'Invalid timezone: %', p_timezone;
    END IF;

    -- Convert to timestamp in the specified timezone
    v_timestamp := p_date::TIMESTAMP AT TIME ZONE p_timezone;
    
    -- Extract ISO week number
    v_iso_week := EXTRACT(WEEK FROM v_timestamp);
    
    RETURN v_iso_week;
END;
$$;

-- Add timezone column to schedules if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'schedules' 
        AND column_name = 'timezone'
    ) THEN
        ALTER TABLE public.schedules 
        ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC';
    END IF;
END $$;

-- Add timezone validation to schedules
ALTER TABLE public.schedules
    DROP CONSTRAINT IF EXISTS valid_timezone,
    ADD CONSTRAINT valid_timezone 
    CHECK (public.is_valid_timezone(timezone));

-- Add timezone column to scheduler_config if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'scheduler_config' 
        AND column_name = 'timezone'
    ) THEN
        ALTER TABLE public.scheduler_config 
        ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC',
        ADD CONSTRAINT scheduler_config_valid_timezone 
        CHECK (public.is_valid_timezone(timezone));
    END IF;
END $$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_valid_timezone(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_time_between_zones(TIME, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_week_number(DATE, TEXT) TO authenticated;

COMMIT; 