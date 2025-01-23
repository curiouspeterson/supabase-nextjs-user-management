-- Create auth function for checking user roles
create or replace function auth.check_user_role(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from employees
    where id = user_id
    and user_role in ('Manager', 'Admin')
  );
end;
$$ language plpgsql security definer;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_user_role text;
begin
  select user_role into v_user_role
  from public.employees
  where id = auth.uid();
  return v_user_role;
end;
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$ declare v_shift_type_id uuid; v_error text; v_detail text; begin raise notice 'Creating new user with ID: %, Email: %, Metadata: %', new.id, new.email, new.raw_user_meta_data; begin insert into public.profiles (id, full_name, avatar_url, updated_at) values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'avatar_url', null), now()); exception when others then raise warning 'Error creating profile: %', SQLERRM; raise exception 'Profile creation failed: %', SQLERRM; end; begin if new.raw_user_meta_data->>'default_shift_type_id' is null then select id into v_shift_type_id from shift_types where name = 'Day Shift' limit 1; else begin v_shift_type_id := (new.raw_user_meta_data->>'default_shift_type_id')::uuid; exception when others then raise warning 'Invalid UUID for default_shift_type_id: %', new.raw_user_meta_data->>'default_shift_type_id'; raise exception 'Invalid default_shift_type_id format'; end; end if; insert into public.employees (id, employee_role, user_role, weekly_hours_scheduled, default_shift_type_id) values (new.id, coalesce(new.raw_user_meta_data->>'employee_role', 'Dispatcher'), coalesce(new.raw_user_meta_data->>'user_role', 'Employee'), coalesce((new.raw_user_meta_data->>'weekly_hours_scheduled')::integer, 40), v_shift_type_id); exception when others then raise warning 'Error creating employee: %', SQLERRM; raise exception 'Employee creation failed: %', SQLERRM; end; return new; exception when others then get stacked diagnostics v_error = message_text, v_detail = pg_exception_detail; raise warning 'Error in handle_new_user trigger: % (User ID: %, Email: %), Detail: %', v_error, new.id, new.email, v_detail; raise; end; $$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_time_off_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_time_off_update"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


-- Create all tables first
CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" NOT NULL,
    "employee_role" "text" NOT NULL,
    "user_role" "text" NOT NULL,
    "weekly_hours_scheduled" integer DEFAULT 0,
    "default_shift_type_id" "uuid",
    CONSTRAINT "employees_employee_role_check" CHECK (("employee_role" = ANY (ARRAY['Dispatcher'::"text", 'Shift Supervisor'::"text", 'Management'::"text"]))),
    CONSTRAINT "employees_user_role_check" CHECK (("user_role" = ANY (ARRAY['Employee'::"text", 'Manager'::"text", 'Admin'::"text"])))
);

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text"
);

CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "week_start_date" "date" NOT NULL,
    "day_of_week" "text" NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "schedule_status" "text" DEFAULT 'Draft'::"text" NOT NULL,
    CONSTRAINT "schedules_day_of_week_check" CHECK (("day_of_week" = ANY (ARRAY['Monday'::"text", 'Tuesday'::"text", 'Wednesday'::"text", 'Thursday'::"text", 'Friday'::"text", 'Saturday'::"text", 'Sunday'::"text"]))),
    CONSTRAINT "schedules_schedule_status_check" CHECK (("schedule_status" = ANY (ARRAY['Draft'::"text", 'Published'::"text"])))
);

CREATE TABLE IF NOT EXISTS "public"."shift_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."shifts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "shift_type_id" "uuid" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "duration_hours" integer NOT NULL,
    "duration_category" "text" NOT NULL,
    CONSTRAINT "shifts_duration_category_check" CHECK (("duration_category" = ANY (ARRAY['4 hours'::"text", '10 hours'::"text", '12 hours'::"text"])))
);

