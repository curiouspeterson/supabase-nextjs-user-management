-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE employee_role_enum AS ENUM ('Dispatcher', 'Shift Supervisor', 'Management');
    CREATE TYPE user_role_enum AS ENUM ('Employee', 'Manager', 'Admin');
    CREATE TYPE time_off_type_enum AS ENUM ('Vacation', 'Sick', 'Personal', 'Training');
    CREATE TYPE time_off_status_enum AS ENUM ('Pending', 'Approved', 'Declined');
    CREATE TYPE day_of_week_enum AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
    CREATE TYPE schedule_status_enum AS ENUM ('Draft', 'Published');
    CREATE TYPE duration_category_enum AS ENUM ('4 hours', '10 hours', '12 hours');
    CREATE TYPE shift_pattern_type_enum AS ENUM ('4x10', '3x12_1x4', 'Custom');
    CREATE TYPE coverage_status_enum AS ENUM ('Under', 'Met', 'Over');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Fix auth.users string columns to prevent NULL values
ALTER TABLE auth.users 
    ALTER COLUMN confirmation_token SET DEFAULT '',
    ALTER COLUMN email_change SET DEFAULT '',
    ALTER COLUMN recovery_token SET DEFAULT '',
    ALTER COLUMN email_change_token_new SET DEFAULT '';

UPDATE auth.users SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    email_change = COALESCE(email_change, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, '');

-- Create base tables
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" uuid NOT NULL,
    "updated_at" timestamptz DEFAULT now(),
    "username" text,
    "full_name" text,
    "avatar_url" text,
    "website" text,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profiles_username_key" UNIQUE ("username")
);

CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" uuid NOT NULL,
    "employee_role" employee_role_enum NOT NULL,
    "user_role" user_role_enum NOT NULL,
    "weekly_hours_scheduled" integer DEFAULT 0,
    "default_shift_type_id" uuid,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."shift_types" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "shift_types_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "shift_types_name_key" UNIQUE ("name")
);

CREATE TABLE IF NOT EXISTS "public"."shifts" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "shift_type_id" uuid NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "duration_hours" integer NOT NULL,
    "duration_category" duration_category_enum GENERATED ALWAYS AS (
      CASE 
        WHEN duration_hours = 4 THEN '4 hours'::duration_category_enum
        WHEN duration_hours = 10 THEN '10 hours'::duration_category_enum
        WHEN duration_hours = 12 THEN '12 hours'::duration_category_enum
        ELSE NULL
      END
    ) STORED,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "shifts_duration_check" CHECK (duration_hours IN (4, 10, 12))
);

CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "employee_id" uuid NOT NULL,
    "shift_id" uuid NOT NULL,
    "date" date NOT NULL,
    "status" schedule_status_enum DEFAULT 'Draft'::schedule_status_enum NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."time_off_requests" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "employee_id" uuid NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "type" time_off_type_enum NOT NULL,
    "status" time_off_status_enum DEFAULT 'Pending' NOT NULL,
    "notes" text,
    "reviewed_by" uuid,
    "reviewed_at" timestamptz,
    "submitted_at" timestamptz DEFAULT now() NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "time_off_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "time_off_requests_dates_check" CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS "public"."staffing_requirements" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "period_name" text NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "minimum_employees" integer NOT NULL,
    "shift_supervisor_required" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "staffing_requirements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "staffing_requirements_name_key" UNIQUE ("period_name"),
    CONSTRAINT "staffing_requirements_minimum_check" CHECK (minimum_employees > 0)
);

CREATE TABLE IF NOT EXISTS "public"."shift_patterns" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "pattern_type" shift_pattern_type_enum NOT NULL,
    "days_on" integer NOT NULL,
    "days_off" integer NOT NULL,
    "shift_duration" integer NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "shift_patterns_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "shift_patterns_name_key" UNIQUE ("name"),
    CONSTRAINT "shift_patterns_days_check" CHECK (days_on > 0 AND days_off > 0),
    CONSTRAINT "shift_patterns_duration_check" CHECK (shift_duration IN (4, 10, 12))
);

CREATE TABLE IF NOT EXISTS "public"."employee_patterns" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "employee_id" uuid NOT NULL,
    "pattern_id" uuid NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date,
    "rotation_start_date" date NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "employee_patterns_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employee_patterns_dates_check" CHECK (end_date IS NULL OR end_date > start_date),
    CONSTRAINT "employee_patterns_rotation_date_check" CHECK (rotation_start_date >= start_date)
);

