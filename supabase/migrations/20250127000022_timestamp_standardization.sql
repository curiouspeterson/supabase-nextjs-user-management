-- Timestamp Standardization and Validation Migration
BEGIN;

-- Add new timestamp columns
ALTER TABLE public.time_off_requests
ADD COLUMN IF NOT EXISTS period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS period_end TIMESTAMPTZ;

ALTER TABLE public.schedules
ADD COLUMN IF NOT EXISTS period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shift_start TIME,
ADD COLUMN IF NOT EXISTS shift_end TIME;

-- Function to check if column exists
CREATE OR REPLACE FUNCTION column_exists(
    p_table text,
    p_column text
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = p_table
        AND column_name = p_column
    );
END;
$$;

-- Migrate existing data if old columns exist
DO $$
BEGIN
    -- Migrate time_off_requests data
    IF column_exists('time_off_requests', 'start_date') THEN
        EXECUTE '
            UPDATE public.time_off_requests
            SET period_start = start_date,
                period_end = end_date
            WHERE period_start IS NULL
        ';
    END IF;

    -- Migrate schedules data
    IF column_exists('schedules', 'start_date') THEN
        EXECUTE '
            UPDATE public.schedules
            SET period_start = start_date,
                period_end = end_date,
                shift_start = start_time,
                shift_end = end_time
            WHERE period_start IS NULL
        ';
    END IF;
END;
$$;

-- Make new columns required
ALTER TABLE public.time_off_requests
ALTER COLUMN period_start SET NOT NULL,
ALTER COLUMN period_end SET NOT NULL;

ALTER TABLE public.schedules
ALTER COLUMN period_start SET NOT NULL,
ALTER COLUMN period_end SET NOT NULL,
ALTER COLUMN shift_start SET NOT NULL,
ALTER COLUMN shift_end SET NOT NULL;

-- Drop old columns if they exist
DO $$
BEGIN
    -- Drop time_off_requests columns
    IF column_exists('time_off_requests', 'start_date') THEN
        ALTER TABLE public.time_off_requests
        DROP COLUMN start_date,
        DROP COLUMN end_date;
    END IF;

    -- Drop schedules columns
    IF column_exists('schedules', 'start_date') THEN
        ALTER TABLE public.schedules
        DROP COLUMN start_date,
        DROP COLUMN end_date,
        DROP COLUMN start_time,
        DROP COLUMN end_time;
    END IF;
END;
$$;

-- Function to validate date ranges
CREATE OR REPLACE FUNCTION public.validate_date_range(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_allow_null_end BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Handle null end date
    IF p_end_date IS NULL THEN
        RETURN p_allow_null_end;
    END IF;

    -- Validate range
    RETURN p_start_date <= p_end_date;
END;
$$;

-- Function to validate business hours
CREATE OR REPLACE FUNCTION public.validate_business_hours(
    p_start_time TIME,
    p_end_time TIME,
    p_timezone TEXT DEFAULT 'UTC'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Convert times to UTC for comparison
    RETURN p_start_time < p_end_time;
END;
$$;

-- Function to validate schedule overlap
CREATE OR REPLACE FUNCTION public.validate_schedule_overlap(
    p_employee_id UUID,
    p_period_start TIMESTAMPTZ,
    p_period_end TIMESTAMPTZ,
    p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1
        FROM public.schedules
        WHERE employee_id = p_employee_id
        AND id != COALESCE(p_exclude_id, id)
        AND tstzrange(period_start, period_end) && tstzrange(p_period_start, p_period_end)
    );
END;
$$;

-- Add check constraints for date ranges
ALTER TABLE public.time_off_requests
ADD CONSTRAINT valid_time_off_dates
CHECK (validate_date_range(period_start, period_end, false));

ALTER TABLE public.schedules
ADD CONSTRAINT valid_schedule_dates
CHECK (validate_date_range(period_start, period_end, false));

-- Add check constraints for business hours
ALTER TABLE public.schedules
ADD CONSTRAINT valid_business_hours
CHECK (validate_business_hours(shift_start, shift_end));

-- Add trigger for schedule overlap validation
CREATE OR REPLACE FUNCTION public.prevent_schedule_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT validate_schedule_overlap(
        NEW.employee_id,
        NEW.period_start,
        NEW.period_end,
        NEW.id
    ) THEN
        RAISE EXCEPTION 'Schedule overlaps with existing schedule'
        USING HINT = 'Please choose different dates';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER validate_schedule_overlap
BEFORE INSERT OR UPDATE ON public.schedules
FOR EACH ROW
EXECUTE FUNCTION public.prevent_schedule_overlap();

-- Function to standardize timezone
CREATE OR REPLACE FUNCTION public.standardize_timezone(
    p_timestamp TIMESTAMPTZ,
    p_source_zone TEXT DEFAULT NULL
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- If source zone is provided, convert to UTC first
    IF p_source_zone IS NOT NULL THEN
        RETURN p_timestamp AT TIME ZONE p_source_zone AT TIME ZONE 'UTC';
    END IF;

    -- Otherwise, ensure UTC
    RETURN p_timestamp AT TIME ZONE 'UTC';
END;
$$;

-- Add trigger to standardize timezones on insert/update
CREATE OR REPLACE FUNCTION public.standardize_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Standardize timestamps to UTC
    IF TG_OP = 'INSERT' OR NEW.period_start IS DISTINCT FROM OLD.period_start THEN
        NEW.period_start = public.standardize_timezone(NEW.period_start);
    END IF;

    IF TG_OP = 'INSERT' OR NEW.period_end IS DISTINCT FROM OLD.period_end THEN
        NEW.period_end = public.standardize_timezone(NEW.period_end);
    END IF;

    RETURN NEW;
END;
$$;

-- Add standardization triggers
CREATE TRIGGER standardize_time_off_timestamps
BEFORE INSERT OR UPDATE ON public.time_off_requests
FOR EACH ROW
EXECUTE FUNCTION public.standardize_timestamps();

CREATE TRIGGER standardize_schedule_timestamps
BEFORE INSERT OR UPDATE ON public.schedules
FOR EACH ROW
EXECUTE FUNCTION public.standardize_timestamps();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.validate_date_range TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_business_hours TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_schedule_overlap TO authenticated;
GRANT EXECUTE ON FUNCTION public.standardize_timezone TO authenticated;
GRANT EXECUTE ON FUNCTION public.column_exists TO authenticated;

COMMIT; 