CREATE TABLE IF NOT EXISTS "public"."staffing_requirements" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "period_name" "text" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "minimum_employees" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."time_off_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'Pending'::"text" NOT NULL,
    "notes" "text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "time_off_requests_status_check" CHECK (("status" = ANY (ARRAY['Pending'::"text", 'Approved'::"text", 'Declined'::"text"]))),
    CONSTRAINT "time_off_requests_type_check" CHECK (("type" = ANY (ARRAY['Vacation'::"text", 'Sick'::"text", 'Personal'::"text", 'Training'::"text"])))
);

-- Add all constraints
ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");

ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."shift_types"
    ADD CONSTRAINT "shift_types_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."staffing_requirements"
    ADD CONSTRAINT "staffing_requirements_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_pkey" PRIMARY KEY ("id");

-- Add all foreign key constraints
ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_default_shift_type_id_fkey" FOREIGN KEY ("default_shift_type_id") REFERENCES "public"."shift_types"("id");

ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "fk_employee_profile" FOREIGN KEY ("employee_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "fk_profile" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");

ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id");

ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_shift_type_id_fkey" FOREIGN KEY ("shift_type_id") REFERENCES "public"."shift_types"("id");

ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");

-- Enable RLS on all tables
ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shift_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."staffing_requirements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."time_off_requests" ENABLE ROW LEVEL SECURITY;

-- Create policies that don't depend on employees table
CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));
CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));
CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));
CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));
CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));
CREATE POLICY "Users can create their own time off requests" ON "public"."time_off_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "employee_id"));
CREATE POLICY "Users can view their own time off requests" ON "public"."time_off_requests" FOR SELECT USING (("auth"."uid"() = "employee_id"));

-- Create policies that depend on employees table
CREATE POLICY "Managers and admins can manage all records" ON "public"."employees" USING ("auth"."check_user_role"("auth"."uid"()));
CREATE POLICY "Users can update their own record" ON "public"."employees" FOR UPDATE USING (("auth"."uid"() = "id"));
CREATE POLICY "Authenticated users can view employees" ON "public"."employees" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));

CREATE POLICY "Managers can update employee records" ON "public"."employees" FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Managers can manage all schedules" ON "public"."schedules" USING ("auth"."check_user_role"("auth"."uid"()));
CREATE POLICY "Users can view their own schedules" ON "public"."schedules" FOR SELECT USING (("auth"."uid"() = "employee_id"));

CREATE POLICY "Managers can manage shift types" ON "public"."shift_types" USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Anyone can view shift types" ON "public"."shift_types" FOR SELECT USING (true);

CREATE POLICY "Managers can manage shifts" ON "public"."shifts" USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Anyone can view shifts" ON "public"."shifts" FOR SELECT USING (true);

CREATE POLICY "Managers can manage staffing requirements" ON "public"."staffing_requirements" USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Anyone can view staffing requirements" ON "public"."staffing_requirements" FOR SELECT USING (true);

CREATE POLICY "Managers can update time off request status" ON "public"."time_off_requests" FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Managers can view all time off requests" ON "public"."time_off_requests" FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

CREATE POLICY "Managers can view all profiles" ON "public"."profiles" FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
);

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_time_off_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_time_off_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_time_off_update"() TO "service_role";


















GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";



GRANT ALL ON TABLE "public"."shift_types" TO "anon";
GRANT ALL ON TABLE "public"."shift_types" TO "authenticated";
GRANT ALL ON TABLE "public"."shift_types" TO "service_role";



GRANT ALL ON TABLE "public"."shifts" TO "anon";
GRANT ALL ON TABLE "public"."shifts" TO "authenticated";
GRANT ALL ON TABLE "public"."shifts" TO "service_role";



GRANT ALL ON TABLE "public"."staffing_requirements" TO "anon";
GRANT ALL ON TABLE "public"."staffing_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."staffing_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."time_off_requests" TO "anon";
GRANT ALL ON TABLE "public"."time_off_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."time_off_requests" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
