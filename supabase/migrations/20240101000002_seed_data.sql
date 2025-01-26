-- Insert shift types
INSERT INTO public.shift_types (id, name, description)
VALUES
    ('a0bb0dda-bc73-4126-ac66-5d331f0fac27', 'Day Shift Early', 'Early morning shift starting at 5 AM'),
    ('b1cc1eeb-cd84-5237-bd77-6e442f1fbd38', 'Day Shift', 'Standard day shift starting at 9 AM'),
    ('c2dd2ffc-de95-6348-ce88-7f553f2fce49', 'Swing Shift', 'Afternoon to evening shift'),
    ('d3ee3ffd-ef06-7459-df99-8f664f3fdf50', 'Night Shift', 'Overnight shift');

-- Insert shifts
INSERT INTO public.shifts (shift_type_id, start_time, end_time, duration_hours)
VALUES
    -- Day Shift Early variants
    ('a0bb0dda-bc73-4126-ac66-5d331f0fac27', '05:00', '09:00', 4),  -- 4hr
    ('a0bb0dda-bc73-4126-ac66-5d331f0fac27', '05:00', '15:00', 10), -- 10hr
    ('a0bb0dda-bc73-4126-ac66-5d331f0fac27', '05:00', '17:00', 12), -- 12hr
    -- Day Shift variants
    ('b1cc1eeb-cd84-5237-bd77-6e442f1fbd38', '09:00', '13:00', 4),  -- 4hr
    ('b1cc1eeb-cd84-5237-bd77-6e442f1fbd38', '09:00', '19:00', 10), -- 10hr
    ('b1cc1eeb-cd84-5237-bd77-6e442f1fbd38', '09:00', '21:00', 12), -- 12hr
    -- Swing Shift variants
    ('c2dd2ffc-de95-6348-ce88-7f553f2fce49', '13:00', '17:00', 4),  -- 4hr
    ('c2dd2ffc-de95-6348-ce88-7f553f2fce49', '13:00', '23:00', 10), -- 10hr
    ('c2dd2ffc-de95-6348-ce88-7f553f2fce49', '13:00', '01:00', 12), -- 12hr
    -- Night Shift variants
    ('d3ee3ffd-ef06-7459-df99-8f664f3fdf50', '21:00', '01:00', 4),  -- 4hr
    ('d3ee3ffd-ef06-7459-df99-8f664f3fdf50', '21:00', '07:00', 10), -- 10hr
    ('d3ee3ffd-ef06-7459-df99-8f664f3fdf50', '21:00', '09:00', 12); -- 12hr

-- Insert staffing requirements
INSERT INTO public.staffing_requirements (
    period_name,
    start_time,
    end_time,
    minimum_employees,
    shift_supervisor_required
) VALUES
    ('Morning', '05:00', '09:00', 6, true),    -- 5 employees + 1 supervisor
    ('Daytime', '09:00', '21:00', 8, true),    -- 7 employees + 1 supervisor
    ('Evening', '21:00', '01:00', 7, true),    -- 6 employees + 1 supervisor
    ('Night', '01:00', '05:00', 6, true);      -- 5 employees + 1 supervisor

-- Insert shift patterns
INSERT INTO public.shift_patterns (name, pattern_type, days_on, days_off, shift_duration)
VALUES
    ('4x10 Standard', '4x10', 4, 3, 10),
    ('3x12 + 1x4', '3x12_1x4', 4, 3, 12),
    ('Custom Pattern', 'Custom', 4, 3, 10);

-- Insert test users (50 total: 5 managers, 10 supervisors, 35 dispatchers)
DO $$
DECLARE
    v_user RECORD;
    v_pattern_4x10 uuid;
    v_pattern_3x12 uuid;
