

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






CREATE TYPE "public"."day_of_week_enum" AS ENUM (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);


ALTER TYPE "public"."day_of_week_enum" OWNER TO "postgres";


CREATE TYPE "public"."duration_category_enum" AS ENUM (
    '4 hours',
    '10 hours',
    '12 hours'
);


ALTER TYPE "public"."duration_category_enum" OWNER TO "postgres";


CREATE TYPE "public"."employee_role_enum" AS ENUM (
    'Dispatcher',
    'Shift Supervisor',
    'Management'
);


ALTER TYPE "public"."employee_role_enum" OWNER TO "postgres";


CREATE TYPE "public"."schedule_status_enum" AS ENUM (
    'Draft',
    'Published'
);


ALTER TYPE "public"."schedule_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."time_off_status_enum" AS ENUM (
    'Pending',
    'Approved',
    'Declined'
);


ALTER TYPE "public"."time_off_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."time_off_type_enum" AS ENUM (
    'Vacation',
    'Sick',
    'Personal',
    'Training'
);


ALTER TYPE "public"."time_off_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_enum" AS ENUM (
    'Employee',
    'Manager',
    'Admin'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_time_off_requests"() RETURNS TABLE("id" "uuid", "employee_id" "uuid", "employee_email" "text", "employee_full_name" "text", "start_date" "date", "end_date" "date", "type" "public"."time_off_type_enum", "status" "public"."time_off_status_enum", "notes" "text", "reviewed_by" "uuid", "reviewer_email" "text", "reviewer_full_name" "text", "reviewed_at" timestamp with time zone, "submitted_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.employee_id,
    e.email::text as employee_email,
    ep.full_name as employee_full_name,
    r.start_date,
    r.end_date,
    r.type,
    r.status,
    r.notes,
    r.reviewed_by,
    rv.email::text as reviewer_email,
    rp.full_name as reviewer_full_name,
    r.reviewed_at,
    r.submitted_at,
    r.created_at,
    r.updated_at
  FROM time_off_requests r
  LEFT JOIN auth.users e ON e.id = r.employee_id
  LEFT JOIN profiles ep ON ep.id = r.employee_id
  LEFT JOIN auth.users rv ON rv.id = r.reviewed_by
  LEFT JOIN profiles rp ON rp.id = r.reviewed_by
  WHERE (
    auth.uid() = r.employee_id
    OR EXISTS (
      SELECT 1 FROM employees emp
      WHERE emp.id = auth.uid()
      AND emp.user_role IN ('Manager', 'Admin')
    )
  )
  ORDER BY r.submitted_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_time_off_requests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "public"."user_role_enum"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_role user_role_enum;
BEGIN
  SELECT user_role INTO v_user_role
  FROM public.employees
  WHERE id = auth.uid();
  RETURN v_user_role;
END;
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_users_by_ids"("user_ids" "uuid"[]) RETURNS TABLE("id" "uuid", "email" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT u.id, u.email::text
  FROM auth.users u
  WHERE u.id = ANY(user_ids);
$$;


ALTER FUNCTION "public"."get_users_by_ids"("user_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_shift_type_id uuid;
  v_error text;
  v_detail text;
BEGIN
  RAISE NOTICE 'Creating new user with ID: %, Email: %, Metadata: %', new.id, new.email, new.raw_user_meta_data;
  
  BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'avatar_url', null), now());
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating profile: %', SQLERRM;
      RAISE EXCEPTION 'Profile creation failed: %', SQLERRM;
  END;
  
  BEGIN
    IF new.raw_user_meta_data->>'default_shift_type_id' IS NULL THEN
      SELECT id INTO v_shift_type_id FROM shift_types WHERE name = 'Day Shift' LIMIT 1;
    ELSE
      BEGIN
        v_shift_type_id := (new.raw_user_meta_data->>'default_shift_type_id')::uuid;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'Invalid UUID for default_shift_type_id: %', new.raw_user_meta_data->>'default_shift_type_id';
          RAISE EXCEPTION 'Invalid default_shift_type_id format';
      END;
    END IF;

    INSERT INTO public.employees (id, employee_role, user_role, weekly_hours_scheduled, default_shift_type_id)
    VALUES (
      new.id,
      COALESCE((new.raw_user_meta_data->>'employee_role')::employee_role_enum, 'Dispatcher'::employee_role_enum),
      COALESCE((new.raw_user_meta_data->>'user_role')::user_role_enum, 'Employee'::user_role_enum),
      COALESCE((new.raw_user_meta_data->>'weekly_hours_scheduled')::integer, 40),
      v_shift_type_id
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating employee: %', SQLERRM;
      RAISE EXCEPTION 'Employee creation failed: %', SQLERRM;
  END;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT, v_detail = PG_EXCEPTION_DETAIL;
    RAISE WARNING 'Error in handle_new_user trigger: % (User ID: %, Email: %), Detail: %', v_error, new.id, new.email, v_detail;
    RAISE;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_employee_and_profile"("p_employee_id" "uuid", "p_full_name" "text", "p_employee_role" "text", "p_user_role" "text", "p_weekly_hours_scheduled" integer, "p_default_shift_type_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Start transaction
  BEGIN
    -- Update profile
    UPDATE public.profiles
    SET full_name = p_full_name,
        updated_at = now()
    WHERE id = p_employee_id;

    -- Update employee
    UPDATE public.employees
    SET employee_role = p_employee_role::employee_role_enum,
        user_role = p_user_role::user_role_enum,
        weekly_hours_scheduled = p_weekly_hours_scheduled,
        default_shift_type_id = p_default_shift_type_id
    WHERE id = p_employee_id;

    -- Get updated employee data
    SELECT jsonb_build_object(
      'id', e.id,
      'employee_role', e.employee_role,
      'user_role', e.user_role,
      'weekly_hours_scheduled', e.weekly_hours_scheduled,
      'default_shift_type_id', e.default_shift_type_id,
      'full_name', p.full_name,
      'updated_at', p.updated_at
    ) INTO v_result
    FROM public.employees e
    JOIN public.profiles p ON p.id = e.id
    WHERE e.id = p_employee_id;

    RETURN v_result;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error updating employee and profile: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION "public"."update_employee_and_profile"("p_employee_id" "uuid", "p_full_name" "text", "p_employee_role" "text", "p_user_role" "text", "p_weekly_hours_scheduled" integer, "p_default_shift_type_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_time_off_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_time_off_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."assigned_shifts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "schedule_id" "uuid" NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "assigned_shifts_time_check" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."assigned_shifts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" NOT NULL,
    "employee_role" "public"."employee_role_enum" NOT NULL,
    "user_role" "public"."user_role_enum" NOT NULL,
    "weekly_hours_scheduled" integer DEFAULT 0,
    "default_shift_type_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "week_start_date" "date" NOT NULL,
    "day_of_week" "public"."day_of_week_enum" NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "schedule_status" "public"."schedule_status_enum" DEFAULT 'Draft'::"public"."schedule_status_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_week_start" CHECK ((EXTRACT(dow FROM "week_start_date") = (0)::numeric))
);


ALTER TABLE "public"."schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shift_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."shift_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shifts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "shift_type_id" "uuid" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "duration_hours" integer NOT NULL,
    "duration_category" "public"."duration_category_enum" GENERATED ALWAYS AS (
CASE
    WHEN ("duration_hours" = 4) THEN '4 hours'::"public"."duration_category_enum"
    WHEN ("duration_hours" = 10) THEN '10 hours'::"public"."duration_category_enum"
    WHEN ("duration_hours" = 12) THEN '12 hours'::"public"."duration_category_enum"
    ELSE NULL::"public"."duration_category_enum"
END) STORED,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."shifts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staffing_requirements" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "period_name" "text" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "minimum_employees" integer NOT NULL,
    "shift_supervisor_required" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."staffing_requirements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."time_off_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "type" "public"."time_off_type_enum" NOT NULL,
    "status" "public"."time_off_status_enum" DEFAULT 'Pending'::"public"."time_off_status_enum" NOT NULL,
    "notes" "text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."time_off_requests" OWNER TO "postgres";


ALTER TABLE ONLY "public"."assigned_shifts"
    ADD CONSTRAINT "assigned_shifts_pkey" PRIMARY KEY ("id");



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



CREATE INDEX "idx_assigned_shifts_employee_date" ON "public"."assigned_shifts" USING "btree" ("employee_id", "date");



CREATE INDEX "idx_assigned_shifts_schedule" ON "public"."assigned_shifts" USING "btree" ("schedule_id");



CREATE OR REPLACE TRIGGER "update_assigned_shifts_updated_at" BEFORE UPDATE ON "public"."assigned_shifts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_schedules_updated_at" BEFORE UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_time_off_requests_updated_at" BEFORE UPDATE ON "public"."time_off_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_time_off_updated_at"();



ALTER TABLE ONLY "public"."assigned_shifts"
    ADD CONSTRAINT "assigned_shifts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assigned_shifts"
    ADD CONSTRAINT "assigned_shifts_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assigned_shifts"
    ADD CONSTRAINT "assigned_shifts_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_default_shift_type_id_fkey" FOREIGN KEY ("default_shift_type_id") REFERENCES "public"."shift_types"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



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



CREATE POLICY "Anyone can view assigned shifts" ON "public"."assigned_shifts" FOR SELECT USING (true);



CREATE POLICY "Anyone can view shift types" ON "public"."shift_types" FOR SELECT USING (true);



CREATE POLICY "Anyone can view shifts" ON "public"."shifts" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can view employees" ON "public"."employees" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Employees can view their own schedules" ON "public"."schedules" FOR SELECT USING (("auth"."uid"() = "employee_id"));



CREATE POLICY "Managers and admins can manage all records" ON "public"."employees" USING ("auth"."check_user_role"("auth"."uid"()));



CREATE POLICY "Managers can manage all schedules" ON "public"."schedules" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."user_role" = ANY (ARRAY['Manager'::"public"."user_role_enum", 'Admin'::"public"."user_role_enum"]))))));



