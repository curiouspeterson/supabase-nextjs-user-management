-- Create staffing requirements table
CREATE TABLE IF NOT EXISTS staffing_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  minimum_employees INT4 NOT NULL,
  shift_supervisor_req BOOL NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add staffing requirements for each period
INSERT INTO staffing_requirements (period_name, start_time, end_time, minimum_employees, shift_supervisor_required)
VALUES
  ('Early Morning', '05:00', '09:00', 6, true),
  ('Day', '09:00', '21:00', 8, true),
  ('Evening', '21:00', '01:00', 7, true),
  ('Late Night', '01:00', '05:00', 6, true);

-- Add index for common queries
CREATE INDEX idx_staffing_requirements_period_name ON staffing_requirements(period_name); 