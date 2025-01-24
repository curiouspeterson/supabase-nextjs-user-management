-- First, clear any schedules that reference shifts
DELETE FROM schedules;

-- Set all employees' default_shift_type_id to NULL
UPDATE employees SET default_shift_type_id = NULL;

-- Delete existing shifts
DELETE FROM shifts;

-- Now we can safely delete shift types
DELETE FROM shift_types;

-- Insert the correct shift types
INSERT INTO shift_types (name, description) VALUES
('Day Shift Early', 'Early morning shift starting between 5AM and 7AM'),
('Day Shift', 'Standard day shift starting between 7AM and 11AM'),
('Swing Shift', 'Swing shift starting between 1PM and 3PM'),
('Graveyard', 'Night shift starting between 9PM and 11PM');

-- Insert shifts for each type
-- Day Shift Early
INSERT INTO shifts (shift_type_id, start_time, end_time, duration_hours)
SELECT 
  id,
  '05:00:00'::time,
  '09:00:00'::time,
  4
FROM shift_types WHERE name = 'Day Shift Early'
UNION ALL
SELECT 
  id,
  '05:00:00'::time,
  '15:00:00'::time,
  10
FROM shift_types WHERE name = 'Day Shift Early'
UNION ALL
SELECT 
  id,
  '05:00:00'::time,
  '17:00:00'::time,
  12
FROM shift_types WHERE name = 'Day Shift Early';

-- Day Shift
INSERT INTO shifts (shift_type_id, start_time, end_time, duration_hours)
SELECT 
  id,
  '09:00:00'::time,
  '13:00:00'::time,
  4
FROM shift_types WHERE name = 'Day Shift'
UNION ALL
SELECT 
  id,
  '09:00:00'::time,
  '19:00:00'::time,
  10
FROM shift_types WHERE name = 'Day Shift'
UNION ALL
SELECT 
  id,
  '09:00:00'::time,
  '21:00:00'::time,
  12
FROM shift_types WHERE name = 'Day Shift';

-- Swing Shift
INSERT INTO shifts (shift_type_id, start_time, end_time, duration_hours)
SELECT 
  id,
  '13:00:00'::time,
  '17:00:00'::time,
  4
FROM shift_types WHERE name = 'Swing Shift'
UNION ALL
SELECT 
  id,
  '15:00:00'::time,
  '01:00:00'::time,
  10
FROM shift_types WHERE name = 'Swing Shift'
UNION ALL
SELECT 
  id,
  '15:00:00'::time,
  '03:00:00'::time,
  12
FROM shift_types WHERE name = 'Swing Shift';

-- Graveyard Shift
INSERT INTO shifts (shift_type_id, start_time, end_time, duration_hours)
SELECT 
  id,
  '01:00:00'::time,
  '05:00:00'::time,
  4
FROM shift_types WHERE name = 'Graveyard'
UNION ALL
SELECT 
  id,
  '19:00:00'::time,
  '05:00:00'::time,
  10
FROM shift_types WHERE name = 'Graveyard'
UNION ALL
SELECT 
  id,
  '17:00:00'::time,
  '05:00:00'::time,
  12
FROM shift_types WHERE name = 'Graveyard';

-- Update employees to use the new Day Shift as default if they don't have one set
UPDATE employees 
SET default_shift_type_id = (
  SELECT id FROM shift_types WHERE name = 'Day Shift' LIMIT 1
)
WHERE default_shift_type_id IS NULL; 