CREATE POLICY "Managers can manage assigned shifts" ON "public"."assigned_shifts" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."user_role" = ANY (ARRAY['Manager'::"public"."user_role_enum", 'Admin'::"public"."user_role_enum"]))))));



CREATE POLICY "Managers can manage shift types" ON "public"."shift_types" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."user_role" = ANY (ARRAY['Manager'::"public"."user_role_enum", 'Admin'::"public"."user_role_enum"]))))));



CREATE POLICY "Managers can manage shifts" ON "public"."shifts" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."user_role" = ANY (ARRAY['Manager'::"public"."user_role_enum", 'Admin'::"public"."user_role_enum"]))))));



CREATE POLICY "Managers can update employee records" ON "public"."employees" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."employees" "employees_1"
  WHERE (("employees_1"."id" = "auth"."uid"()) AND ("employees_1"."user_role" = ANY (ARRAY['Manager'::"public"."user_role_enum", 'Admin'::"public"."user_role_enum"]))))));



CREATE POLICY "Managers can update time off request status" ON "public"."time_off_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."employees" "emp"
  WHERE (("emp"."id" = "auth"."uid"()) AND ("emp"."user_role" = ANY (ARRAY['Manager'::"public"."user_role_enum", 'Admin'::"public"."user_role_enum"]))))));



