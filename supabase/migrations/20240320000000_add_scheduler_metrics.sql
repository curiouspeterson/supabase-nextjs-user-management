-- Create scheduler metrics table
CREATE TABLE IF NOT EXISTS public.scheduler_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coverage_deficit INTEGER NOT NULL DEFAULT 0,
  overtime_violations INTEGER NOT NULL DEFAULT 0,
  pattern_errors INTEGER NOT NULL DEFAULT 0,
  schedule_generation_time INTEGER NOT NULL DEFAULT 0,
  last_run_status TEXT NOT NULL CHECK (last_run_status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add index for quick access to recent metrics
CREATE INDEX IF NOT EXISTS idx_scheduler_metrics_created_at 
ON public.scheduler_metrics (created_at DESC);

-- Function to get pattern violations
CREATE OR REPLACE FUNCTION public.get_pattern_violations(start_date DATE)
RETURNS TABLE (
  employee_id UUID,
  violation_type TEXT,
  violation_date DATE,
  details TEXT
) AS $$
BEGIN
  -- Check for consecutive days violations
  RETURN QUERY
  WITH consecutive_days AS (
    SELECT 
      s.employee_id,
      s.date,
      COUNT(*) OVER (
        PARTITION BY s.employee_id, 
        DATE_TRUNC('week', s.date::timestamp)
      ) as days_worked
    FROM public.schedules s
    WHERE s.date >= start_date
    GROUP BY s.employee_id, s.date
  )
  SELECT 
    cd.employee_id,
    'consecutive_days'::TEXT as violation_type,
    cd.date as violation_date,
    'Exceeded maximum consecutive days'::TEXT as details
  FROM consecutive_days cd
  WHERE cd.days_worked > 6

  UNION ALL

  -- Check for forbidden shift patterns
  SELECT 
    s1.employee_id,
    'shift_pattern'::TEXT as violation_type,
    s1.date as violation_date,
    'Invalid shift pattern detected'::TEXT as details
  FROM public.schedules s1
  JOIN public.schedules s2 ON 
    s1.employee_id = s2.employee_id AND
    s2.date = s1.date + INTERVAL '1 day'
  JOIN public.shifts sh1 ON s1.shift_id = sh1.id
  JOIN public.shifts sh2 ON s2.shift_id = sh2.id
  WHERE 
    s1.date >= start_date AND
    (
      -- Night shift followed by morning shift
      (sh1.end_time > sh1.start_time AND sh2.start_time < '12:00:00'::TIME) OR
      -- Less than 8 hours between shifts
      (sh2.start_time - sh1.end_time < INTERVAL '8 hours')
    );

  RETURN;
END;
$$ LANGUAGE plpgsql; 