CREATE TABLE IF NOT EXISTS "public"."daily_coverage" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "date" date NOT NULL,
    "period_id" uuid NOT NULL,
    "actual_coverage" integer NOT NULL DEFAULT 0,
    "coverage_status" coverage_status_enum NOT NULL DEFAULT 'Under',
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "daily_coverage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "daily_coverage_date_period_key" UNIQUE ("date", "period_id"),
    CONSTRAINT "daily_coverage_actual_check" CHECK (actual_coverage >= 0)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedules_date ON public.schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_employee_date ON public.schedules(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_employee ON public.time_off_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_dates ON public.time_off_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_employee_patterns_dates ON public.employee_patterns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_employee_patterns_employee ON public.employee_patterns(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_patterns_pattern ON public.employee_patterns(pattern_id);
CREATE INDEX IF NOT EXISTS idx_daily_coverage_date ON public.daily_coverage(date);
CREATE INDEX IF NOT EXISTS idx_daily_coverage_status ON public.daily_coverage(coverage_status);
CREATE INDEX IF NOT EXISTS idx_daily_coverage_period ON public.daily_coverage(period_id);

-- Add foreign key constraints
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_default_shift_type_id_fkey" FOREIGN KEY ("default_shift_type_id") REFERENCES "public"."shift_types"("id"),
    ADD CONSTRAINT "employees_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_profile" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_shift_type_id_fkey" FOREIGN KEY ("shift_type_id") REFERENCES "public"."shift_types"("id");

ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "schedules_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "auth"."users"("id"),
    ADD CONSTRAINT "time_off_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."employee_patterns"
    ADD CONSTRAINT "employee_patterns_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "employee_patterns_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "public"."shift_patterns"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."daily_coverage"
    ADD CONSTRAINT "daily_coverage_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."staffing_requirements"("id") ON DELETE CASCADE;

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_period_coverage(p_date date, p_period_id uuid)
RETURNS integer AS $$
DECLARE
    v_coverage integer;
BEGIN
    SELECT COUNT(DISTINCT s.employee_id)
    INTO v_coverage
    FROM public.schedules s
    JOIN public.shifts sh ON s.shift_id = sh.id
    JOIN public.staffing_requirements sr ON sr.id = p_period_id
    WHERE s.date = p_date
    AND (
        (sh.start_time BETWEEN sr.start_time AND sr.end_time)
        OR (sh.end_time BETWEEN sr.start_time AND sr.end_time)
        OR (sh.start_time <= sr.start_time AND sh.end_time >= sr.end_time)
    );
    
    RETURN COALESCE(v_coverage, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_coverage_status()
RETURNS trigger AS $$
BEGIN
    WITH coverage_calc AS (
        SELECT 
            sr.id as period_id,
            NEW.date as date,
            calculate_period_coverage(NEW.date, sr.id) as actual_coverage,
            CASE 
                WHEN calculate_period_coverage(NEW.date, sr.id) < sr.minimum_employees THEN 'Under'
                WHEN calculate_period_coverage(NEW.date, sr.id) = sr.minimum_employees THEN 'Met'
                ELSE 'Over'
            END as status
        FROM public.staffing_requirements sr
    )
    INSERT INTO public.daily_coverage (date, period_id, actual_coverage, coverage_status)
    SELECT 
        coverage_calc.date,
        coverage_calc.period_id,
        coverage_calc.actual_coverage,
        coverage_calc.status::coverage_status_enum
    FROM coverage_calc
    ON CONFLICT (date, period_id) 
    DO UPDATE SET
        actual_coverage = EXCLUDED.actual_coverage,
        coverage_status = EXCLUDED.coverage_status,
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_schedule_against_pattern(p_employee_id uuid, p_date date)
RETURNS boolean AS $$
DECLARE
    v_pattern RECORD;
    v_scheduled_days integer;
    v_scheduled_hours integer;
    v_twelve_hour_shifts integer;
    v_four_hour_shifts integer;
BEGIN
    SELECT sp.*
    INTO v_pattern
    FROM public.employee_patterns ep
    JOIN public.shift_patterns sp ON ep.pattern_id = sp.id
    WHERE ep.employee_id = p_employee_id
    AND p_date BETWEEN ep.start_date AND COALESCE(ep.end_date, p_date)
    ORDER BY ep.start_date DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN true;
    END IF;

    WITH weekly_shifts AS (
        SELECT DISTINCT s.date, sh.duration_hours
        FROM public.schedules s
        JOIN public.shifts sh ON s.shift_id = sh.id
        WHERE s.employee_id = p_employee_id
        AND s.date BETWEEN date_trunc('week', p_date) AND date_trunc('week', p_date) + interval '6 days'
    )
    SELECT 
        COUNT(DISTINCT date),
        COALESCE(SUM(duration_hours), 0),
        COUNT(*) FILTER (WHERE duration_hours = 12),
        COUNT(*) FILTER (WHERE duration_hours = 4)
    INTO 
        v_scheduled_days,
        v_scheduled_hours,
        v_twelve_hour_shifts,
        v_four_hour_shifts
    FROM weekly_shifts;

    IF v_pattern.pattern_type = '3x12_1x4' THEN
        RETURN (
            COALESCE(v_scheduled_days, 0) <= v_pattern.days_on
            AND COALESCE(v_twelve_hour_shifts, 0) <= 3
            AND COALESCE(v_four_hour_shifts, 0) <= 1
            AND COALESCE(v_scheduled_hours, 0) <= 40
        );
    END IF;

    RETURN (
        COALESCE(v_scheduled_days, 0) <= v_pattern.days_on
        AND COALESCE(v_scheduled_hours, 0) <= (v_pattern.days_on * v_pattern.shift_duration)
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_schedule()
RETURNS trigger AS $$
BEGIN
    IF NOT validate_schedule_against_pattern(NEW.employee_id, NEW.date) THEN
        RAISE EXCEPTION 'Schedule violates employee pattern constraints';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_overlapping_patterns()
RETURNS trigger AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.employee_patterns
        WHERE employee_id = NEW.employee_id
        AND id != NEW.id
        AND (
            (NEW.start_date BETWEEN start_date AND COALESCE(end_date, NEW.start_date))
            OR (COALESCE(NEW.end_date, start_date) BETWEEN start_date AND COALESCE(end_date, NEW.end_date))
            OR (start_date BETWEEN NEW.start_date AND COALESCE(NEW.end_date, start_date))
        )
    ) THEN
        RAISE EXCEPTION 'Employee already has a pattern assigned during this period';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shift_types_updated_at
    BEFORE UPDATE ON public.shift_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shifts_updated_at
    BEFORE UPDATE ON public.shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON public.time_off_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_staffing_requirements_updated_at
    BEFORE UPDATE ON public.staffing_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shift_patterns_updated_at
    BEFORE UPDATE ON public.shift_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_employee_patterns_updated_at
    BEFORE UPDATE ON public.employee_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_coverage_updated_at
    BEFORE UPDATE ON public.daily_coverage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_coverage_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION update_coverage_status();

CREATE TRIGGER validate_schedule_trigger
    BEFORE INSERT OR UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION validate_schedule();

CREATE TRIGGER prevent_overlapping_patterns_trigger
    BEFORE INSERT OR UPDATE ON public.employee_patterns
    FOR EACH ROW EXECUTE FUNCTION prevent_overlapping_patterns();

-- Enable RLS on all tables
ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shift_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."time_off_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."staffing_requirements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shift_patterns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."employee_patterns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."daily_coverage" ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT USAGE ON SCHEMA "public" TO "postgres", "anon", "authenticated", "service_role";
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "postgres", "anon", "authenticated", "service_role";

-- Grant information schema access
GRANT USAGE ON SCHEMA information_schema TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA information_schema TO authenticated;

-- Set default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
GRANT ALL ON TABLES TO "postgres", "anon", "authenticated", "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
GRANT ALL ON SEQUENCES TO "postgres", "anon", "authenticated", "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
GRANT ALL ON FUNCTIONS TO "postgres", "anon", "authenticated", "service_role";

-- Add time off requests function
CREATE OR REPLACE FUNCTION public.get_time_off_requests()
RETURNS TABLE (
    id uuid,
    employee_id uuid,
    start_date date,
    end_date date,
    type time_off_type_enum,
    status time_off_status_enum,
    notes text,
    reviewed_by uuid,
    reviewed_at timestamptz,
    submitted_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    employee_email text,
    employee_full_name text,
    employee_role employee_role_enum
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tor.id,
        tor.employee_id,
        tor.start_date::date,
        tor.end_date::date,
        tor.type,
        tor.status,
        tor.notes,
        tor.reviewed_by,
        tor.reviewed_at,
        tor.submitted_at,
        tor.created_at,
        tor.updated_at,
        auth.email() as employee_email,
        p.full_name as employee_full_name,
        e.employee_role
    FROM public.time_off_requests tor
    JOIN public.employees e ON e.id = tor.employee_id
    LEFT JOIN public.profiles p ON p.id = e.id
    WHERE 
        -- Allow users to see their own requests
        tor.employee_id = auth.uid()
        -- Or allow managers/admins to see all requests
        OR EXISTS (
            SELECT 1 
            FROM public.employees e2
            WHERE e2.id = auth.uid() 
            AND e2.user_role IN ('Manager', 'Admin')
        )
    ORDER BY tor.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 