CREATE POLICY "Managers can view all profiles" ON "public"."profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."user_role" = ANY (ARRAY['Manager'::"public"."user_role_enum", 'Admin'::"public"."user_role_enum"]))))));



CREATE POLICY "Managers can view all time off requests" ON "public"."time_off_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."employees" "emp"
  WHERE (("emp"."id" = "auth"."uid"()) AND ("emp"."user_role" = ANY (ARRAY['Manager'::"public"."user_role_enum", 'Admin'::"public"."user_role_enum"]))))));



CREATE POLICY "Users can create their own time off requests" ON "public"."time_off_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "employee_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own record" ON "public"."employees" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own time off requests" ON "public"."time_off_requests" FOR SELECT USING (("auth"."uid"() = "employee_id"));



ALTER TABLE "public"."assigned_shifts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shift_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shifts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staffing_requirements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_off_requests" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."get_time_off_requests"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_time_off_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_time_off_requests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_users_by_ids"("user_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_users_by_ids"("user_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_users_by_ids"("user_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_employee_and_profile"("p_employee_id" "uuid", "p_full_name" "text", "p_employee_role" "text", "p_user_role" "text", "p_weekly_hours_scheduled" integer, "p_default_shift_type_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_employee_and_profile"("p_employee_id" "uuid", "p_full_name" "text", "p_employee_role" "text", "p_user_role" "text", "p_weekly_hours_scheduled" integer, "p_default_shift_type_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_employee_and_profile"("p_employee_id" "uuid", "p_full_name" "text", "p_employee_role" "text", "p_user_role" "text", "p_weekly_hours_scheduled" integer, "p_default_shift_type_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_time_off_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_time_off_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_time_off_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."assigned_shifts" TO "anon";
GRANT ALL ON TABLE "public"."assigned_shifts" TO "authenticated";
GRANT ALL ON TABLE "public"."assigned_shifts" TO "service_role";



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
