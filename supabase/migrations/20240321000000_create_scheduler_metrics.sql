-- Add missing fields to daily_coverage table
ALTER TABLE daily_coverage
ADD COLUMN required_coverage INTEGER NOT NULL DEFAULT 0,
ADD COLUMN supervisor_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN overtime_hours INTEGER NOT NULL DEFAULT 0;

-- Create scheduler_metrics table
CREATE TABLE scheduler_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coverage_deficit INTEGER NOT NULL DEFAULT 0,
  overtime_violations INTEGER NOT NULL DEFAULT 0,
  pattern_errors INTEGER NOT NULL DEFAULT 0,
  schedule_generation_time INTEGER NOT NULL DEFAULT 0,
  last_run_status TEXT NOT NULL CHECK (last_run_status IN ('success', 'warning', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
); 