-- Create ENUM types first
DO $$ BEGIN
    CREATE TYPE employee_role_enum AS ENUM ('Dispatcher', 'Shift Supervisor', 'Management');
    CREATE TYPE user_role_enum AS ENUM ('Employee', 'Manager', 'Admin');
    CREATE TYPE time_off_type_enum AS ENUM ('Vacation', 'Sick', 'Personal', 'Training');
    CREATE TYPE time_off_status_enum AS ENUM ('Pending', 'Approved', 'Declined');
    CREATE TYPE day_of_week_enum AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
    CREATE TYPE schedule_status_enum AS ENUM ('Draft', 'Published');
    CREATE TYPE duration_category_enum AS ENUM ('4 hours', '10 hours', '12 hours');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create base function for checking user roles
CREATE OR REPLACE FUNCTION auth.check_user_role(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees
    WHERE id = user_id
    AND user_role IN ('Manager', 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create all base tables
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

CREATE TABLE IF NOT EXISTS "public"."shift_types" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "shift_types_pkey" PRIMARY KEY ("id")
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
    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
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
    CONSTRAINT "staffing_requirements_pkey" PRIMARY KEY ("id")
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
    CONSTRAINT "time_off_requests_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_default_shift_type_id_fkey" FOREIGN KEY ("default_shift_type_id") REFERENCES "public"."shift_types"("id"),
    ADD CONSTRAINT "employees_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    ADD CONSTRAINT "fk_profile" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_shift_type_id_fkey" FOREIGN KEY ("shift_type_id") REFERENCES "public"."shift_types"("id");

ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "auth"."users"("id"),
    ADD CONSTRAINT "time_off_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");

-- Base functions for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shift_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."staffing_requirements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."time_off_requests" ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "postgres";
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "anon";
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "authenticated";
GRANT ALL ON ALL TABLES IN SCHEMA "public" TO "service_role";

-- Set default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
GRANT ALL ON TABLES TO "postgres", "anon", "authenticated", "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
GRANT ALL ON SEQUENCES TO "postgres", "anon", "authenticated", "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
GRANT ALL ON FUNCTIONS TO "postgres", "anon", "authenticated", "service_role";