BEGIN
    -- Get pattern IDs
    SELECT id INTO v_pattern_4x10 FROM public.shift_patterns WHERE name = '4x10 Standard';
    SELECT id INTO v_pattern_3x12 FROM public.shift_patterns WHERE name = '3x12 + 1x4';

    -- Insert managers (5)
    FOR i IN 1..5 LOOP
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            is_super_admin,
            is_sso_user,
            deleted_at,
            is_anonymous
        ) VALUES (
            '00000000-0000-0000-0000-000000000000'::uuid,
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'manager' || i || '@example.com',
            crypt('password123', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            jsonb_build_object(
                'full_name', 'Manager ' || i,
                'employee_role', 'Management',
                'user_role', 'Manager',
                'email_verified', true
            ),
            now(),
            now(),
            false,
            false,
            null,
            false
        ) RETURNING id, raw_user_meta_data->>'full_name' AS full_name INTO v_user;

        -- Insert corresponding profile
        INSERT INTO public.profiles (id, full_name, username)
        VALUES (v_user.id, v_user.full_name, lower(replace(v_user.full_name, ' ', '.')));

        -- Insert corresponding employee
        INSERT INTO public.employees (id, employee_role, user_role, weekly_hours_scheduled)
        VALUES (v_user.id, 'Management', 'Manager', 40);
    END LOOP;

    -- Insert supervisors (10)
    FOR i IN 1..10 LOOP
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            is_super_admin,
            is_sso_user,
            deleted_at,
            is_anonymous
        ) VALUES (
            '00000000-0000-0000-0000-000000000000'::uuid,
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'supervisor' || i || '@example.com',
            crypt('password123', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            jsonb_build_object(
                'full_name', 'Supervisor ' || i,
                'employee_role', 'Shift Supervisor',
                'user_role', 'Employee',
                'email_verified', true
            ),
            now(),
            now(),
            false,
            false,
            null,
            false
        ) RETURNING id, raw_user_meta_data->>'full_name' AS full_name INTO v_user;

        -- Insert corresponding profile
        INSERT INTO public.profiles (id, full_name, username)
        VALUES (v_user.id, v_user.full_name, lower(replace(v_user.full_name, ' ', '.')));

        -- Insert corresponding employee
        INSERT INTO public.employees (id, employee_role, user_role, weekly_hours_scheduled)
        VALUES (v_user.id, 'Shift Supervisor', 'Employee', 40);

        -- Assign pattern (alternating between 4x10 and 3x12)
        IF i % 2 = 0 THEN
            INSERT INTO public.employee_patterns (employee_id, pattern_id, start_date, rotation_start_date)
            VALUES (v_user.id, v_pattern_4x10, '2024-01-01', '2024-01-01');
        ELSE
            INSERT INTO public.employee_patterns (employee_id, pattern_id, start_date, rotation_start_date)
            VALUES (v_user.id, v_pattern_3x12, '2024-01-01', '2024-01-01');
        END IF;
    END LOOP;

    -- Insert dispatchers (35)
    FOR i IN 1..35 LOOP
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            is_super_admin,
            is_sso_user,
            deleted_at,
            is_anonymous
        ) VALUES (
            '00000000-0000-0000-0000-000000000000'::uuid,
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'dispatcher' || i || '@example.com',
            crypt('password123', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            jsonb_build_object(
                'full_name', 'Dispatcher ' || i,
                'employee_role', 'Dispatcher',
                'user_role', 'Employee',
                'email_verified', true
            ),
            now(),
            now(),
            false,
            false,
            null,
            false
        ) RETURNING id, raw_user_meta_data->>'full_name' AS full_name INTO v_user;

        -- Insert corresponding profile
        INSERT INTO public.profiles (id, full_name, username)
        VALUES (v_user.id, v_user.full_name, lower(replace(v_user.full_name, ' ', '.')));

        -- Insert corresponding employee
        INSERT INTO public.employees (id, employee_role, user_role, weekly_hours_scheduled)
        VALUES (v_user.id, 'Dispatcher', 'Employee', 40);

        -- Assign pattern (alternating between 4x10 and 3x12)
        IF i % 2 = 0 THEN
            INSERT INTO public.employee_patterns (employee_id, pattern_id, start_date, rotation_start_date)
            VALUES (v_user.id, v_pattern_4x10, '2024-01-01', '2024-01-01');
        ELSE
            INSERT INTO public.employee_patterns (employee_id, pattern_id, start_date, rotation_start_date)
            VALUES (v_user.id, v_pattern_3x12, '2024-01-01', '2024-01-01');
        END IF;
    END LOOP;
END $$; 