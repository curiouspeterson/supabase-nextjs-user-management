-- Create scheduler metrics table
CREATE TABLE IF NOT EXISTS public.scheduler_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generation_time NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for quick access to recent metrics
CREATE INDEX IF NOT EXISTS idx_scheduler_metrics_created_at 
ON public.scheduler_metrics(created_at DESC);

-- Add function to get pattern violations
CREATE OR REPLACE FUNCTION public.get_pattern_violations(start_date DATE)
RETURNS TABLE (
    employee_id UUID,
    pattern_type TEXT,
    violation_type TEXT,
    violation_date DATE
) AS $$
DECLARE
    v_pattern RECORD;
    v_consecutive_days INTEGER;
    v_last_shift_duration INTEGER;
BEGIN
    -- Get all active patterns
    FOR v_pattern IN
        SELECT DISTINCT ep.employee_id, ep.pattern_id, sp.pattern_type
        FROM employee_patterns ep
        JOIN shift_patterns sp ON ep.pattern_id = sp.id
        WHERE ep.start_date <= start_date
        AND (ep.end_date IS NULL OR ep.end_date >= start_date)
    LOOP
        -- Check consecutive days
        WITH consecutive_shifts AS (
            SELECT s.date,
                   sh.duration_hours,
                   COUNT(*) OVER (PARTITION BY s.employee_id ORDER BY s.date) as consecutive_count
            FROM schedules s
            JOIN shifts sh ON s.shift_id = sh.id
            WHERE s.employee_id = v_pattern.employee_id
            AND s.date BETWEEN start_date - INTERVAL '7 days' AND start_date
            ORDER BY s.date DESC
        )
        SELECT COUNT(*), MAX(duration_hours)
        INTO v_consecutive_days, v_last_shift_duration
        FROM consecutive_shifts;

        -- Check pattern violations
        CASE v_pattern.pattern_type
            WHEN '4x10' THEN
                IF v_consecutive_days > 4 THEN
                    RETURN QUERY
                    SELECT v_pattern.employee_id,
                           v_pattern.pattern_type::TEXT,
                           'Exceeded consecutive days'::TEXT,
                           start_date;
                END IF;

            WHEN '3x12_1x4' THEN
                IF v_consecutive_days > 3 AND v_last_shift_duration = 12 THEN
                    RETURN QUERY
                    SELECT v_pattern.employee_id,
                           v_pattern.pattern_type::TEXT,
                           'Exceeded consecutive 12-hour shifts'::TEXT,
                           start_date;
                END IF;

                -- Check 4-hour shift proximity
                WITH shift_sequence AS (
                    SELECT s.date,
                           sh.duration_hours,
                           LAG(sh.duration_hours) OVER (ORDER BY s.date) as prev_duration,
                           LAG(s.date) OVER (ORDER BY s.date) as prev_date
                    FROM schedules s
                    JOIN shifts sh ON s.shift_id = sh.id
                    WHERE s.employee_id = v_pattern.employee_id
                    AND s.date BETWEEN start_date - INTERVAL '7 days' AND start_date
                    ORDER BY s.date
                )
                SELECT 1
                FROM shift_sequence
                WHERE duration_hours = 4
                AND (
                    prev_duration != 12
                    OR prev_date IS NULL
                    OR date - prev_date > INTERVAL '2 days'
                )
                LIMIT 1;

                IF FOUND THEN
                    RETURN QUERY
                    SELECT v_pattern.employee_id,
                           v_pattern.pattern_type::TEXT,
                           '4-hour shift not properly sequenced'::TEXT,
                           start_date;
                END IF;
        END CASE;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 