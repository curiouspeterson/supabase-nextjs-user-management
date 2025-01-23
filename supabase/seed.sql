-- Seed shift types
INSERT INTO public.shift_types (id, name, description) VALUES
  ('335afe36-804d-4722-88bf-4066798ffbfb', 'Early Day Shift', 'Early morning shift starting between 5AM and 7AM'),
  ('a0bb0dda-bc73-4126-ac66-5d331f0fac27', 'Day Shift', 'Standard day shift starting between 7AM and 11AM'),
  ('7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', 'Swing Shift', 'Swing shift starting between 1PM and 3PM'),
  ('ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', 'Graveyard', 'Night shift starting between 9PM and 11PM');

-- Create shifts for each shift type
INSERT INTO public.shifts (id, shift_type_id, start_time, end_time, duration_hours, duration_category) VALUES
  -- Early Day Shift variations
  (gen_random_uuid(), '335afe36-804d-4722-88bf-4066798ffbfb', '05:00', '09:00', 4, '4 hours'),
  (gen_random_uuid(), '335afe36-804d-4722-88bf-4066798ffbfb', '05:00', '15:00', 10, '10 hours'),
  (gen_random_uuid(), '335afe36-804d-4722-88bf-4066798ffbfb', '05:00', '17:00', 12, '12 hours'),

  -- Day Shift variations
  (gen_random_uuid(), 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '09:00', '13:00', 4, '4 hours'),
  (gen_random_uuid(), 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '09:00', '19:00', 10, '10 hours'),
  (gen_random_uuid(), 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '09:00', '21:00', 12, '12 hours'),

  -- Swing Shift variations
  (gen_random_uuid(), '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '13:00', '17:00', 4, '4 hours'),
  (gen_random_uuid(), '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '15:00', '01:00', 10, '10 hours'),
  (gen_random_uuid(), '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '15:00', '03:00', 12, '12 hours'),

  -- Graveyard variations
  (gen_random_uuid(), 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '01:00', '05:00', 4, '4 hours'),
  (gen_random_uuid(), 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '19:00', '05:00', 10, '10 hours'),
  (gen_random_uuid(), 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '17:00', '05:00', 12, '12 hours');

-- Create test users with various roles
DO $$
DECLARE
  i INTEGER;
  user_id UUID;
  role_type employee_role_enum;
  user_role_type user_role_enum;
  shift_type_id UUID;
  names TEXT[] := ARRAY[
    'John Smith', 'Jane Doe', 'Bob Wilson', 'Alice Brown', 'Charlie Davis',
    'Diana Evans', 'Edward Fox', 'Fiona Gray', 'George Harris', 'Helen Irving',
    'Ian Jackson', 'Julia King', 'Kevin Lee', 'Laura Miller', 'Mike Nelson',
    'Nancy Owen', 'Oscar Parker', 'Patricia Quinn', 'Robert Ross', 'Sarah Scott',
    'Tom Taylor', 'Uma Vincent', 'Victor White', 'Wendy Xavier', 'Xavier Young',
    'Yvonne Zhang', 'Zack Adams', 'Amy Baker', 'Brian Clark', 'Carol Dean',
    'David Ellis', 'Emma Fisher', 'Frank Green', 'Grace Hall', 'Henry Jones',
    'Iris Klein', 'Jack Lewis', 'Kate Moore', 'Luke Nash', 'Mary Oliver',
    'Nick Peters', 'Olivia Quinn', 'Paul Rogers', 'Quinn Smith', 'Ruth Thomas',
    'Steve Urban', 'Tina Wells', 'Uri Xavier', 'Val Young', 'Will Zane'
  ];
BEGIN
  -- Create 50 test users
  FOR i IN 1..50 LOOP
    -- Generate UUID for the user
    user_id := gen_random_uuid();
    
    -- Determine role types based on position
    CASE 
      WHEN i <= 5 THEN 
        role_type := 'Management';
        user_role_type := 'Admin';
      WHEN i <= 15 THEN 
        role_type := 'Shift Supervisor';
        user_role_type := 'Manager';
      ELSE 
        role_type := 'Dispatcher';
        user_role_type := 'Employee';
    END CASE;

    -- Assign a random shift type
    shift_type_id := (
      SELECT id FROM public.shift_types 
      OFFSET floor(random() * 4) 
      LIMIT 1
    );

    -- Create auth.users entry - the trigger handle_new_user will create profile and employee records
    BEGIN
      INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
      VALUES (
        user_id,
        lower(replace(names[i], ' ', '.') || '.' || i || '@dispatch911.test'),
        now(),
        jsonb_build_object(
          'full_name', names[i],
          'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || replace(names[i], ' ', ''),
          'employee_role', role_type,
          'user_role', user_role_type,
          'weekly_hours_scheduled', CASE WHEN role_type = 'Dispatcher' THEN 40 ELSE 45 END,
          'default_shift_type_id', shift_type_id
        )
      );
    EXCEPTION
      WHEN unique_violation THEN
        -- Skip duplicate emails
        CONTINUE;
    END;
  END LOOP;
END $$; 