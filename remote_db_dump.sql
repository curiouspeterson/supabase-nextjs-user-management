

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






CREATE TYPE "public"."auth_error_severity" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE "public"."auth_error_severity" OWNER TO "postgres";


CREATE TYPE "public"."auth_error_type" AS ENUM (
    'USER_HOOK',
    'AUTH_STATE',
    'SESSION',
    'TOKEN',
    'NETWORK',
    'RATE_LIMIT',
    'UNKNOWN'
);


ALTER TYPE "public"."auth_error_type" OWNER TO "postgres";


CREATE TYPE "public"."coverage_status_enum" AS ENUM (
    'Under',
    'Met',
    'Over'
);


ALTER TYPE "public"."coverage_status_enum" OWNER TO "postgres";


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


CREATE DOMAIN "public"."email" AS "text"
	CONSTRAINT "email_check" CHECK ((VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text"));


ALTER DOMAIN "public"."email" OWNER TO "postgres";


CREATE TYPE "public"."employee_operation" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'RESTORE'
);


ALTER TYPE "public"."employee_operation" OWNER TO "postgres";


CREATE TYPE "public"."employee_role" AS ENUM (
    'STAFF',
    'SUPERVISOR',
    'MANAGER',
    'ADMIN'
);


ALTER TYPE "public"."employee_role" OWNER TO "postgres";


CREATE TYPE "public"."employee_role_enum" AS ENUM (
    'Dispatcher',
    'Shift Supervisor',
    'Management'
);


ALTER TYPE "public"."employee_role_enum" OWNER TO "postgres";


CREATE TYPE "public"."error_status_code" AS ENUM (
    'BAD_REQUEST',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'NOT_FOUND',
    'METHOD_NOT_ALLOWED',
    'CONFLICT',
    'UNPROCESSABLE_ENTITY',
    'TOO_MANY_REQUESTS',
    'INTERNAL_ERROR',
    'NOT_IMPLEMENTED',
    'SERVICE_UNAVAILABLE'
);


ALTER TYPE "public"."error_status_code" OWNER TO "postgres";


CREATE TYPE "public"."jwt_algorithm" AS ENUM (
    'HS256',
    'HS384',
    'HS512',
    'RS256',
    'RS384',
    'RS512',
    'ES256',
    'ES384',
    'ES512'
);


ALTER TYPE "public"."jwt_algorithm" OWNER TO "postgres";


CREATE TYPE "public"."operation_severity" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE "public"."operation_severity" OWNER TO "postgres";


CREATE TYPE "public"."password_policy" AS (
	"min_length" integer,
	"require_uppercase" boolean,
	"require_lowercase" boolean,
	"require_numbers" boolean,
	"require_special_chars" boolean,
	"max_repeated_chars" integer,
	"prohibited_patterns" "text"[],
	"max_age_days" integer,
	"history_size" integer
);


ALTER TYPE "public"."password_policy" OWNER TO "postgres";


CREATE TYPE "public"."pattern_action_type" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'VALIDATE',
    'ERROR'
);


ALTER TYPE "public"."pattern_action_type" OWNER TO "postgres";


CREATE TYPE "public"."period_format" AS ENUM (
    'HH:MM-HH:MM',
    'HH:MM:SS-HH:MM:SS',
    'HHMM-HHMM'
);


ALTER TYPE "public"."period_format" OWNER TO "postgres";


CREATE DOMAIN "public"."phone_number" AS "text"
	CONSTRAINT "phone_number_check" CHECK ((VALUE ~ '^\+?[1-9]\d{1,14}$'::"text"));


ALTER DOMAIN "public"."phone_number" OWNER TO "postgres";


CREATE TYPE "public"."schedule_operation" AS ENUM (
    'PUBLISH',
    'UNPUBLISH',
    'UPDATE',
    'DELETE'
);


ALTER TYPE "public"."schedule_operation" OWNER TO "postgres";


CREATE TYPE "public"."schedule_status" AS ENUM (
    'DRAFT',
    'PENDING',
    'APPROVED',
    'PUBLISHED',
    'CANCELLED'
);


ALTER TYPE "public"."schedule_status" OWNER TO "postgres";


CREATE TYPE "public"."schedule_status_enum" AS ENUM (
    'Draft',
    'Published'
);


ALTER TYPE "public"."schedule_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."shift_duration_category" AS ENUM (
    'SHORT',
    'REGULAR',
    'EXTENDED',
    'LONG'
);


ALTER TYPE "public"."shift_duration_category" OWNER TO "postgres";


CREATE TYPE "public"."shift_pattern_type_enum" AS ENUM (
    '4x10',
    '3x12_1x4',
    'Custom'
);


ALTER TYPE "public"."shift_pattern_type_enum" OWNER TO "postgres";


CREATE DOMAIN "public"."strong_password" AS "text"
	CONSTRAINT "strong_password_check" CHECK ((("length"(VALUE) >= 8) AND (VALUE ~ '[A-Z]'::"text") AND (VALUE ~ '[a-z]'::"text") AND (VALUE ~ '[0-9]'::"text") AND (VALUE ~ '[!@#$%^&*(),.?":{}|<>]'::"text")));


ALTER DOMAIN "public"."strong_password" OWNER TO "postgres";


CREATE TYPE "public"."time_off_access_level" AS ENUM (
    'SELF',
    'TEAM',
    'ALL'
);


ALTER TYPE "public"."time_off_access_level" OWNER TO "postgres";


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


CREATE TYPE "public"."timezone_policy" AS (
	"allowed_zones" "text"[],
	"default_zone" "text",
	"dst_handling" "text"
);


ALTER TYPE "public"."timezone_policy" OWNER TO "postgres";


CREATE TYPE "public"."user_role_enum" AS ENUM (
    'Employee',
    'Manager',
    'Admin'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."analyze_auth_patterns"("p_time_window" interval DEFAULT '24:00:00'::interval) RETURNS TABLE("event_type" "text", "total_events" bigint, "unique_users" bigint, "avg_events_per_user" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.event_type,
        COUNT(*)::BIGINT as total_events,
        COUNT(DISTINCT e.user_id)::BIGINT as unique_users,
        CASE 
            WHEN COUNT(DISTINCT e.user_id) > 0 
            THEN (COUNT(*)::NUMERIC / COUNT(DISTINCT e.user_id)::NUMERIC)
            ELSE 0
        END as avg_events_per_user
    FROM public.auth_events e
    WHERE e.created_at > NOW() - p_time_window
    GROUP BY e.event_type
    ORDER BY total_events DESC;
END;
$$;


ALTER FUNCTION "public"."analyze_auth_patterns"("p_time_window" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."analyze_error_patterns"("p_time_window" interval DEFAULT '24:00:00'::interval) RETURNS TABLE("component" "text", "total_errors" integer, "total_recoveries" integer, "recovery_rate" numeric, "avg_recovery_attempts" numeric, "last_error" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.component,
        SUM(e.error_count) as total_errors,
        SUM(e.successful_recoveries) as total_recoveries,
        CASE 
            WHEN SUM(e.recovery_attempts) > 0 
            THEN (SUM(e.successful_recoveries)::NUMERIC / SUM(e.recovery_attempts)::NUMERIC * 100)
            ELSE 0
        END as recovery_rate,
        CASE 
            WHEN SUM(e.error_count) > 0 
            THEN (SUM(e.recovery_attempts)::NUMERIC / SUM(e.error_count)::NUMERIC)
            ELSE 0
        END as avg_recovery_attempts,
        MAX(e.last_error) as last_error
    FROM public.error_metrics e
    WHERE e.last_error > NOW() - p_time_window
    GROUP BY e.component
    ORDER BY total_errors DESC;
END;
$$;


ALTER FUNCTION "public"."analyze_error_patterns"("p_time_window" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."analyze_network_retry_patterns"("p_time_window" interval DEFAULT '24:00:00'::interval) RETURNS TABLE("component" "text", "endpoint" "text", "total_retries" integer, "success_rate" numeric, "avg_retry_delay" numeric, "max_retry_delay" numeric, "last_retry" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.component,
        n.endpoint,
        n.total_retries,
        CASE 
            WHEN n.total_retries > 0 
            THEN (n.successful_retries::NUMERIC / n.total_retries::NUMERIC * 100)
            ELSE 0
        END as success_rate,
        n.avg_retry_delay,
        n.max_retry_delay,
        n.last_retry
    FROM public.network_retry_metrics n
    WHERE n.last_retry > NOW() - p_time_window
    ORDER BY n.total_retries DESC;
END;
$$;


ALTER FUNCTION "public"."analyze_network_retry_patterns"("p_time_window" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."begin_transaction"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  start transaction;
end;
$$;


ALTER FUNCTION "public"."begin_transaction"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."begin_transaction"() IS 'Begins a new database transaction';



CREATE OR REPLACE FUNCTION "public"."calculate_period_coverage"("p_date" "date", "p_period_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."calculate_period_coverage"("p_date" "date", "p_period_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_weekly_hours"("p_employee_id" "uuid", "p_date" "date") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_total_hours INTEGER;
BEGIN
    SELECT COALESCE(SUM(sh.duration_hours), 0)
    INTO v_total_hours
    FROM public.schedules s
    JOIN public.shifts sh ON s.shift_id = sh.id
    WHERE s.employee_id = p_employee_id
    AND s.date BETWEEN date_trunc('week', p_date::timestamp)::date
                   AND (date_trunc('week', p_date::timestamp) + interval '6 days')::date;
    
    RETURN v_total_hours;
END;
$$;


ALTER FUNCTION "public"."calculate_weekly_hours"("p_employee_id" "uuid", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_access_user_data"("p_accessor_id" "uuid", "p_target_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_access_level time_off_access_level;
    v_team_id UUID;
    v_target_team_id UUID;
BEGIN
    -- Get accessor's access level
    v_access_level := public.get_time_off_access_level(p_accessor_id);

    -- Full access for admins
    IF v_access_level = 'ALL' THEN
        RETURN TRUE;
    END IF;

    -- Self access always allowed
    IF p_accessor_id = p_target_id THEN
        RETURN TRUE;
    END IF;

    -- Team access for managers
    IF v_access_level = 'TEAM' THEN
        -- Get team IDs
        SELECT team_id INTO v_team_id
        FROM public.employees
        WHERE user_id = p_accessor_id;

        SELECT team_id INTO v_target_team_id
        FROM public.employees
        WHERE user_id = p_target_id;

        RETURN v_team_id = v_target_team_id;
    END IF;

    -- Default to no access
    RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."can_access_user_data"("p_accessor_id" "uuid", "p_target_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_manage_time_off_requests"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_role text;
begin
  select user_role into v_role
  from public.employees
  where id = p_user_id;
  
  return v_role in ('Admin', 'Manager');
end;
$$;


ALTER FUNCTION "public"."can_manage_time_off_requests"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_manage_time_off_requests"("p_user_id" "uuid") IS 'Checks if a user has permission to manage time-off requests';



CREATE OR REPLACE FUNCTION "public"."check_confirmation_rate_limit"("p_email" "text", "p_ip_address" "text", "p_window_minutes" integer DEFAULT 60, "p_max_attempts" integer DEFAULT 5) RETURNS TABLE("allowed" boolean, "remaining_attempts" integer, "next_allowed_attempt" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    v_attempts INT;
    v_window_start TIMESTAMPTZ;
    v_last_attempt TIMESTAMPTZ;
BEGIN
    -- Set window start time
    v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Get attempt count and last attempt time
    SELECT 
        COUNT(*),
        MAX(created_at)
    INTO 
        v_attempts,
        v_last_attempt
    FROM public.auth_confirmation_attempts
    WHERE (email = p_email OR ip_address = p_ip_address)
    AND created_at > v_window_start;

    RETURN QUERY
    SELECT 
        v_attempts < p_max_attempts,
        p_max_attempts - v_attempts,
        CASE 
            WHEN v_attempts >= p_max_attempts 
            THEN v_last_attempt + (p_window_minutes || ' minutes')::INTERVAL
            ELSE NULL
        END;
END;
$$;


ALTER FUNCTION "public"."check_confirmation_rate_limit"("p_email" "text", "p_ip_address" "text", "p_window_minutes" integer, "p_max_attempts" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_employee_dependencies"("employee_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
declare
  result jsonb;
begin
  -- Verify caller has permission
  if not exists (
    select 1 
    from public.employees 
    where id = auth.uid() 
    and user_role in ('Admin', 'Manager')
  ) then
    raise exception 'Permission denied';
  end if;

  -- Check for dependencies
  select jsonb_build_object(
    'has_dependencies', 
    case when (
      exists (select 1 from public.schedules where employee_id = $1) or
      exists (select 1 from public.time_off_requests where employee_id = $1)
    ) then true else false end,
    'dependencies', jsonb_build_object(
      'schedules', (select count(*) from public.schedules where employee_id = $1),
      'time_off_requests', (select count(*) from public.time_off_requests where employee_id = $1)
    )
  )
  into result;
  
  return result;
end;
$_$;


ALTER FUNCTION "public"."check_employee_dependencies"("employee_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_employee_dependencies"("employee_id" "uuid") IS 'Checks for dependent records before employee deletion';



CREATE OR REPLACE FUNCTION "public"."check_password_history"("p_user_id" "uuid", "p_new_password" "text", "p_policy_name" "text" DEFAULT 'default'::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_policy password_policy;
BEGIN
    -- Get policy
    SELECT policy INTO v_policy
    FROM public.password_policies
    WHERE name = p_policy_name;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Password policy % not found', p_policy_name;
    END IF;

    -- Check if password exists in history
    RETURN NOT EXISTS (
        SELECT 1
        FROM public.password_history
        WHERE user_id = p_user_id
        AND password_hash = crypt(p_new_password, password_hash)
        AND created_at > NOW() - (v_policy.max_age_days || ' days')::INTERVAL
        ORDER BY created_at DESC
        LIMIT v_policy.history_size
    );
END;
$$;


ALTER FUNCTION "public"."check_password_history"("p_user_id" "uuid", "p_new_password" "text", "p_policy_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_rate_limit"("p_key" "text", "p_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("allowed" boolean, "remaining" integer, "reset_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_config public.rate_limit_config%ROWTYPE;
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
BEGIN
    -- Get rate limit config
    SELECT * INTO v_config
    FROM public.rate_limit_config
    WHERE key = p_key AND enabled = true;

    IF NOT FOUND THEN
        RETURN QUERY SELECT true::BOOLEAN, NULL::INTEGER, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Calculate current window
    v_window_start := date_trunc('second', NOW()) - 
                     (extract(epoch FROM NOW())::INTEGER % v_config.window_seconds || ' seconds')::INTERVAL;

    -- Get or create metrics record
    INSERT INTO public.rate_limit_metrics (
        key,
        user_id,
        request_count,
        window_start,
        last_request
    )
    VALUES (
        p_key,
        p_user_id,
        1,
        v_window_start,
        NOW()
    )
    ON CONFLICT (key, user_id, window_start)
    DO UPDATE SET
        request_count = public.rate_limit_metrics.request_count + 1,
        last_request = NOW()
    RETURNING request_count INTO v_current_count;

    -- Calculate remaining requests and reset time
    RETURN QUERY
    SELECT 
        (v_current_count <= COALESCE(v_config.burst_limit, v_config.max_requests))::BOOLEAN,
        GREATEST(0, COALESCE(v_config.burst_limit, v_config.max_requests) - v_current_count),
        v_window_start + (v_config.window_seconds || ' seconds')::INTERVAL;
END;
$$;


ALTER FUNCTION "public"."check_rate_limit"("p_key" "text", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_schedule_conflicts"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_conflict_count INTEGER;
BEGIN
    -- Check for time off conflicts
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.time_off_requests
    WHERE employee_id = NEW.employee_id
    AND status = 'Approved'
    AND NEW.date BETWEEN start_date AND end_date;

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Schedule conflicts with approved time off';
    END IF;

    -- Check for overlapping shifts
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.schedules s
    JOIN public.shifts sh ON s.shift_id = sh.id
    WHERE s.employee_id = NEW.employee_id
    AND s.date = NEW.date
    AND s.id != NEW.id;

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Employee already scheduled for this date';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_schedule_conflicts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_storage_quota_status"("p_component" "text") RETURNS TABLE("current_size_bytes" integer, "max_size_bytes" integer, "usage_percentage" double precision, "needs_cleanup" boolean, "last_cleanup" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        sq.current_size_bytes,
        sq.max_size_bytes,
        CASE
            WHEN sq.max_size_bytes > 0 
            THEN (sq.current_size_bytes::FLOAT / sq.max_size_bytes::FLOAT * 100)
            ELSE 0
        END as usage_percentage,
        CASE
            WHEN sq.current_size_bytes >= (sq.max_size_bytes * sq.quota_alert_threshold)
            THEN TRUE
            ELSE FALSE
        END as needs_cleanup,
        sq.last_cleanup
    FROM public.storage_quotas sq
    WHERE component = p_component;
END;
$$;


ALTER FUNCTION "public"."check_storage_quota_status"("p_component" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_error_analytics_data"("p_component" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_config public.error_analytics_config%ROWTYPE;
BEGIN
    -- Get config for component
    SELECT * INTO v_config
    FROM public.error_analytics_config
    WHERE component = p_component;

    -- Delete old data
    DELETE FROM public.error_analytics_data
    WHERE component = p_component
    AND timestamp < NOW() - (COALESCE(v_config.retention_days, 30) || ' days')::INTERVAL;

    -- Cleanup old trends
    DELETE FROM public.error_analytics_trends
    WHERE component = p_component
    AND last_seen < NOW() - (COALESCE(v_config.retention_days, 30) || ' days')::INTERVAL;
END;
$$;


ALTER FUNCTION "public"."cleanup_error_analytics_data"("p_component" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_error_analytics_storage"("p_component" "text", "p_older_than_days" integer DEFAULT 30) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_deleted_count INTEGER;
    v_freed_bytes INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM public.error_analytics_storage
        WHERE component = p_component
        AND (
            (last_accessed < NOW() - (retention_days || ' days')::INTERVAL)
            OR
            (last_accessed < NOW() - (p_older_than_days || ' days')::INTERVAL)
        )
        RETURNING size_bytes
    )
    SELECT COUNT(*), COALESCE(SUM(size_bytes), 0)
    INTO v_deleted_count, v_freed_bytes
    FROM deleted;

    -- Update quota usage
    UPDATE public.storage_quotas
    SET current_size_bytes = GREATEST(0, current_size_bytes - v_freed_bytes),
        last_cleanup = NOW()
    WHERE component = p_component;

    RETURN v_deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_error_analytics_storage"("p_component" "text", "p_older_than_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."column_exists"("p_table" "text", "p_column" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = p_table
        AND column_name = p_column
    );
END;
$$;


ALTER FUNCTION "public"."column_exists"("p_table" "text", "p_column" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."commit_transaction"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  commit;
end;
$$;


ALTER FUNCTION "public"."commit_transaction"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."commit_transaction"() IS 'Commits the current database transaction';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."employee_operations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "employee_id" "uuid",
    "operation" "public"."employee_operation" NOT NULL,
    "severity" "public"."operation_severity" DEFAULT 'LOW'::"public"."operation_severity" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_code" "text",
    "error_details" "text",
    "stack_trace" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "client_info" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "retry_count" integer DEFAULT 0,
    "last_retry_at" timestamp with time zone,
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'retrying'::"text"])))
);


ALTER TABLE "public"."employee_operations" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_employee_operation"("p_operation_id" "uuid", "p_status" "text" DEFAULT 'completed'::"text", "p_error_code" "text" DEFAULT NULL::"text", "p_error_details" "text" DEFAULT NULL::"text", "p_stack_trace" "text" DEFAULT NULL::"text") RETURNS "public"."employee_operations"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_operation public.employee_operations;
BEGIN
    UPDATE public.employee_operations
    SET status = p_status,
        error_code = p_error_code,
        error_details = p_error_details,
        stack_trace = p_stack_trace,
        updated_at = NOW(),
        retry_count = CASE 
            WHEN p_status = 'retrying' 
            THEN retry_count + 1 
            ELSE retry_count 
        END,
        last_retry_at = CASE 
            WHEN p_status = 'retrying' 
            THEN NOW() 
            ELSE last_retry_at 
        END
    WHERE id = p_operation_id
    RETURNING * INTO v_operation;

    RETURN v_operation;
END;
$$;


ALTER FUNCTION "public"."complete_employee_operation"("p_operation_id" "uuid", "p_status" "text", "p_error_code" "text", "p_error_details" "text", "p_stack_trace" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedule_operations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "schedule_id" "uuid" NOT NULL,
    "operation" "public"."schedule_operation" NOT NULL,
    "previous_state" "jsonb",
    "new_state" "jsonb",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_details" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'rolled_back'::"text"])))
);


ALTER TABLE "public"."schedule_operations" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_schedule_operation"("p_operation_id" "uuid", "p_status" "text" DEFAULT 'completed'::"text", "p_error_details" "text" DEFAULT NULL::"text") RETURNS "public"."schedule_operations"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_operation public.schedule_operations;
BEGIN
    -- Update operation status
    UPDATE public.schedule_operations
    SET status = p_status,
        error_details = p_error_details,
        updated_at = NOW()
    WHERE id = p_operation_id
    RETURNING * INTO v_operation;

    -- If operation failed, update schedule status
    IF p_status = 'failed' THEN
        UPDATE public.schedules
        SET status = CASE
            WHEN v_operation.operation = 'PUBLISH' THEN 'draft'::schedule_status
            WHEN v_operation.operation = 'UNPUBLISH' THEN 'published'::schedule_status
            ELSE status
        END
        WHERE id = v_operation.schedule_id;
    END IF;

    RETURN v_operation;
END;
$$;


ALTER FUNCTION "public"."complete_schedule_operation"("p_operation_id" "uuid", "p_status" "text", "p_error_details" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."convert_time_between_zones"("p_time" time without time zone, "p_source_timezone" "text", "p_target_timezone" "text") RETURNS time without time zone
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    v_timestamp TIMESTAMP;
    v_converted TIME;
BEGIN
    -- Validate timezones
    IF NOT public.is_valid_timezone(p_source_timezone) THEN
        RAISE EXCEPTION 'Invalid source timezone: %', p_source_timezone;
    END IF;
    
    IF NOT public.is_valid_timezone(p_target_timezone) THEN
        RAISE EXCEPTION 'Invalid target timezone: %', p_target_timezone;
    END IF;

    -- Use current date for the conversion
    v_timestamp := (CURRENT_DATE || ' ' || p_time)::TIMESTAMP;
    
    -- Convert between timezones
    v_converted := (v_timestamp AT TIME ZONE p_source_timezone AT TIME ZONE p_target_timezone)::TIME;
    
    RETURN v_converted;
END;
$$;


ALTER FUNCTION "public"."convert_time_between_zones"("p_time" time without time zone, "p_source_timezone" "text", "p_target_timezone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."convert_timezone"("p_timestamp" timestamp with time zone, "p_target_zone" "text", "p_config_name" "text" DEFAULT 'default'::"text") RETURNS timestamp with time zone
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    v_policy timezone_policy;
BEGIN
    -- Get policy
    SELECT policy INTO v_policy
    FROM public.timezone_configs
    WHERE name = p_config_name;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Timezone config % not found', p_config_name;
    END IF;

    -- Validate target zone
    IF NOT p_target_zone = ANY(v_policy.allowed_zones) THEN
        RAISE EXCEPTION 'Timezone % is not allowed', p_target_zone;
    END IF;

    -- Convert timestamp
    RETURN p_timestamp AT TIME ZONE p_target_zone;
END;
$$;


ALTER FUNCTION "public"."convert_timezone"("p_timestamp" timestamp with time zone, "p_target_zone" "text", "p_config_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_audit_log"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        changed_by,
        client_info
    ) VALUES (
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        CASE
            WHEN TG_OP = 'INSERT' THEN NULL
            ELSE to_jsonb(OLD)
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN NULL
            ELSE to_jsonb(NEW)
        END,
        auth.uid(),
        jsonb_build_object(
            'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
            'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."create_audit_log"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_employee"("employee_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
declare
  user_has_permission boolean;
begin
  -- Verify caller has permission
  select exists (
    select 1 
    from public.employees 
    where id = auth.uid() 
    and user_role in ('Admin', 'Manager')
  ) into user_has_permission;

  if not user_has_permission then
    raise exception 'Permission denied';
  end if;

  -- Begin transaction
  -- Delete related records first
  delete from public.schedules where employee_id = $1;
  delete from public.time_off_requests where employee_id = $1;
  
  -- Delete employee profile
  delete from public.profiles where id = $1;
  
  -- Delete employee record
  delete from public.employees where id = $1;

  -- Note: auth.users deletion should be handled by a trigger or separate process
  -- as it requires special permissions
end;
$_$;


ALTER FUNCTION "public"."delete_employee"("employee_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."delete_employee"("employee_id" "uuid") IS 'Deletes an employee and all related records';



CREATE OR REPLACE FUNCTION "public"."down_20240328000001"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- Drop table first (due to dependencies)
  drop table if exists public.time_off_requests;
  
  -- Drop policies
  drop policy if exists "Users can view their own time-off requests" on public.time_off_requests;
  drop policy if exists "Users can insert their own time-off requests" on public.time_off_requests;
  drop policy if exists "Users can update their own pending time-off requests" on public.time_off_requests;
  drop policy if exists "Only managers can delete time-off requests" on public.time_off_requests;
  
  -- Drop functions
  drop function if exists public.validate_time_off_request(uuid, date, date, text, text);
  drop function if exists public.can_manage_time_off_requests(uuid);
  
  -- Drop existing functions
  drop trigger if exists on_employee_deleted on public.employees;
  drop function if exists public.handle_deleted_user();
  drop function if exists public.delete_employee(uuid);
  drop function if exists public.check_employee_dependencies(uuid);
  drop function if exists public.begin_transaction();
  drop function if exists public.commit_transaction();
  drop function if exists public.rollback_transaction();
  
  -- Drop the down migration function itself
  drop function down_20240328000001();
end;
$$;


ALTER FUNCTION "public"."down_20240328000001"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."down_20240328000002"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  drop function if exists public.validate_shift_assignment(uuid, uuid, date);
  drop function if exists public.get_available_shifts(uuid, date);
  drop function down_20240328000002();
end;
$$;


ALTER FUNCTION "public"."down_20240328000002"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_schedule"("p_start_date" "date", "p_end_date" "date", "p_department_id" "uuid", "p_environment" "text" DEFAULT "current_setting"('app.environment'::"text", true)) RETURNS TABLE("schedule_id" "uuid", "metrics" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_constraints JSONB;
    v_start_time TIMESTAMPTZ;
    v_schedule_id UUID;
    v_metrics JSONB;
    v_error TEXT;
BEGIN
    -- Get constraints
    SELECT config_value INTO v_constraints
    FROM scheduler_config
    WHERE config_key = 'scheduler_constraints'
    AND environment = p_environment
    AND is_active = true;

    -- Record start time
    v_start_time := clock_timestamp();

    -- Start transaction
    BEGIN
        -- Generate schedule
        INSERT INTO schedules (
            department_id,
            start_date,
            end_date,
            status,
            created_at,
            environment
        )
        VALUES (
            p_department_id,
            p_start_date,
            p_end_date,
            'pending',
            NOW(),
            p_environment
        )
        RETURNING id INTO v_schedule_id;

        -- Record metrics
        v_metrics := jsonb_build_object(
            'generation_time_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000,
            'start_date', p_start_date,
            'end_date', p_end_date,
            'department_id', p_department_id,
            'constraints', v_constraints
        );

        -- Record success metrics
        PERFORM record_scheduler_metrics(
            'schedule_generation',
            v_metrics,
            p_environment
        );

        -- Return results
        RETURN QUERY
        SELECT v_schedule_id, v_metrics;

    EXCEPTION WHEN OTHERS THEN
        -- Record error
        v_error := SQLERRM;
        
        -- Record error metrics
        PERFORM record_scheduler_metrics(
            'schedule_generation_error',
            jsonb_build_object(
                'error', v_error,
                'generation_time_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000,
                'start_date', p_start_date,
                'end_date', p_end_date,
                'department_id', p_department_id
            ),
            p_environment
        );

        -- Re-raise the error
        RAISE;
    END;
END;
$$;


ALTER FUNCTION "public"."generate_schedule"("p_start_date" "date", "p_end_date" "date", "p_department_id" "uuid", "p_environment" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_auth_error_history"("p_user_id" "uuid" DEFAULT NULL::"uuid", "p_action" "text" DEFAULT NULL::"text", "p_start_time" timestamp with time zone DEFAULT ("now"() - '24:00:00'::interval), "p_end_time" timestamp with time zone DEFAULT "now"()) RETURNS TABLE("error_id" "uuid", "user_id" "uuid", "action_type" "text", "error_code" "text", "error_message" "text", "error_details" "jsonb", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ae.id as error_id,
        ae.user_id,
        ae.action_type,
        ae.error_code,
        ae.error_message,
        ae.error_details,
        ae.created_at
    FROM public.auth_errors ae
    WHERE (p_user_id IS NULL OR ae.user_id = p_user_id)
    AND (p_action IS NULL OR ae.action_type = p_action)
    AND ae.created_at BETWEEN p_start_time AND p_end_time
    ORDER BY ae.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_auth_error_history"("p_user_id" "uuid", "p_action" "text", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_available_shifts"("p_employee_id" "uuid", "p_date" "date") RETURNS TABLE("shift_id" "uuid", "shift_type_id" "uuid", "start_time" time without time zone, "end_time" time without time zone, "duration_hours" integer, "validation" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  select 
    s.id as shift_id,
    s.shift_type_id,
    s.start_time,
    s.end_time,
    s.duration_hours,
    public.validate_shift_assignment(p_employee_id, s.id, p_date) as validation
  from public.shifts s
  where exists (
    select 1
    from public.staffing_requirements sr
    where sr.start_time <= s.start_time
    and sr.end_time >= s.end_time
  )
  order by s.start_time;
end;
$$;


ALTER FUNCTION "public"."get_available_shifts"("p_employee_id" "uuid", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_component_error_metrics"("p_component" "text", "p_time_window" interval DEFAULT '24:00:00'::interval) RETURNS TABLE("error_count" integer, "recovery_attempts" integer, "successful_recoveries" integer, "recovery_rate" numeric, "last_error" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.error_count,
        e.recovery_attempts,
        e.successful_recoveries,
        CASE 
            WHEN e.recovery_attempts > 0 
            THEN (e.successful_recoveries::NUMERIC / e.recovery_attempts::NUMERIC * 100)
            ELSE 0
        END as recovery_rate,
        e.last_error
    FROM public.error_metrics e
    WHERE e.component = p_component
        AND (e.last_error IS NULL OR e.last_error > NOW() - p_time_window);
END;
$$;


ALTER FUNCTION "public"."get_component_error_metrics"("p_component" "text", "p_time_window" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_cookie_success_rate"("p_cookie_name" "text", "p_operation" "text" DEFAULT NULL::"text", "p_time_window" interval DEFAULT '24:00:00'::interval) RETURNS TABLE("total_operations" bigint, "successful_operations" bigint, "success_rate" numeric, "avg_duration_ms" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_operations,
        COUNT(*) FILTER (WHERE success)::BIGINT as successful_operations,
        (COUNT(*) FILTER (WHERE success)::NUMERIC / COUNT(*)::NUMERIC * 100) as success_rate,
        AVG(duration_ms)::NUMERIC as avg_duration_ms
    FROM public.cookie_metrics
    WHERE cookie_name = p_cookie_name
        AND (p_operation IS NULL OR operation = p_operation)
        AND created_at > NOW() - p_time_window;
END;
$$;


ALTER FUNCTION "public"."get_cookie_success_rate"("p_cookie_name" "text", "p_operation" "text", "p_time_window" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_employees"("p_search_term" "text" DEFAULT NULL::"text", "p_role" "public"."employee_role" DEFAULT NULL::"public"."employee_role", "p_team_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("user_id" "uuid", "email" "text", "full_name" "text", "role" "public"."employee_role", "team_id" "uuid", "team_name" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_user_role TEXT;
BEGIN
    -- Get current user and role
    v_user_id := auth.uid();
    SELECT raw_user_meta_data->>'role'
    INTO v_user_role
    FROM auth.users
    WHERE id = v_user_id;

    -- Log access attempt
    PERFORM public.log_employee_access(
        NULL,
        'LIST',
        jsonb_build_object(
            'search_term', p_search_term,
            'role_filter', p_role,
            'team_filter', p_team_id
        )
    );

    RETURN QUERY
    SELECT 
        e.id,
        e.email,
        e.full_name,
        e.employee_role,
        e.team_id,
        t.name as team_name,
        e.created_at,
        e.updated_at
    FROM public.employees e
    LEFT JOIN public.teams t ON e.team_id = t.id
    WHERE 
        -- Access control based on role
        CASE 
            WHEN v_user_role = 'ADMIN' THEN TRUE
            WHEN v_user_role = 'MANAGER' THEN 
                e.team_id IN (
                    SELECT team_id 
                    FROM public.employees 
                    WHERE id = v_user_id
                )
            ELSE e.id = v_user_id
        END
        -- Apply filters
        AND (p_search_term IS NULL OR 
            e.full_name ILIKE '%' || p_search_term || '%' OR 
            e.email ILIKE '%' || p_search_term || '%')
        AND (p_role IS NULL OR e.employee_role = p_role)
        AND (p_team_id IS NULL OR e.team_id = p_team_id)
    ORDER BY e.full_name;
END;
$$;


ALTER FUNCTION "public"."get_employees"("p_search_term" "text", "p_role" "public"."employee_role", "p_team_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_error_action_history"("p_path" "text" DEFAULT NULL::"text", "p_start_time" timestamp with time zone DEFAULT ("now"() - '24:00:00'::interval), "p_end_time" timestamp with time zone DEFAULT "now"()) RETURNS TABLE("action" "text", "path" "text", "user_id" "uuid", "action_timestamp" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ea.action,
        ea.path,
        ea.user_id,
        ea.action_timestamp,
        ea.metadata
    FROM public.error_actions ea
    WHERE (p_path IS NULL OR ea.path = p_path)
    AND ea.action_timestamp BETWEEN p_start_time AND p_end_time
    ORDER BY ea.action_timestamp DESC;
END;
$$;


ALTER FUNCTION "public"."get_error_action_history"("p_path" "text", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_error_analytics_data"("p_component" "text", "p_storage_key" "text") RETURNS TABLE("data" "jsonb", "size_bytes" integer, "last_accessed" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    UPDATE public.error_analytics_storage
    SET last_accessed = NOW()
    WHERE component = p_component
    AND storage_key = p_storage_key
    RETURNING data, size_bytes, last_accessed;
END;
$$;


ALTER FUNCTION "public"."get_error_analytics_data"("p_component" "text", "p_storage_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_error_http_code"("p_error_code" "text") RETURNS integer
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT http_code
        FROM public.error_status_codes
        WHERE error_code = p_error_code
    );
END;
$$;


ALTER FUNCTION "public"."get_error_http_code"("p_error_code" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jwt_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "algorithm" "public"."jwt_algorithm" DEFAULT 'RS256'::"public"."jwt_algorithm" NOT NULL,
    "template" "jsonb" NOT NULL,
    "max_age_seconds" integer DEFAULT 3600 NOT NULL,
    "allowed_issuers" "text"[] DEFAULT ARRAY['supabase'::"text"],
    "required_claims" "text"[] DEFAULT ARRAY['sub'::"text", 'exp'::"text", 'iat'::"text"],
    "custom_claims" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "version" integer DEFAULT 1 NOT NULL,
    CONSTRAINT "valid_custom_claims" CHECK (("jsonb_typeof"("custom_claims") = 'object'::"text")),
    CONSTRAINT "valid_template_json" CHECK (("jsonb_typeof"("template") = 'object'::"text"))
);


ALTER TABLE "public"."jwt_templates" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_jwt_template"("template_name" "text") RETURNS "public"."jwt_templates"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    template public.jwt_templates;
BEGIN
    SELECT *
    INTO template
    FROM public.jwt_templates
    WHERE name = template_name
    AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'JWT template % not found or inactive', template_name;
    END IF;

    RETURN template;
END;
$$;


ALTER FUNCTION "public"."get_jwt_template"("template_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pattern_action_history"("p_pattern_id" "uuid" DEFAULT NULL::"uuid", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_action_type" "public"."pattern_action_type" DEFAULT NULL::"public"."pattern_action_type", "p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("action_id" "uuid", "action_type" "public"."pattern_action_type", "pattern_id" "uuid", "user_id" "uuid", "pattern_name" "text", "pattern_type" "text", "error_message" "text", "error_code" "text", "metadata" "jsonb", "created_at" timestamp with time zone, "client_info" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.id as action_id,
        pa.action_type,
        pa.pattern_id,
        pa.user_id,
        pa.pattern_name,
        pa.pattern_type,
        pa.error_message,
        pa.error_code,
        pa.metadata,
        pa.created_at,
        pa.client_info
    FROM public.pattern_actions pa
    WHERE (p_pattern_id IS NULL OR pa.pattern_id = p_pattern_id)
    AND (p_user_id IS NULL OR pa.user_id = p_user_id)
    AND (p_action_type IS NULL OR pa.action_type = p_action_type)
    AND (p_start_date IS NULL OR pa.created_at >= p_start_date)
    AND (p_end_date IS NULL OR pa.created_at <= p_end_date)
    ORDER BY pa.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_pattern_action_history"("p_pattern_id" "uuid", "p_user_id" "uuid", "p_action_type" "public"."pattern_action_type", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pattern_violations"("start_date" "date") RETURNS TABLE("employee_id" "uuid", "violation_type" "text", "violation_date" "date", "details" "text")
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."get_pattern_violations"("start_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_rate_limit_metrics"("p_key" "text", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_window_start" timestamp with time zone DEFAULT ("now"() - '24:00:00'::interval)) RETURNS TABLE("window_start" timestamp with time zone, "request_count" integer, "last_request" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rm.window_start,
        rm.request_count,
        rm.last_request
    FROM public.rate_limit_metrics rm
    WHERE rm.key = p_key
    AND (p_user_id IS NULL OR rm.user_id = p_user_id)
    AND rm.window_start >= p_window_start
    ORDER BY rm.window_start DESC;
END;
$$;


ALTER FUNCTION "public"."get_rate_limit_metrics"("p_key" "text", "p_user_id" "uuid", "p_window_start" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_scheduler_config"("p_config_key" "text", "p_environment" "text" DEFAULT "current_setting"('app.environment'::"text", true)) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_config_value JSONB;
BEGIN
    SELECT config_value
    INTO v_config_value
    FROM scheduler_config
    WHERE config_key = p_config_key
    AND environment = p_environment
    AND is_active = true;

    IF v_config_value IS NULL THEN
        RAISE EXCEPTION 'Configuration not found for key: % in environment: %', p_config_key, p_environment;
    END IF;

    RETURN v_config_value;
END;
$$;


ALTER FUNCTION "public"."get_scheduler_config"("p_config_key" "text", "p_environment" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_scheduler_metrics_history"("p_metrics_type" "text", "p_environment" "text" DEFAULT "current_setting"('app.environment'::"text", true), "p_start_date" timestamp with time zone DEFAULT ("now"() - '24:00:00'::interval), "p_end_date" timestamp with time zone DEFAULT "now"()) RETURNS TABLE("metrics_type" "text", "metrics_value" "jsonb", "measured_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.metrics_type,
        m.metrics_value,
        m.measured_at
    FROM scheduler_metrics_history m
    WHERE m.metrics_type = p_metrics_type
    AND m.environment = p_environment
    AND m.measured_at BETWEEN p_start_date AND p_end_date
    ORDER BY m.measured_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_scheduler_metrics_history"("p_metrics_type" "text", "p_environment" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_time_off_access_level"("p_user_id" "uuid") RETURNS "public"."time_off_access_level"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_role TEXT;
    v_access_level time_off_access_level;
BEGIN
    -- Get user's role from metadata
    SELECT raw_user_meta_data->>'role'
    INTO v_user_role
    FROM auth.users
    WHERE id = p_user_id;

    -- Determine access level based on role
    CASE v_user_role
        WHEN 'ADMIN' THEN
            v_access_level := 'ALL';
        WHEN 'MANAGER' THEN
            v_access_level := 'TEAM';
        ELSE
            v_access_level := 'SELF';
    END CASE;

    RETURN v_access_level;
END;
$$;


ALTER FUNCTION "public"."get_time_off_access_level"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_time_off_requests"("p_user_id" "uuid" DEFAULT NULL::"uuid", "p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date") RETURNS TABLE("id" "uuid", "employee_id" "uuid", "employee_name" "text", "employee_email" "text", "start_date" "date", "end_date" "date", "request_type" "text", "status" "text", "notes" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_access_level time_off_access_level;
    v_requesting_user_id UUID;
    v_team_id UUID;
BEGIN
    -- Get current user ID if not provided
    v_requesting_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Get user's access level
    v_access_level := public.get_time_off_access_level(v_requesting_user_id);
    
    -- Log access attempt
    PERFORM public.log_time_off_access(
        v_requesting_user_id,
        p_user_id,
        v_access_level
    );

    RETURN QUERY
    WITH filtered_requests AS (
        SELECT 
            r.id,
            r.employee_id,
            e.full_name as employee_name,
            CASE
                -- Show email only if user has appropriate access
                WHEN public.can_access_user_data(v_requesting_user_id, r.employee_id) THEN e.email
                ELSE NULL
            END as employee_email,
            r.start_date,
            r.end_date,
            r.request_type,
            r.status,
            r.notes,
            r.created_at,
            r.updated_at
        FROM public.time_off_requests r
        JOIN public.employees e ON r.employee_id = e.user_id
        WHERE 
            -- Date range filter if provided
            (p_start_date IS NULL OR r.start_date >= p_start_date) AND
            (p_end_date IS NULL OR r.end_date <= p_end_date) AND
            -- Access control based on level
            CASE 
                WHEN v_access_level = 'ALL' THEN TRUE
                WHEN v_access_level = 'TEAM' THEN EXISTS (
                    SELECT 1 FROM public.employees e2 
                    WHERE e2.user_id = r.employee_id 
                    AND e2.team_id = (
                        SELECT team_id FROM public.employees 
                        WHERE user_id = v_requesting_user_id
                    )
                )
                ELSE r.employee_id = v_requesting_user_id
            END
    )
    SELECT * FROM filtered_requests
    ORDER BY start_date DESC;
END;
$$;


ALTER FUNCTION "public"."get_time_off_requests"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_auth_history"("p_user_id" "uuid", "p_time_window" interval DEFAULT '30 days'::interval) RETURNS TABLE("event_type" "text", "event_count" bigint, "last_occurrence" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.event_type,
        COUNT(*)::BIGINT as event_count,
        MAX(e.created_at) as last_occurrence
    FROM public.auth_events e
    WHERE e.user_id = p_user_id
        AND e.created_at > NOW() - p_time_window
    GROUP BY e.event_type
    ORDER BY last_occurrence DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_auth_history"("p_user_id" "uuid", "p_time_window" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_week_number"("p_date" "date", "p_timezone" "text" DEFAULT 'UTC'::"text") RETURNS integer
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    v_timestamp TIMESTAMP;
    v_iso_week INTEGER;
BEGIN
    -- Validate timezone
    IF NOT public.is_valid_timezone(p_timezone) THEN
        RAISE EXCEPTION 'Invalid timezone: %', p_timezone;
    END IF;

    -- Convert to timestamp in the specified timezone
    v_timestamp := p_date::TIMESTAMP AT TIME ZONE p_timezone;
    
    -- Extract ISO week number
    v_iso_week := EXTRACT(WEEK FROM v_timestamp);
    
    RETURN v_iso_week;
END;
$$;


ALTER FUNCTION "public"."get_week_number"("p_date" "date", "p_timezone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_deleted_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Delete auth user if exists
  -- This requires proper permissions set up
  delete from auth.users where id = old.id;
  return old;
end;
$$;


ALTER FUNCTION "public"."handle_deleted_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_valid_cookie_name"("p_cookie_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $_$
BEGIN
    -- Check if cookie name follows RFC 6265
    RETURN p_cookie_name ~ '^[a-zA-Z0-9!#$%&''*+\-.^_`|~]+$'
        AND length(p_cookie_name) <= 4096;
END;
$_$;


ALTER FUNCTION "public"."is_valid_cookie_name"("p_cookie_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_valid_cookie_value"("p_cookie_value" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $_$
BEGIN
    -- Check if cookie value follows RFC 6265
    RETURN p_cookie_value ~ '^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]*$'
        AND length(p_cookie_value) <= 4096;
END;
$_$;


ALTER FUNCTION "public"."is_valid_cookie_value"("p_cookie_value" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_valid_timezone"("p_timezone" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM pg_timezone_names
        WHERE name = p_timezone
    );
END;
$$;


ALTER FUNCTION "public"."is_valid_timezone"("p_timezone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_auth_error"("p_user_id" "uuid", "p_action" "text", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb" DEFAULT '{}'::"jsonb", "p_ip_address" "text" DEFAULT NULL::"text", "p_user_agent" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_error_id UUID;
BEGIN
    INSERT INTO public.auth_errors (
        user_id,
        action_type,
        error_code,
        error_message,
        error_details,
        ip_address,
        user_agent
    )
    VALUES (
        p_user_id,
        p_action,
        p_error_code,
        p_error_message,
        p_error_details,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_error_id;

    RETURN v_error_id;
END;
$$;


ALTER FUNCTION "public"."log_auth_error"("p_user_id" "uuid", "p_action" "text", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_ip_address" "text", "p_user_agent" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_auth_error"("p_error_type" "public"."auth_error_type", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb" DEFAULT NULL::"jsonb", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_session_id" "uuid" DEFAULT NULL::"uuid", "p_severity" "public"."auth_error_severity" DEFAULT 'MEDIUM'::"public"."auth_error_severity") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_error_id UUID;
    v_ip_address TEXT;
    v_user_agent TEXT;
BEGIN
    -- Get client info from request
    v_ip_address := current_setting('request.headers', true)::jsonb->>'x-forwarded-for';
    v_user_agent := current_setting('request.headers', true)::jsonb->>'user-agent';

    -- Insert error log
    INSERT INTO public.auth_error_logs (
        error_type,
        error_code,
        error_message,
        error_details,
        severity,
        user_id,
        session_id,
        ip_address,
        user_agent
    )
    VALUES (
        p_error_type,
        p_error_code,
        p_error_message,
        p_error_details,
        p_severity,
        p_user_id,
        p_session_id,
        v_ip_address,
        v_user_agent
    )
    RETURNING id INTO v_error_id;

    RETURN v_error_id;
END;
$$;


ALTER FUNCTION "public"."log_auth_error"("p_error_type" "public"."auth_error_type", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_user_id" "uuid", "p_session_id" "uuid", "p_severity" "public"."auth_error_severity") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_auth_event"("p_event_type" "text", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_metadata" "jsonb" DEFAULT NULL::"jsonb", "p_client_info" "jsonb" DEFAULT NULL::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO public.auth_events (
        event_type,
        user_id,
        metadata,
        client_info
    )
    VALUES (
        p_event_type,
        p_user_id,
        p_metadata,
        p_client_info
    )
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$;


ALTER FUNCTION "public"."log_auth_event"("p_event_type" "text", "p_user_id" "uuid", "p_metadata" "jsonb", "p_client_info" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_auth_event"("p_event_type" "text", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_metadata" "jsonb" DEFAULT NULL::"jsonb", "p_success" boolean DEFAULT true, "p_error_id" "uuid" DEFAULT NULL::"uuid", "p_session_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_id UUID;
    v_ip_address TEXT;
    v_user_agent TEXT;
BEGIN
    -- Get client info from request
    v_ip_address := current_setting('request.headers', true)::jsonb->>'x-forwarded-for';
    v_user_agent := current_setting('request.headers', true)::jsonb->>'user-agent';

    -- Insert event log
    INSERT INTO public.auth_event_logs (
        event_type,
        user_id,
        metadata,
        success,
        error_id,
        session_id,
        ip_address,
        user_agent
    )
    VALUES (
        p_event_type,
        p_user_id,
        p_metadata,
        p_success,
        p_error_id,
        p_session_id,
        v_ip_address,
        v_user_agent
    )
    RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$;


ALTER FUNCTION "public"."log_auth_event"("p_event_type" "text", "p_user_id" "uuid", "p_metadata" "jsonb", "p_success" boolean, "p_error_id" "uuid", "p_session_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_confirmation_attempt"("p_email" "text", "p_type" "text", "p_token_hash" "text", "p_ip_address" "text", "p_user_agent" "text", "p_success" boolean, "p_error_message" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_attempt_id UUID;
BEGIN
    INSERT INTO public.auth_confirmation_attempts (
        email,
        type,
        token_hash,
        ip_address,
        user_agent,
        success,
        error_message
    )
    VALUES (
        p_email,
        p_type,
        p_token_hash,
        p_ip_address,
        p_user_agent,
        p_success,
        p_error_message
    )
    RETURNING id INTO v_attempt_id;

    RETURN v_attempt_id;
END;
$$;


ALTER FUNCTION "public"."log_confirmation_attempt"("p_email" "text", "p_type" "text", "p_token_hash" "text", "p_ip_address" "text", "p_user_agent" "text", "p_success" boolean, "p_error_message" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_cookie_error"("p_error_type" "text", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_cookie_name" "text", "p_cookie_operation" "text", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_session_id" "uuid" DEFAULT NULL::"uuid", "p_request_path" "text" DEFAULT NULL::"text", "p_request_method" "text" DEFAULT NULL::"text", "p_ip_address" "text" DEFAULT NULL::"text", "p_user_agent" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_error_id UUID;
BEGIN
    INSERT INTO public.cookie_errors (
        error_type,
        error_code,
        error_message,
        error_details,
        cookie_name,
        cookie_operation,
        user_id,
        session_id,
        request_path,
        request_method,
        ip_address,
        user_agent
    )
    VALUES (
        p_error_type,
        p_error_code,
        p_error_message,
        p_error_details,
        p_cookie_name,
        p_cookie_operation,
        p_user_id,
        p_session_id,
        p_request_path,
        p_request_method,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_error_id;
    
    RETURN v_error_id;
END;
$$;


ALTER FUNCTION "public"."log_cookie_error"("p_error_type" "text", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_cookie_name" "text", "p_cookie_operation" "text", "p_user_id" "uuid", "p_session_id" "uuid", "p_request_path" "text", "p_request_method" "text", "p_ip_address" "text", "p_user_agent" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_cookie_metric"("p_cookie_name" "text", "p_operation" "text", "p_success" boolean, "p_duration_ms" integer DEFAULT NULL::integer, "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_session_id" "uuid" DEFAULT NULL::"uuid", "p_request_path" "text" DEFAULT NULL::"text", "p_request_method" "text" DEFAULT NULL::"text", "p_user_agent" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_metric_id UUID;
BEGIN
    INSERT INTO public.cookie_metrics (
        cookie_name,
        operation,
        success,
        duration_ms,
        user_id,
        session_id,
        request_path,
        request_method,
        user_agent
    )
    VALUES (
        p_cookie_name,
        p_operation,
        p_success,
        p_duration_ms,
        p_user_id,
        p_session_id,
        p_request_path,
        p_request_method,
        p_user_agent
    )
    RETURNING id INTO v_metric_id;
    
    RETURN v_metric_id;
END;
$$;


ALTER FUNCTION "public"."log_cookie_metric"("p_cookie_name" "text", "p_operation" "text", "p_success" boolean, "p_duration_ms" integer, "p_user_id" "uuid", "p_session_id" "uuid", "p_request_path" "text", "p_request_method" "text", "p_user_agent" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_employee_access"("p_accessed_employee_id" "uuid", "p_action_type" "text", "p_success" boolean DEFAULT true, "p_error_message" "text" DEFAULT NULL::"text", "p_client_info" "jsonb" DEFAULT NULL::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.employee_access_logs (
        accessor_id,
        accessed_employee_id,
        action_type,
        success,
        error_message,
        client_info
    ) VALUES (
        auth.uid(),
        p_accessed_employee_id,
        p_action_type,
        p_success,
        p_error_message,
        p_client_info
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;


ALTER FUNCTION "public"."log_employee_access"("p_accessed_employee_id" "uuid", "p_action_type" "text", "p_success" boolean, "p_error_message" "text", "p_client_info" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_error_action"("p_action" "text", "p_path" "text", "p_timestamp" timestamp with time zone DEFAULT "now"(), "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_action_id UUID;
BEGIN
    INSERT INTO public.error_actions (
        action,
        path,
        user_id,
        action_timestamp,
        metadata
    )
    VALUES (
        p_action,
        p_path,
        auth.uid(),
        p_timestamp,
        p_metadata
    )
    RETURNING id INTO v_action_id;

    RETURN v_action_id;
END;
$$;


ALTER FUNCTION "public"."log_error_action"("p_action" "text", "p_path" "text", "p_timestamp" timestamp with time zone, "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_error_metrics"("p_component" "text", "p_metrics" "jsonb", "p_error_details" "jsonb" DEFAULT NULL::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_metric_id UUID;
BEGIN
    INSERT INTO public.error_metrics (
        component,
        error_count,
        recovery_attempts,
        successful_recoveries,
        last_error,
        error_details
    )
    VALUES (
        p_component,
        (p_metrics->>'errorCount')::INTEGER,
        (p_metrics->>'recoveryAttempts')::INTEGER,
        (p_metrics->>'successfulRecoveries')::INTEGER,
        CASE 
            WHEN p_metrics->>'lastError' IS NOT NULL 
            THEN (p_metrics->>'lastError')::TIMESTAMPTZ 
            ELSE NULL 
        END,
        p_error_details
    )
    ON CONFLICT (component)
    DO UPDATE SET
        error_count = EXCLUDED.error_count,
        recovery_attempts = EXCLUDED.recovery_attempts,
        successful_recoveries = EXCLUDED.successful_recoveries,
        last_error = EXCLUDED.last_error,
        error_details = EXCLUDED.error_details
    RETURNING id INTO v_metric_id;
    
    RETURN v_metric_id;
END;
$$;


ALTER FUNCTION "public"."log_error_metrics"("p_component" "text", "p_metrics" "jsonb", "p_error_details" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_network_retry_metrics"("p_component" "text", "p_endpoint" "text", "p_metrics" "jsonb", "p_retry_details" "jsonb" DEFAULT NULL::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_metric_id UUID;
BEGIN
    INSERT INTO public.network_retry_metrics (
        component,
        endpoint,
        total_retries,
        successful_retries,
        failed_retries,
        last_retry,
        avg_retry_delay,
        max_retry_delay,
        retry_details
    )
    VALUES (
        p_component,
        p_endpoint,
        (p_metrics->>'totalRetries')::INTEGER,
        (p_metrics->>'successfulRetries')::INTEGER,
        (p_metrics->>'failedRetries')::INTEGER,
        CASE 
            WHEN p_metrics->>'lastRetry' IS NOT NULL 
            THEN (p_metrics->>'lastRetry')::TIMESTAMPTZ 
            ELSE NULL 
        END,
        (p_metrics->>'avgRetryDelay')::NUMERIC,
        (p_metrics->>'maxRetryDelay')::NUMERIC,
        p_retry_details
    )
    ON CONFLICT (component, endpoint)
    DO UPDATE SET
        total_retries = EXCLUDED.total_retries,
        successful_retries = EXCLUDED.successful_retries,
        failed_retries = EXCLUDED.failed_retries,
        last_retry = EXCLUDED.last_retry,
        avg_retry_delay = EXCLUDED.avg_retry_delay,
        max_retry_delay = EXCLUDED.max_retry_delay,
        retry_details = EXCLUDED.retry_details;

    RETURN v_metric_id;
END;
$$;


ALTER FUNCTION "public"."log_network_retry_metrics"("p_component" "text", "p_endpoint" "text", "p_metrics" "jsonb", "p_retry_details" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_pattern_action"("p_action_type" "public"."pattern_action_type", "p_pattern_id" "uuid", "p_pattern_name" "text", "p_pattern_type" "text", "p_error_message" "text" DEFAULT NULL::"text", "p_error_code" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT NULL::"jsonb", "p_client_info" "jsonb" DEFAULT NULL::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_action_id UUID;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    -- Insert action record
    INSERT INTO public.pattern_actions (
        action_type,
        pattern_id,
        user_id,
        pattern_name,
        pattern_type,
        error_message,
        error_code,
        metadata,
        client_info
    ) VALUES (
        p_action_type,
        p_pattern_id,
        v_user_id,
        p_pattern_name,
        p_pattern_type,
        p_error_message,
        p_error_code,
        p_metadata,
        p_client_info
    )
    RETURNING id INTO v_action_id;
    
    RETURN v_action_id;
END;
$$;


ALTER FUNCTION "public"."log_pattern_action"("p_action_type" "public"."pattern_action_type", "p_pattern_id" "uuid", "p_pattern_name" "text", "p_pattern_type" "text", "p_error_message" "text", "p_error_code" "text", "p_metadata" "jsonb", "p_client_info" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_time_off_access"("p_user_id" "uuid", "p_accessed_user_id" "uuid", "p_access_type" "public"."time_off_access_level", "p_client_info" "jsonb" DEFAULT NULL::"jsonb", "p_request_path" "text" DEFAULT NULL::"text", "p_request_method" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.time_off_access_logs (
        user_id,
        accessed_user_id,
        access_type,
        client_info,
        request_path,
        request_method
    ) VALUES (
        p_user_id,
        p_accessed_user_id,
        p_access_type,
        p_client_info,
        p_request_path,
        p_request_method
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;


ALTER FUNCTION "public"."log_time_off_access"("p_user_id" "uuid", "p_accessed_user_id" "uuid", "p_access_type" "public"."time_off_access_level", "p_client_info" "jsonb", "p_request_path" "text", "p_request_method" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."normalize_period_format"("p_period_id" "text", "p_source_format" "public"."period_format" DEFAULT 'HH:MM-HH:MM'::"public"."period_format", "p_target_format" "public"."period_format" DEFAULT 'HH:MM-HH:MM'::"public"."period_format") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    v_start_time TEXT;
    v_end_time TEXT;
    v_normalized TEXT;
BEGIN
    -- Validate input format
    IF NOT public.validate_period_format(p_period_id, p_source_format) THEN
        RAISE EXCEPTION 'Invalid period format: %', p_period_id;
    END IF;

    -- Extract times based on source format
    CASE p_source_format
        WHEN 'HH:MM-HH:MM' THEN
            v_start_time := split_part(p_period_id, '-', 1);
            v_end_time := split_part(p_period_id, '-', 2);
        WHEN 'HH:MM:SS-HH:MM:SS' THEN
            v_start_time := substring(split_part(p_period_id, '-', 1) from 1 for 5);
            v_end_time := substring(split_part(p_period_id, '-', 2) from 1 for 5);
        WHEN 'HHMM-HHMM' THEN
            v_start_time := substring(split_part(p_period_id, '-', 1) from 1 for 2) || ':' || 
                           substring(split_part(p_period_id, '-', 1) from 3 for 2);
            v_end_time := substring(split_part(p_period_id, '-', 2) from 1 for 2) || ':' || 
                         substring(split_part(p_period_id, '-', 2) from 3 for 2);
    END CASE;

    -- Format output based on target format
    CASE p_target_format
        WHEN 'HH:MM-HH:MM' THEN
            v_normalized := v_start_time || '-' || v_end_time;
        WHEN 'HH:MM:SS-HH:MM:SS' THEN
            v_normalized := v_start_time || ':00-' || v_end_time || ':00';
        WHEN 'HHMM-HHMM' THEN
            v_normalized := replace(v_start_time, ':', '') || '-' || replace(v_end_time, ':', '');
    END CASE;

    RETURN v_normalized;
END;
$$;


ALTER FUNCTION "public"."normalize_period_format"("p_period_id" "text", "p_source_format" "public"."period_format", "p_target_format" "public"."period_format") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."period_crosses_midnight"("p_start_time" "text", "p_end_time" "text") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN (
        to_timestamp(p_end_time, 'HH24:MI')::time < 
        to_timestamp(p_start_time, 'HH24:MI')::time
    );
END;
$$;


ALTER FUNCTION "public"."period_crosses_midnight"("p_start_time" "text", "p_end_time" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_overlapping_patterns"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."prevent_overlapping_patterns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_schedule_overlap"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF NOT validate_schedule_overlap(
        NEW.employee_id,
        NEW.period_start,
        NEW.period_end,
        NEW.id
    ) THEN
        RAISE EXCEPTION 'Schedule overlaps with existing schedule'
        USING HINT = 'Please choose different dates';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_schedule_overlap"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_error_analytics_batch"("p_batch_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_config public.error_analytics_config%ROWTYPE;
    v_data public.error_analytics_data%ROWTYPE;
BEGIN
    FOR v_data IN 
        SELECT * FROM public.error_analytics_data 
        WHERE batch_id = p_batch_id 
        AND processed = false
    LOOP
        -- Get config for component
        SELECT * INTO v_config
        FROM public.error_analytics_config
        WHERE component = v_data.component;

        -- Insert or update trend
        INSERT INTO public.error_analytics_trends (
            component,
            error_type,
            count,
            first_seen,
            last_seen,
            contexts,
            user_agents,
            urls
        )
        VALUES (
            v_data.component,
            v_data.error_type,
            1,
            v_data.timestamp,
            v_data.timestamp,
            CASE WHEN v_data.context IS NOT NULL 
                THEN jsonb_build_array(v_data.context)
                ELSE '[]'::jsonb
            END,
            CASE WHEN v_data.user_agent IS NOT NULL 
                THEN jsonb_build_array(v_data.user_agent)
                ELSE '[]'::jsonb
            END,
            CASE WHEN v_data.url IS NOT NULL 
                THEN jsonb_build_array(v_data.url)
                ELSE '[]'::jsonb
            END
        )
        ON CONFLICT (component, error_type)
        DO UPDATE SET
            count = public.error_analytics_trends.count + 1,
            last_seen = v_data.timestamp,
            contexts = (
                SELECT jsonb_agg(value)
                FROM (
                    SELECT DISTINCT value
                    FROM jsonb_array_elements(
                        public.error_analytics_trends.contexts || 
                        CASE WHEN v_data.context IS NOT NULL 
                            THEN jsonb_build_array(v_data.context)
                            ELSE '[]'::jsonb
                        END
                    )
                    LIMIT COALESCE(v_config.max_contexts, 100)
                ) t
            ),
            user_agents = (
                SELECT jsonb_agg(value)
                FROM (
                    SELECT DISTINCT value
                    FROM jsonb_array_elements(
                        public.error_analytics_trends.user_agents || 
                        CASE WHEN v_data.user_agent IS NOT NULL 
                            THEN jsonb_build_array(v_data.user_agent)
                            ELSE '[]'::jsonb
                        END
                    )
                    LIMIT COALESCE(v_config.max_user_agents, 50)
                ) t
            ),
            urls = (
                SELECT jsonb_agg(value)
                FROM (
                    SELECT DISTINCT value
                    FROM jsonb_array_elements(
                        public.error_analytics_trends.urls || 
                        CASE WHEN v_data.url IS NOT NULL 
                            THEN jsonb_build_array(v_data.url)
                            ELSE '[]'::jsonb
                        END
                    )
                    LIMIT COALESCE(v_config.max_urls, 100)
                ) t
            );

        -- Mark data as processed
        UPDATE public.error_analytics_data
        SET processed = true
        WHERE id = v_data.id;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."process_error_analytics_batch"("p_batch_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_scheduler_metrics"("p_metrics_type" "text", "p_metrics_value" "jsonb", "p_environment" "text" DEFAULT "current_setting"('app.environment'::"text", true), "p_measured_at" timestamp with time zone DEFAULT "now"()) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_metrics_id UUID;
BEGIN
    INSERT INTO scheduler_metrics_history (
        metrics_type,
        metrics_value,
        environment,
        measured_at
    )
    VALUES (
        p_metrics_type,
        p_metrics_value,
        p_environment,
        p_measured_at
    )
    RETURNING id INTO v_metrics_id;

    RETURN v_metrics_id;
END;
$$;


ALTER FUNCTION "public"."record_scheduler_metrics"("p_metrics_type" "text", "p_metrics_value" "jsonb", "p_environment" "text", "p_measured_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_auth_error"("p_error_id" "uuid", "p_resolution_details" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.auth_errors
    SET resolved_at = NOW(),
        resolution_details = p_resolution_details
    WHERE id = p_error_id
    AND resolved_at IS NULL;
    
    RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."resolve_auth_error"("p_error_id" "uuid", "p_resolution_details" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rollback_transaction"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  rollback;
end;
$$;


ALTER FUNCTION "public"."rollback_transaction"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."rollback_transaction"() IS 'Rolls back the current database transaction';



CREATE OR REPLACE FUNCTION "public"."save_error_analytics_data"("p_component" "text", "p_storage_key" "text", "p_data" "jsonb", "p_size_bytes" integer) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_storage_id UUID;
    v_current_quota public.storage_quotas%ROWTYPE;
    v_new_total_size INTEGER;
BEGIN
    -- Get or create quota record
    INSERT INTO public.storage_quotas (component)
    VALUES (p_component)
    ON CONFLICT (component) DO UPDATE
    SET updated_at = NOW()
    RETURNING * INTO v_current_quota;

    -- Calculate new total size
    v_new_total_size := v_current_quota.current_size_bytes + p_size_bytes;

    -- Check quota
    IF v_new_total_size > v_current_quota.max_size_bytes THEN
        RAISE EXCEPTION 'Storage quota exceeded for component %', p_component
        USING HINT = 'Consider cleaning up old data or increasing quota';
    END IF;

    -- Insert or update data
    INSERT INTO public.error_analytics_storage (
        component,
        storage_key,
        data,
        size_bytes,
        last_accessed
    )
    VALUES (
        p_component,
        p_storage_key,
        p_data,
        p_size_bytes,
        NOW()
    )
    ON CONFLICT (component, storage_key)
    DO UPDATE SET
        data = EXCLUDED.data,
        size_bytes = EXCLUDED.size_bytes,
        last_accessed = NOW()
    RETURNING id INTO v_storage_id;

    -- Update quota usage
    UPDATE public.storage_quotas
    SET current_size_bytes = v_new_total_size,
        updated_at = NOW()
    WHERE component = p_component;

    RETURN v_storage_id;
END;
$$;


ALTER FUNCTION "public"."save_error_analytics_data"("p_component" "text", "p_storage_key" "text", "p_data" "jsonb", "p_size_bytes" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."shifts_overlap"("p_start1" time without time zone, "p_end1" time without time zone, "p_start2" time without time zone, "p_end2" time without time zone) RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN (p_start1 < p_end2 AND p_end1 > p_start2);
END;
$$;


ALTER FUNCTION "public"."shifts_overlap"("p_start1" time without time zone, "p_end1" time without time zone, "p_start2" time without time zone, "p_end2" time without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."standardize_timestamps"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Standardize timestamps to UTC
    IF TG_OP = 'INSERT' OR NEW.period_start IS DISTINCT FROM OLD.period_start THEN
        NEW.period_start = public.standardize_timezone(NEW.period_start);
    END IF;

    IF TG_OP = 'INSERT' OR NEW.period_end IS DISTINCT FROM OLD.period_end THEN
        NEW.period_end = public.standardize_timezone(NEW.period_end);
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."standardize_timestamps"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."standardize_timezone"("p_timestamp" timestamp with time zone, "p_source_zone" "text" DEFAULT NULL::"text") RETURNS timestamp with time zone
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    -- If source zone is provided, convert to UTC first
    IF p_source_zone IS NOT NULL THEN
        RETURN p_timestamp AT TIME ZONE p_source_zone AT TIME ZONE 'UTC';
    END IF;

    -- Otherwise, ensure UTC
    RETURN p_timestamp AT TIME ZONE 'UTC';
END;
$$;


ALTER FUNCTION "public"."standardize_timezone"("p_timestamp" timestamp with time zone, "p_source_zone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_employee_operation"("p_employee_id" "uuid", "p_operation" "public"."employee_operation", "p_severity" "public"."operation_severity" DEFAULT 'LOW'::"public"."operation_severity", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb", "p_client_info" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_operation_id UUID;
BEGIN
    INSERT INTO public.employee_operations (
        employee_id,
        operation,
        severity,
        metadata,
        client_info,
        created_by
    ) VALUES (
        p_employee_id,
        p_operation,
        p_severity,
        p_metadata,
        p_client_info,
        auth.uid()
    )
    RETURNING id INTO v_operation_id;

    RETURN v_operation_id;
END;
$$;


ALTER FUNCTION "public"."track_employee_operation"("p_employee_id" "uuid", "p_operation" "public"."employee_operation", "p_severity" "public"."operation_severity", "p_metadata" "jsonb", "p_client_info" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_schedule_operation"("p_schedule_id" "uuid", "p_operation" "public"."schedule_operation", "p_previous_state" "jsonb" DEFAULT NULL::"jsonb", "p_new_state" "jsonb" DEFAULT NULL::"jsonb", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_operation_id UUID;
BEGIN
    -- Insert operation record
    INSERT INTO public.schedule_operations (
        schedule_id,
        operation,
        previous_state,
        new_state,
        created_by,
        metadata
    ) VALUES (
        p_schedule_id,
        p_operation,
        p_previous_state,
        p_new_state,
        auth.uid(),
        p_metadata
    )
    RETURNING id INTO v_operation_id;

    -- Update schedule with last operation
    UPDATE public.schedules
    SET last_operation_id = v_operation_id,
        updated_at = NOW()
    WHERE id = p_schedule_id;

    RETURN v_operation_id;
END;
$$;


ALTER FUNCTION "public"."track_schedule_operation"("p_schedule_id" "uuid", "p_operation" "public"."schedule_operation", "p_previous_state" "jsonb", "p_new_state" "jsonb", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_coverage_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_coverage_status"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" NOT NULL,
    "user_role" "public"."user_role_enum" NOT NULL,
    "weekly_hours_scheduled" integer DEFAULT 0,
    "default_shift_type_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "allow_overtime" boolean DEFAULT false NOT NULL,
    "max_weekly_hours" integer DEFAULT 40 NOT NULL,
    "employee_role" "public"."employee_role" NOT NULL
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_employee_and_profile"("p_employee_id" "uuid", "p_full_name" "text", "p_username" "text", "p_employee_role" "public"."employee_role_enum", "p_weekly_hours_scheduled" integer, "p_default_shift_type_id" "uuid" DEFAULT NULL::"uuid", "p_allow_overtime" boolean DEFAULT false, "p_max_weekly_hours" integer DEFAULT 40) RETURNS "public"."employees"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_employee public.employees;
BEGIN
    -- Check if user has permission to update employees
    IF NOT EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.id = auth.uid()
        AND e.employee_role IN ('Manager', 'Shift Supervisor')
    ) THEN
        RAISE EXCEPTION 'Permission denied: Only managers and supervisors can update employees';
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET 
        full_name = p_full_name,
        username = p_username,
        updated_at = now()
    WHERE id = p_employee_id;

    -- Update employee
    UPDATE public.employees
    SET 
        employee_role = p_employee_role,
        weekly_hours_scheduled = p_weekly_hours_scheduled,
        default_shift_type_id = p_default_shift_type_id,
        allow_overtime = p_allow_overtime,
        max_weekly_hours = p_max_weekly_hours,
        updated_at = now()
    WHERE id = p_employee_id
    RETURNING * INTO v_employee;

    RETURN v_employee;
END;
$$;


ALTER FUNCTION "public"."update_employee_and_profile"("p_employee_id" "uuid", "p_full_name" "text", "p_username" "text", "p_employee_role" "public"."employee_role_enum", "p_weekly_hours_scheduled" integer, "p_default_shift_type_id" "uuid", "p_allow_overtime" boolean, "p_max_weekly_hours" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_employee_role"("p_employee_id" "uuid", "p_new_role" "public"."employee_role", "p_reason" "text" DEFAULT NULL::"text", "p_client_info" "jsonb" DEFAULT NULL::"jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_previous_role employee_role;
BEGIN
    -- Get current role
    SELECT employee_role INTO v_previous_role
    FROM public.employees
    WHERE id = p_employee_id;

    -- Validate the role change
    IF NOT public.validate_role_change(p_employee_id, p_new_role, auth.uid()) THEN
        RETURN false;
    END IF;

    -- Update the role
    UPDATE public.employees
    SET employee_role = p_new_role
    WHERE id = p_employee_id;

    -- Log the change
    INSERT INTO public.employee_role_history (
        employee_id,
        previous_role,
        new_role,
        changed_by,
        reason,
        client_info
    ) VALUES (
        p_employee_id,
        v_previous_role,
        p_new_role,
        auth.uid(),
        p_reason,
        p_client_info
    );

    RETURN true;
END;
$$;


ALTER FUNCTION "public"."update_employee_role"("p_employee_id" "uuid", "p_new_role" "public"."employee_role", "p_reason" "text", "p_client_info" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_error_analytics_storage_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_error_analytics_storage_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_error_analytics_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_error_analytics_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_error_metrics_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_error_metrics_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_network_retry_metrics_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_network_retry_metrics_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_rate_limit_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_rate_limit_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_scheduler_config"("p_config_key" "text", "p_config_value" "jsonb", "p_environment" "text" DEFAULT "current_setting"('app.environment'::"text", true), "p_description" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_config_id UUID;
BEGIN
    INSERT INTO scheduler_config (
        config_key,
        config_value,
        environment,
        description,
        created_by,
        updated_by
    )
    VALUES (
        p_config_key,
        p_config_value,
        p_environment,
        p_description,
        auth.uid(),
        auth.uid()
    )
    ON CONFLICT (config_key, environment)
    DO UPDATE SET
        config_value = EXCLUDED.config_value,
        description = EXCLUDED.description,
        updated_at = NOW(),
        updated_by = auth.uid()
    RETURNING id INTO v_config_id;

    RETURN v_config_id;
END;
$$;


ALTER FUNCTION "public"."update_scheduler_config"("p_config_key" "text", "p_config_value" "jsonb", "p_environment" "text", "p_description" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_business_hours"("p_start_time" time without time zone, "p_end_time" time without time zone, "p_timezone" "text" DEFAULT 'UTC'::"text") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    -- Convert times to UTC for comparison
    RETURN p_start_time < p_end_time;
END;
$$;


ALTER FUNCTION "public"."validate_business_hours"("p_start_time" time without time zone, "p_end_time" time without time zone, "p_timezone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_date_range"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_allow_null_end" boolean DEFAULT false) RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    -- Handle null end date
    IF p_end_date IS NULL THEN
        RETURN p_allow_null_end;
    END IF;

    -- Validate range
    RETURN p_start_date <= p_end_date;
END;
$$;


ALTER FUNCTION "public"."validate_date_range"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_allow_null_end" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_jwt_template"("template" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Validate required structure
    IF NOT (
        template ? 'payload' AND
        template ? 'header' AND
        jsonb_typeof(template->'payload') = 'object' AND
        jsonb_typeof(template->'header') = 'object'
    ) THEN
        RETURN FALSE;
    END IF;

    -- Validate header
    IF NOT (
        template->'header' ? 'typ' AND
        template->'header'->>'typ' = 'JWT'
    ) THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_jwt_template"("template" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_overtime"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_weekly_hours INTEGER;
    v_max_hours INTEGER;
    v_allow_overtime BOOLEAN;
BEGIN
    -- Get employee's overtime settings
    SELECT max_weekly_hours, allow_overtime
    INTO v_max_hours, v_allow_overtime
    FROM public.employees
    WHERE id = NEW.employee_id;

    -- Calculate total weekly hours including new shift
    SELECT calculate_weekly_hours(NEW.employee_id, NEW.date)
    INTO v_weekly_hours;

    -- Add hours from new shift
    SELECT v_weekly_hours + duration_hours
    INTO v_weekly_hours
    FROM public.shifts
    WHERE id = NEW.shift_id;

    -- Validate overtime
    IF v_weekly_hours > v_max_hours AND NOT v_allow_overtime THEN
        RAISE EXCEPTION 'Overtime not allowed: Weekly hours (%) would exceed maximum (%)', 
            v_weekly_hours, v_max_hours;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_overtime"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_password"("p_password" "text", "p_policy_name" "text" DEFAULT 'default'::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
    v_policy password_policy;
BEGIN
    -- Get policy
    SELECT policy INTO v_policy
    FROM public.password_policies
    WHERE name = p_policy_name;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Password policy % not found', p_policy_name;
    END IF;

    -- Validate length
    IF LENGTH(p_password) < v_policy.min_length THEN
        RETURN FALSE;
    END IF;

    -- Validate character requirements
    IF v_policy.require_uppercase AND NOT p_password ~ '[A-Z]' THEN
        RETURN FALSE;
    END IF;

    IF v_policy.require_lowercase AND NOT p_password ~ '[a-z]' THEN
        RETURN FALSE;
    END IF;

    IF v_policy.require_numbers AND NOT p_password ~ '[0-9]' THEN
        RETURN FALSE;
    END IF;

    IF v_policy.require_special_chars AND NOT p_password ~ '[!@#$%^&*(),.?":{}|<>]' THEN
        RETURN FALSE;
    END IF;

    -- Check repeated characters
    IF v_policy.max_repeated_chars IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM regexp_matches(p_password, '(.)\\1{' || v_policy.max_repeated_chars || ',}', 'g')
        ) THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- Check prohibited patterns
    IF v_policy.prohibited_patterns IS NOT NULL THEN
        FOR i IN 1..array_length(v_policy.prohibited_patterns, 1) LOOP
            IF p_password ~ v_policy.prohibited_patterns[i] THEN
                RETURN FALSE;
            END IF;
        END LOOP;
    END IF;

    RETURN TRUE;
END;
$_$;


ALTER FUNCTION "public"."validate_password"("p_password" "text", "p_policy_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_period_format"("p_period_id" "text", "p_format" "public"."period_format" DEFAULT 'HH:MM-HH:MM'::"public"."period_format") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $_$
DECLARE
    v_pattern TEXT;
BEGIN
    CASE p_format
        WHEN 'HH:MM-HH:MM' THEN
            v_pattern := '^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$';
        WHEN 'HH:MM:SS-HH:MM:SS' THEN
            v_pattern := '^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$';
        WHEN 'HHMM-HHMM' THEN
            v_pattern := '^([0-1][0-9]|2[0-3])[0-5][0-9]-([0-1][0-9]|2[0-3])[0-5][0-9]$';
    END CASE;

    RETURN p_period_id ~ v_pattern;
END;
$_$;


ALTER FUNCTION "public"."validate_period_format"("p_period_id" "text", "p_format" "public"."period_format") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_role_change"("p_employee_id" "uuid", "p_new_role" "public"."employee_role", "p_changed_by" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_current_role employee_role;
    v_changer_role employee_role;
BEGIN
    -- Get current role of the employee
    SELECT employee_role INTO v_current_role
    FROM public.employees
    WHERE id = p_employee_id;

    -- Get role of the person making the change
    SELECT employee_role INTO v_changer_role
    FROM public.employees
    WHERE id = p_changed_by;

    -- Only ADMIN can promote to ADMIN
    IF p_new_role = 'ADMIN' AND v_changer_role != 'ADMIN' THEN
        RETURN false;
    END IF;

    -- Only ADMIN and MANAGER can promote to MANAGER
    IF p_new_role = 'MANAGER' AND v_changer_role NOT IN ('ADMIN', 'MANAGER') THEN
        RETURN false;
    END IF;

    -- ADMIN and MANAGER can change any other roles
    IF v_changer_role IN ('ADMIN', 'MANAGER') THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$;


ALTER FUNCTION "public"."validate_role_change"("p_employee_id" "uuid", "p_new_role" "public"."employee_role", "p_changed_by" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_schedule"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NOT validate_schedule_against_pattern(NEW.employee_id, NEW.date) THEN
        RAISE EXCEPTION 'Schedule violates employee pattern constraints';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_schedule"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_schedule_against_pattern"("p_employee_id" "uuid", "p_date" "date") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."validate_schedule_against_pattern"("p_employee_id" "uuid", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_schedule_overlap"("p_employee_id" "uuid", "p_period_start" timestamp with time zone, "p_period_end" timestamp with time zone, "p_exclude_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1
        FROM public.schedules
        WHERE employee_id = p_employee_id
        AND id != COALESCE(p_exclude_id, id)
        AND tstzrange(period_start, period_end) && tstzrange(p_period_start, p_period_end)
    );
END;
$$;


ALTER FUNCTION "public"."validate_schedule_overlap"("p_employee_id" "uuid", "p_period_start" timestamp with time zone, "p_period_end" timestamp with time zone, "p_exclude_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_schedule_status_transition"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Define valid status transitions
    IF OLD.status = 'DRAFT'::schedule_status AND 
       NEW.status NOT IN ('PENDING'::schedule_status, 'CANCELLED'::schedule_status) THEN
        RAISE EXCEPTION 'Invalid status transition from DRAFT to %', NEW.status;
    END IF;

    IF OLD.status = 'PENDING'::schedule_status AND 
       NEW.status NOT IN ('APPROVED'::schedule_status, 'CANCELLED'::schedule_status) THEN
        RAISE EXCEPTION 'Invalid status transition from PENDING to %', NEW.status;
    END IF;

    IF OLD.status = 'APPROVED'::schedule_status AND 
       NEW.status NOT IN ('PUBLISHED'::schedule_status, 'CANCELLED'::schedule_status) THEN
        RAISE EXCEPTION 'Invalid status transition from APPROVED to %', NEW.status;
    END IF;

    IF OLD.status = 'PUBLISHED'::schedule_status AND 
       NEW.status != 'CANCELLED'::schedule_status THEN
        RAISE EXCEPTION 'Published schedule can only be cancelled';
    END IF;

    IF OLD.status = 'CANCELLED'::schedule_status THEN
        RAISE EXCEPTION 'Cancelled schedule cannot be modified';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_schedule_status_transition"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_shift_assignment"("p_employee_id" "uuid", "p_shift_id" "uuid", "p_date" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_shift record;
  v_employee record;
  v_validation jsonb;
  v_weekly_hours numeric;
  v_last_shift record;
  v_staffing_requirement record;
begin
  -- Initialize validation result
  v_validation := jsonb_build_object(
    'valid', true,
    'errors', jsonb_build_array(),
    'warnings', jsonb_build_array()
  );
  
  -- Get shift details
  select * into v_shift
  from public.shifts
  where id = p_shift_id;
  
  if not found then
    return jsonb_build_object(
      'valid', false,
      'errors', jsonb_build_array('Shift not found'),
      'warnings', jsonb_build_array()
    );
  end if;
  
  -- Get employee details
  select * into v_employee
  from public.employees
  where id = p_employee_id;
  
  if not found then
    return jsonb_build_object(
      'valid', false,
      'errors', jsonb_build_array('Employee not found'),
      'warnings', jsonb_build_array()
    );
  end if;
  
  -- Calculate weekly hours including this shift
  select coalesce(sum(s.duration_hours), 0) into v_weekly_hours
  from public.schedules sch
  join public.shifts s on s.id = sch.shift_id
  where sch.employee_id = p_employee_id
  and sch.date between date_trunc('week', p_date) and date_trunc('week', p_date) + interval '6 days';
  
  v_weekly_hours := v_weekly_hours + v_shift.duration_hours;
  
  -- Check weekly hours limit
  if v_weekly_hours > v_employee.weekly_hours_scheduled and not v_employee.allow_overtime then
    v_validation := jsonb_set(
      v_validation,
      '{valid}',
      'false'::jsonb
    );
    v_validation := jsonb_set(
      v_validation,
      '{errors}',
      (v_validation->>'errors')::jsonb || jsonb_build_array('Would exceed weekly hours limit')
    );
  end if;
  
  -- Get last shift for rest period check
  select s.* into v_last_shift
  from public.schedules sch
  join public.shifts s on s.id = sch.shift_id
  where sch.employee_id = p_employee_id
  and sch.date < p_date
  order by sch.date desc, s.end_time desc
  limit 1;
  
  if found then
    -- Calculate rest period
    declare
      v_last_end timestamp;
      v_next_start timestamp;
      v_rest_hours numeric;
    begin
      v_last_end := (v_last_shift.date + v_last_shift.end_time)::timestamp;
      v_next_start := (p_date + v_shift.start_time)::timestamp;
      v_rest_hours := extract(epoch from (v_next_start - v_last_end))/3600;
      
      if v_rest_hours < 8 then
        v_validation := jsonb_set(
          v_validation,
          '{valid}',
          'false'::jsonb
        );
        v_validation := jsonb_set(
          v_validation,
          '{errors}',
          (v_validation->>'errors')::jsonb || jsonb_build_array('Insufficient rest period')
        );
      elsif v_rest_hours < 10 then
        v_validation := jsonb_set(
          v_validation,
          '{warnings}',
          (v_validation->>'warnings')::jsonb || jsonb_build_array('Less than recommended rest period')
        );
      end if;
    end;
  end if;
  
  -- Check staffing requirements
  select * into v_staffing_requirement
  from public.staffing_requirements
  where start_time <= v_shift.start_time
  and end_time >= v_shift.end_time
  and shift_supervisor_required = (v_employee.employee_role = 'Shift Supervisor');
  
  if found then
    -- Check current coverage
    declare
      v_current_coverage integer;
    begin
      select count(*) into v_current_coverage
      from public.schedules sch
      join public.shifts s on s.id = sch.shift_id
      join public.employees e on e.id = sch.employee_id
      where sch.date = p_date
      and s.start_time >= v_staffing_requirement.start_time
      and s.end_time <= v_staffing_requirement.end_time
      and (
        (v_employee.employee_role = 'Shift Supervisor' and e.employee_role = 'Shift Supervisor')
        or
        (v_employee.employee_role != 'Shift Supervisor' and e.employee_role != 'Shift Supervisor')
      );
      
      if v_current_coverage >= v_staffing_requirement.minimum_employees then
        v_validation := jsonb_set(
          v_validation,
          '{warnings}',
          (v_validation->>'warnings')::jsonb || jsonb_build_array('Exceeds required staffing level')
        );
      end if;
    end;
  end if;
  
  return v_validation;
end;
$$;


ALTER FUNCTION "public"."validate_shift_assignment"("p_employee_id" "uuid", "p_shift_id" "uuid", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_shift_overlap"("p_shift_id" "uuid", "p_employee_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) RETURNS TABLE("is_valid" boolean, "overlap_count" integer, "message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_organization_id UUID;
  v_allow_overlapping BOOLEAN;
  v_max_overlap INTEGER;
  v_overlap_count INTEGER;
BEGIN
  -- Get organization settings
  SELECT 
    s.organization_id,
    s.allow_overlapping_shifts,
    s.max_overlap_count
  INTO 
    v_organization_id,
    v_allow_overlapping,
    v_max_overlap
  FROM public.employees e
  JOIN public.organization_users ou ON ou.user_id = e.id
  JOIN public.schedule_settings s ON s.organization_id = ou.organization_id
  WHERE e.id = p_employee_id;

  -- Count overlapping shifts
  SELECT COUNT(*)
  INTO v_overlap_count
  FROM public.shifts s
  WHERE s.employee_id = p_employee_id
  AND s.id != p_shift_id
  AND (
    (p_start_time, p_end_time) OVERLAPS (s.start_time, s.end_time)
  );

  -- Validate overlap
  IF NOT v_allow_overlapping AND v_overlap_count > 0 THEN
    RETURN QUERY
    SELECT 
      FALSE,
      v_overlap_count,
      'Overlapping shifts are not allowed for this organization'::TEXT;
  ELSIF v_overlap_count >= v_max_overlap THEN
    RETURN QUERY
    SELECT 
      FALSE,
      v_overlap_count,
      format('Maximum overlap count of %s exceeded', v_max_overlap)::TEXT;
  ELSE
    RETURN QUERY
    SELECT 
      TRUE,
      v_overlap_count,
      'Shift overlap is valid'::TEXT;
  END IF;
END;
$$;


ALTER FUNCTION "public"."validate_shift_overlap"("p_shift_id" "uuid", "p_employee_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_shift_pattern"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_pattern_type shift_pattern_type_enum;
    v_consecutive_days INTEGER;
    v_last_shift_duration INTEGER;
BEGIN
    -- Get employee's pattern type
    SELECT ep.pattern_type INTO v_pattern_type
    FROM public.employee_patterns ep
    WHERE ep.employee_id = NEW.employee_id
    AND NEW.date BETWEEN ep.start_date AND COALESCE(ep.end_date, NEW.date)
    ORDER BY ep.start_date DESC
    LIMIT 1;

    -- Count consecutive days
    WITH consecutive_shifts AS (
        SELECT s.date, s.shift_id,
               sh.duration_hours,
               COUNT(*) OVER (ORDER BY s.date) as consecutive_count
        FROM public.schedules s
        JOIN public.shifts sh ON s.shift_id = sh.id
        WHERE s.employee_id = NEW.employee_id
        AND s.date BETWEEN NEW.date - INTERVAL '7 days' AND NEW.date
        ORDER BY s.date DESC
    )
    SELECT COUNT(*), MAX(duration_hours)
    INTO v_consecutive_days, v_last_shift_duration
    FROM consecutive_shifts;

    -- Validate based on pattern type
    CASE v_pattern_type
        WHEN '4x10' THEN
            IF v_consecutive_days >= 4 THEN
                RAISE EXCEPTION 'Pattern violation: Cannot exceed 4 consecutive days for 4x10 pattern';
            END IF;
        WHEN '3x12_1x4' THEN
            IF v_consecutive_days >= 3 AND v_last_shift_duration = 12 THEN
                RAISE EXCEPTION 'Pattern violation: Cannot exceed 3 consecutive 12-hour shifts for 3x12 pattern';
            END IF;
        ELSE
            -- Custom patterns handled separately
            NULL;
    END CASE;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_shift_pattern"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_shift_pattern"("p_shifts" "jsonb", "p_pattern" "jsonb", "p_timezone" "text" DEFAULT 'UTC'::"text") RETURNS TABLE("is_valid" boolean, "error_code" "text", "error_message" "text", "error_details" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_shift RECORD;
    v_pattern_sequence TEXT[];
    v_current_index INTEGER;
    v_current_date DATE;
    v_shift_span TEXT;
BEGIN
    -- Validate timezone
    IF NOT public.is_valid_timezone(p_timezone) THEN
        RETURN QUERY SELECT 
            false,
            'INVALID_TIMEZONE',
            'Invalid timezone specified',
            jsonb_build_object('timezone', p_timezone);
        RETURN;
    END IF;

    -- Extract pattern sequence
    v_pattern_sequence := ARRAY(
        SELECT jsonb_array_elements_text(p_pattern->'sequence')
    );
    
    v_current_index := 0;
    
    -- Check each shift against pattern
    FOR v_shift IN SELECT * FROM jsonb_to_recordset(p_shifts) AS x(
        start_time TIME,
        end_time TIME,
        date DATE
    )
    LOOP
        -- Convert shift times to pattern format
        v_shift_span := v_shift.start_time::TEXT || '-' || v_shift.end_time::TEXT;
        
        -- Check if shift matches current pattern position
        IF NOT v_shift_span = ANY(string_to_array(v_pattern_sequence[v_current_index + 1], ',')) THEN
            RETURN QUERY SELECT 
                false,
                'PATTERN_MISMATCH',
                'Shift does not match pattern',
                jsonb_build_object(
                    'date', v_shift.date,
                    'shift_span', v_shift_span,
                    'expected_pattern', v_pattern_sequence[v_current_index + 1]
                );
            RETURN;
        END IF;
        
        -- Move to next pattern position
        v_current_index := (v_current_index + 1) % array_length(v_pattern_sequence, 1);
    END LOOP;
    
    -- If we get here, pattern is valid
    RETURN QUERY SELECT 
        true,
        NULL::TEXT,
        NULL::TEXT,
        NULL::JSONB;
END;
$$;


ALTER FUNCTION "public"."validate_shift_pattern"("p_shifts" "jsonb", "p_pattern" "jsonb", "p_timezone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_shift_times"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Check if shift crosses midnight
    IF NEW.end_time < NEW.start_time THEN
        -- For shifts crossing midnight, add 24 hours to end_time for duration calculation
        NEW.duration_hours := (
            EXTRACT(EPOCH FROM (NEW.end_time + INTERVAL '24 hours' - NEW.start_time)) / 3600
        )::numeric;
    ELSE
        -- For normal shifts, calculate duration directly
        NEW.duration_hours := (
            EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600
        )::numeric;
    END IF;

    -- Set duration category based on hours
    NEW.duration_category := CASE
        WHEN NEW.duration_hours <= 4 THEN 'SHORT'::shift_duration_category
        WHEN NEW.duration_hours <= 8 THEN 'REGULAR'::shift_duration_category
        WHEN NEW.duration_hours <= 10 THEN 'EXTENDED'::shift_duration_category
        ELSE 'LONG'::shift_duration_category
    END;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_shift_times"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_shift_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_validation RECORD;
BEGIN
  -- Validate shift overlap
  SELECT * INTO v_validation
  FROM public.validate_shift_overlap(
    NEW.id,
    NEW.employee_id,
    NEW.start_time,
    NEW.end_time
  );

  IF NOT v_validation.is_valid THEN
    RAISE EXCEPTION 'Invalid shift: %', v_validation.message;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_shift_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_staffing_requirements"("p_schedule_id" "uuid", "p_date" "date", "p_timezone" "text" DEFAULT 'UTC'::"text") RETURNS TABLE("is_valid" boolean, "error_code" "text", "error_message" "text", "error_details" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_requirement RECORD;
    v_staff_count INTEGER;
    v_supervisor_present BOOLEAN;
BEGIN
    -- For each staffing requirement
    FOR v_requirement IN 
        SELECT * FROM public.staffing_requirements 
        WHERE is_active = true
    LOOP
        -- Count staff during requirement period
        SELECT 
            COUNT(*) as staff_count,
            bool_or(e.employee_role = 'SUPERVISOR') as has_supervisor
        INTO v_staff_count, v_supervisor_present
        FROM public.schedules s
        JOIN public.shifts sh ON s.shift_id = sh.id
        JOIN public.employees e ON s.employee_id = e.id
        WHERE s.schedule_id = p_schedule_id
        AND s.date = p_date
        AND public.shifts_overlap(
            sh.start_time,
            sh.end_time,
            v_requirement.start_time,
            v_requirement.end_time
        );
        
        -- Check minimum staff requirement
        IF v_staff_count < v_requirement.minimum_staff THEN
            RETURN QUERY SELECT 
                false,
                'INSUFFICIENT_STAFF',
                'Insufficient staff during required period',
                jsonb_build_object(
                    'date', p_date,
                    'period', jsonb_build_object(
                        'start', v_requirement.start_time,
                        'end', v_requirement.end_time
                    ),
                    'actual_count', v_staff_count,
                    'required_count', v_requirement.minimum_staff
                );
            RETURN;
        END IF;
        
        -- Check supervisor requirement
        IF v_requirement.supervisor_required AND NOT v_supervisor_present THEN
            RETURN QUERY SELECT 
                false,
                'SUPERVISOR_REQUIRED',
                'No supervisor present during required period',
                jsonb_build_object(
                    'date', p_date,
                    'period', jsonb_build_object(
                        'start', v_requirement.start_time,
                        'end', v_requirement.end_time
                    )
                );
            RETURN;
        END IF;
    END LOOP;
    
    -- If we get here, all requirements are met
    RETURN QUERY SELECT 
        true,
        NULL::TEXT,
        NULL::TEXT,
        NULL::JSONB;
END;
$$;


ALTER FUNCTION "public"."validate_staffing_requirements"("p_schedule_id" "uuid", "p_date" "date", "p_timezone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_time_off_request"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_request_type" "text", "p_reason" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_conflicts jsonb;
  v_validation jsonb;
begin
  -- Initialize validation result
  v_validation := jsonb_build_object(
    'valid', true,
    'errors', jsonb_build_array()
  );
  
  -- Check date range
  if p_start_date > p_end_date then
    v_validation := jsonb_set(
      v_validation,
      '{valid}',
      'false'::jsonb
    );
    v_validation := jsonb_set(
      v_validation,
      '{errors}',
      (v_validation->>'errors')::jsonb || jsonb_build_array('Start date must be before or equal to end date')
    );
  end if;
  
  -- Check for overlapping requests
  select jsonb_agg(
    jsonb_build_object(
      'id', id,
      'start_date', start_date,
      'end_date', end_date,
      'status', status
    )
  )
  into v_conflicts
  from public.time_off_requests
  where user_id = p_user_id
    and status != 'Denied'
    and (
      (p_start_date between start_date and end_date)
      or (p_end_date between start_date and end_date)
      or (start_date between p_start_date and p_end_date)
    );
  
  if v_conflicts is not null then
    v_validation := jsonb_set(
      v_validation,
      '{valid}',
      'false'::jsonb
    );
    v_validation := jsonb_set(
      v_validation,
      '{errors}',
      (v_validation->>'errors')::jsonb || jsonb_build_array('Request overlaps with existing time-off requests')
    );
    v_validation := jsonb_set(
      v_validation,
      '{conflicts}',
      v_conflicts
    );
  end if;
  
  return v_validation;
end;
$$;


ALTER FUNCTION "public"."validate_time_off_request"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_request_type" "text", "p_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."validate_time_off_request"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_request_type" "text", "p_reason" "text") IS 'Validates a time-off request for conflicts and business rules';



CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid" NOT NULL,
    "operation" "text" NOT NULL,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "changed_by" "uuid",
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "client_info" "jsonb"
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auth_confirmation_attempts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text",
    "type" "text" NOT NULL,
    "token_hash" "text",
    "ip_address" "text",
    "user_agent" "text",
    "success" boolean DEFAULT false NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."auth_confirmation_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auth_error_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "error_type" "public"."auth_error_type" NOT NULL,
    "error_code" "text" NOT NULL,
    "error_message" "text" NOT NULL,
    "error_details" "jsonb",
    "severity" "public"."auth_error_severity" DEFAULT 'MEDIUM'::"public"."auth_error_severity" NOT NULL,
    "user_id" "uuid",
    "session_id" "uuid",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resolved_at" timestamp with time zone,
    "resolution_details" "jsonb",
    "retry_count" integer DEFAULT 0 NOT NULL,
    "last_retry_at" timestamp with time zone,
    "recovery_strategy" "text"
);


ALTER TABLE "public"."auth_error_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auth_errors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "action_type" "text" NOT NULL,
    "error_code" "text" NOT NULL,
    "error_message" "text",
    "error_details" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."auth_errors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auth_event_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_type" "text" NOT NULL,
    "user_id" "uuid",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "success" boolean DEFAULT true NOT NULL,
    "error_id" "uuid",
    "session_id" "uuid",
    "ip_address" "text",
    "user_agent" "text"
);


ALTER TABLE "public"."auth_event_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auth_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_type" "text" NOT NULL,
    "user_id" "uuid",
    "metadata" "jsonb",
    "client_info" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."auth_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cookie_errors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "error_type" "text" NOT NULL,
    "error_code" "text",
    "error_message" "text",
    "error_details" "jsonb",
    "cookie_name" "text",
    "cookie_operation" "text",
    "user_id" "uuid",
    "session_id" "uuid",
    "request_path" "text",
    "request_method" "text",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cookie_errors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cookie_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "cookie_name" "text" NOT NULL,
    "operation" "text" NOT NULL,
    "success" boolean NOT NULL,
    "duration_ms" integer,
    "user_id" "uuid",
    "session_id" "uuid",
    "request_path" "text",
    "request_method" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cookie_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_coverage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" NOT NULL,
    "period_id" "uuid" NOT NULL,
    "actual_coverage" integer DEFAULT 0 NOT NULL,
    "coverage_status" "public"."coverage_status_enum" DEFAULT 'Under'::"public"."coverage_status_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "supervisor_count" integer DEFAULT 0 NOT NULL,
    "overtime_hours" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "daily_coverage_actual_check" CHECK (("actual_coverage" >= 0))
);


ALTER TABLE "public"."daily_coverage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_access_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "accessor_id" "uuid",
    "accessed_employee_id" "uuid",
    "action_type" "text" NOT NULL,
    "success" boolean DEFAULT true NOT NULL,
    "error_message" "text",
    "client_info" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."employee_access_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_patterns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "pattern_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "rotation_start_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "employee_patterns_dates_check" CHECK ((("end_date" IS NULL) OR ("end_date" > "start_date"))),
    CONSTRAINT "employee_patterns_rotation_date_check" CHECK (("rotation_start_date" >= "start_date"))
);


ALTER TABLE "public"."employee_patterns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_role_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "employee_id" "uuid",
    "previous_role" "public"."employee_role",
    "new_role" "public"."employee_role",
    "changed_by" "uuid",
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reason" "text",
    "client_info" "jsonb"
);


ALTER TABLE "public"."employee_role_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_shift_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "shift_type_id" "uuid" NOT NULL,
    "preference_level" integer DEFAULT 0 NOT NULL,
    "effective_date" "date" NOT NULL,
    "expiry_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "date_range_valid" CHECK ((("expiry_date" IS NULL) OR ("expiry_date" > "effective_date"))),
    CONSTRAINT "preference_level_range" CHECK ((("preference_level" >= '-3'::integer) AND ("preference_level" <= 3)))
);


ALTER TABLE "public"."employee_shift_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_actions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "action" "text" NOT NULL,
    "path" "text" NOT NULL,
    "user_id" "uuid",
    "action_timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."error_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_analytics_config" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "component" "text" NOT NULL,
    "max_contexts" integer DEFAULT 100 NOT NULL,
    "max_user_agents" integer DEFAULT 50 NOT NULL,
    "max_urls" integer DEFAULT 100 NOT NULL,
    "max_trends" integer DEFAULT 1000 NOT NULL,
    "trend_period_ms" integer DEFAULT 3600000 NOT NULL,
    "retention_days" integer DEFAULT 30 NOT NULL,
    "batch_size" integer DEFAULT 50 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."error_analytics_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_analytics_data" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "component" "text" NOT NULL,
    "error_type" "text" NOT NULL,
    "error_message" "text",
    "context" "jsonb",
    "user_agent" "text",
    "url" "text",
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "batch_id" "uuid",
    "processed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."error_analytics_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_analytics_storage" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "component" "text" NOT NULL,
    "storage_key" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "size_bytes" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_accessed" timestamp with time zone,
    "retention_days" integer DEFAULT 30
);


ALTER TABLE "public"."error_analytics_storage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_analytics_trends" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "component" "text" NOT NULL,
    "error_type" "text" NOT NULL,
    "count" integer DEFAULT 0 NOT NULL,
    "first_seen" timestamp with time zone NOT NULL,
    "last_seen" timestamp with time zone NOT NULL,
    "contexts" "jsonb" DEFAULT '[]'::"jsonb",
    "user_agents" "jsonb" DEFAULT '[]'::"jsonb",
    "urls" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."error_analytics_trends" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "component" "text" NOT NULL,
    "error_count" integer DEFAULT 0 NOT NULL,
    "recovery_attempts" integer DEFAULT 0 NOT NULL,
    "successful_recoveries" integer DEFAULT 0 NOT NULL,
    "last_error" timestamp with time zone,
    "error_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."error_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_status_codes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "error_code" "text" NOT NULL,
    "status_code" "public"."error_status_code" NOT NULL,
    "http_code" integer NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."error_status_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jwt_audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "template_id" "uuid",
    "template_version" integer NOT NULL,
    "user_id" "uuid",
    "operation" "text" NOT NULL,
    "jwt_id" "text",
    "issued_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "client_info" "jsonb",
    "error_details" "text",
    CONSTRAINT "valid_operation" CHECK (("operation" = ANY (ARRAY['generate'::"text", 'verify'::"text", 'revoke'::"text"])))
);


ALTER TABLE "public"."jwt_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."network_retry_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "component" "text" NOT NULL,
    "endpoint" "text" NOT NULL,
    "total_retries" integer DEFAULT 0 NOT NULL,
    "successful_retries" integer DEFAULT 0 NOT NULL,
    "failed_retries" integer DEFAULT 0 NOT NULL,
    "last_retry" timestamp with time zone,
    "avg_retry_delay" numeric,
    "max_retry_delay" numeric,
    "retry_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."network_retry_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."organization_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."password_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "password_hash" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."password_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."password_policies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "policy" "public"."password_policy" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."password_policies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pattern_actions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "action_type" "public"."pattern_action_type" NOT NULL,
    "pattern_id" "uuid",
    "user_id" "uuid",
    "pattern_name" "text",
    "pattern_type" "text",
    "error_message" "text",
    "error_code" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "client_info" "jsonb"
);


ALTER TABLE "public"."pattern_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."period_format_issues" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "period_id" "text" NOT NULL,
    "source_format" "public"."period_format" NOT NULL,
    "error_message" "text" NOT NULL,
    "component" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resolved_at" timestamp with time zone,
    "resolution" "text"
);


ALTER TABLE "public"."period_format_issues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limit_config" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "key" "text" NOT NULL,
    "max_requests" integer NOT NULL,
    "window_seconds" integer NOT NULL,
    "burst_limit" integer,
    "enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rate_limit_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limit_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "key" "text" NOT NULL,
    "user_id" "uuid",
    "request_count" integer DEFAULT 0 NOT NULL,
    "window_start" timestamp with time zone NOT NULL,
    "last_request" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rate_limit_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedule_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "day_start_time" time without time zone DEFAULT '05:00:00'::time without time zone NOT NULL,
    "day_end_time" time without time zone DEFAULT '23:00:00'::time without time zone NOT NULL,
    "allow_overlapping_shifts" boolean DEFAULT false NOT NULL,
    "max_overlap_count" integer DEFAULT 3 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."schedule_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scheduler_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "config_key" "text" NOT NULL,
    "config_value" "jsonb" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "environment" "text" DEFAULT 'development'::"text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "timezone" "text" DEFAULT 'UTC'::"text" NOT NULL,
    CONSTRAINT "scheduler_config_valid_timezone" CHECK ("public"."is_valid_timezone"("timezone"))
);


ALTER TABLE "public"."scheduler_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scheduler_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "coverage_deficit" integer DEFAULT 0 NOT NULL,
    "overtime_violations" integer DEFAULT 0 NOT NULL,
    "pattern_errors" integer DEFAULT 0 NOT NULL,
    "schedule_generation_time" integer DEFAULT 0 NOT NULL,
    "last_run_status" "text" NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "scheduler_metrics_last_run_status_check" CHECK (("last_run_status" = ANY (ARRAY['success'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."scheduler_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scheduler_metrics_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metrics_type" "text" NOT NULL,
    "metrics_value" "jsonb" NOT NULL,
    "environment" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "measured_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."scheduler_metrics_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."schedule_status" NOT NULL,
    "timezone" "text" DEFAULT 'UTC'::"text" NOT NULL,
    "period_start" timestamp with time zone NOT NULL,
    "period_end" timestamp with time zone NOT NULL,
    "shift_start" time without time zone NOT NULL,
    "shift_end" time without time zone NOT NULL,
    "last_operation_id" "uuid",
    CONSTRAINT "valid_business_hours" CHECK ("public"."validate_business_hours"("shift_start", "shift_end")),
    CONSTRAINT "valid_schedule_dates" CHECK ("public"."validate_date_range"("period_start", "period_end", false)),
    CONSTRAINT "valid_timezone" CHECK ("public"."is_valid_timezone"("timezone"))
);


ALTER TABLE "public"."schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shift_patterns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "pattern_type" "public"."shift_pattern_type_enum" NOT NULL,
    "days_on" integer NOT NULL,
    "days_off" integer NOT NULL,
    "shift_duration" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "shift_patterns_days_check" CHECK ((("days_on" > 0) AND ("days_off" > 0))),
    CONSTRAINT "shift_patterns_duration_check" CHECK (("shift_duration" = ANY (ARRAY[4, 10, 12])))
);


ALTER TABLE "public"."shift_patterns" OWNER TO "postgres";


COMMENT ON TABLE "public"."shift_patterns" IS 'Shift patterns for employee scheduling. Only managers and shift supervisors can create/update/delete patterns, but all authenticated users can view them.';



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
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "duration_category" "public"."shift_duration_category" NOT NULL,
    CONSTRAINT "shifts_duration_check" CHECK ((("duration_hours" > 0) AND ("duration_hours" <= 24)))
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
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "staffing_requirements_minimum_check" CHECK (("minimum_employees" > 0))
);


ALTER TABLE "public"."staffing_requirements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storage_quotas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "component" "text" NOT NULL,
    "max_size_bytes" integer DEFAULT 5242880 NOT NULL,
    "current_size_bytes" integer DEFAULT 0 NOT NULL,
    "quota_alert_threshold" double precision DEFAULT 0.8 NOT NULL,
    "last_cleanup" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."storage_quotas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."time_off_access_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "accessed_user_id" "uuid",
    "access_type" "public"."time_off_access_level" NOT NULL,
    "accessed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "client_info" "jsonb",
    "request_path" "text",
    "request_method" "text"
);


ALTER TABLE "public"."time_off_access_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."time_off_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "type" "public"."time_off_type_enum" NOT NULL,
    "status" "public"."time_off_status_enum" DEFAULT 'Pending'::"public"."time_off_status_enum" NOT NULL,
    "notes" "text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "period_start" timestamp with time zone NOT NULL,
    "period_end" timestamp with time zone NOT NULL,
    CONSTRAINT "valid_time_off_dates" CHECK ("public"."validate_date_range"("period_start", "period_end", false))
);


ALTER TABLE "public"."time_off_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."timezone_configs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "policy" "public"."timezone_policy" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."timezone_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."validation_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "schedule_id" "uuid" NOT NULL,
    "validation_type" "text" NOT NULL,
    "is_valid" boolean NOT NULL,
    "error_code" "text",
    "error_message" "text",
    "error_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid"
);


ALTER TABLE "public"."validation_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."validation_rules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "rule_type" "text" NOT NULL,
    "rule_name" "text" NOT NULL,
    "rule_config" "jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "priority" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."validation_rules" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_confirmation_attempts"
    ADD CONSTRAINT "auth_confirmation_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_error_logs"
    ADD CONSTRAINT "auth_error_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_errors"
    ADD CONSTRAINT "auth_errors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_event_logs"
    ADD CONSTRAINT "auth_event_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_events"
    ADD CONSTRAINT "auth_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cookie_errors"
    ADD CONSTRAINT "cookie_errors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cookie_metrics"
    ADD CONSTRAINT "cookie_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_coverage"
    ADD CONSTRAINT "daily_coverage_date_period_key" UNIQUE ("date", "period_id");



ALTER TABLE ONLY "public"."daily_coverage"
    ADD CONSTRAINT "daily_coverage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_access_logs"
    ADD CONSTRAINT "employee_access_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_operations"
    ADD CONSTRAINT "employee_operations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_patterns"
    ADD CONSTRAINT "employee_patterns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_role_history"
    ADD CONSTRAINT "employee_role_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_shift_preferences"
    ADD CONSTRAINT "employee_shift_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_actions"
    ADD CONSTRAINT "error_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_analytics_config"
    ADD CONSTRAINT "error_analytics_config_component_key" UNIQUE ("component");



ALTER TABLE ONLY "public"."error_analytics_config"
    ADD CONSTRAINT "error_analytics_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_analytics_data"
    ADD CONSTRAINT "error_analytics_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_analytics_storage"
    ADD CONSTRAINT "error_analytics_storage_component_storage_key_key" UNIQUE ("component", "storage_key");



ALTER TABLE ONLY "public"."error_analytics_storage"
    ADD CONSTRAINT "error_analytics_storage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_analytics_trends"
    ADD CONSTRAINT "error_analytics_trends_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_metrics"
    ADD CONSTRAINT "error_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_status_codes"
    ADD CONSTRAINT "error_status_codes_error_code_key" UNIQUE ("error_code");



ALTER TABLE ONLY "public"."error_status_codes"
    ADD CONSTRAINT "error_status_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jwt_audit_logs"
    ADD CONSTRAINT "jwt_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jwt_templates"
    ADD CONSTRAINT "jwt_templates_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."jwt_templates"
    ADD CONSTRAINT "jwt_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."network_retry_metrics"
    ADD CONSTRAINT "network_retry_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_users"
    ADD CONSTRAINT "organization_users_organization_id_user_id_key" UNIQUE ("organization_id", "user_id");



ALTER TABLE ONLY "public"."organization_users"
    ADD CONSTRAINT "organization_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."password_history"
    ADD CONSTRAINT "password_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_history"
    ADD CONSTRAINT "password_history_user_id_password_hash_key" UNIQUE ("user_id", "password_hash");



ALTER TABLE ONLY "public"."password_policies"
    ADD CONSTRAINT "password_policies_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."password_policies"
    ADD CONSTRAINT "password_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pattern_actions"
    ADD CONSTRAINT "pattern_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."period_format_issues"
    ADD CONSTRAINT "period_format_issues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."rate_limit_config"
    ADD CONSTRAINT "rate_limit_config_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."rate_limit_config"
    ADD CONSTRAINT "rate_limit_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limit_metrics"
    ADD CONSTRAINT "rate_limit_metrics_key_user_id_window_start_key" UNIQUE ("key", "user_id", "window_start");



ALTER TABLE ONLY "public"."rate_limit_metrics"
    ADD CONSTRAINT "rate_limit_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedule_operations"
    ADD CONSTRAINT "schedule_operations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedule_settings"
    ADD CONSTRAINT "schedule_settings_organization_id_key" UNIQUE ("organization_id");



ALTER TABLE ONLY "public"."schedule_settings"
    ADD CONSTRAINT "schedule_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scheduler_config"
    ADD CONSTRAINT "scheduler_config_config_key_environment_key" UNIQUE ("config_key", "environment");



ALTER TABLE ONLY "public"."scheduler_config"
    ADD CONSTRAINT "scheduler_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scheduler_metrics_history"
    ADD CONSTRAINT "scheduler_metrics_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scheduler_metrics"
    ADD CONSTRAINT "scheduler_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shift_patterns"
    ADD CONSTRAINT "shift_patterns_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."shift_patterns"
    ADD CONSTRAINT "shift_patterns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shift_types"
    ADD CONSTRAINT "shift_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."shift_types"
    ADD CONSTRAINT "shift_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staffing_requirements"
    ADD CONSTRAINT "staffing_requirements_name_key" UNIQUE ("period_name");



ALTER TABLE ONLY "public"."staffing_requirements"
    ADD CONSTRAINT "staffing_requirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_quotas"
    ADD CONSTRAINT "storage_quotas_component_key" UNIQUE ("component");



ALTER TABLE ONLY "public"."storage_quotas"
    ADD CONSTRAINT "storage_quotas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."time_off_access_logs"
    ADD CONSTRAINT "time_off_access_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timezone_configs"
    ADD CONSTRAINT "timezone_configs_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."timezone_configs"
    ADD CONSTRAINT "timezone_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."validation_history"
    ADD CONSTRAINT "validation_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."validation_rules"
    ADD CONSTRAINT "validation_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."validation_rules"
    ADD CONSTRAINT "validation_rules_rule_type_rule_name_key" UNIQUE ("rule_type", "rule_name");



CREATE INDEX "idx_access_logs_accessed" ON "public"."employee_access_logs" USING "btree" ("accessed_employee_id");



CREATE INDEX "idx_access_logs_accessor" ON "public"."employee_access_logs" USING "btree" ("accessor_id");



CREATE INDEX "idx_access_logs_created_at" ON "public"."employee_access_logs" USING "btree" ("created_at");



CREATE INDEX "idx_audit_logs_changed_at" ON "public"."audit_logs" USING "btree" ("changed_at" DESC);



CREATE INDEX "idx_audit_logs_table_record" ON "public"."audit_logs" USING "btree" ("table_name", "record_id");



CREATE INDEX "idx_auth_confirmation_attempts_created" ON "public"."auth_confirmation_attempts" USING "btree" ("created_at");



CREATE INDEX "idx_auth_confirmation_attempts_email" ON "public"."auth_confirmation_attempts" USING "btree" ("email");



CREATE INDEX "idx_auth_confirmation_attempts_ip" ON "public"."auth_confirmation_attempts" USING "btree" ("ip_address");



CREATE INDEX "idx_auth_error_logs_created_at" ON "public"."auth_error_logs" USING "btree" ("created_at");



CREATE INDEX "idx_auth_error_logs_error_type" ON "public"."auth_error_logs" USING "btree" ("error_type");



CREATE INDEX "idx_auth_error_logs_user_id" ON "public"."auth_error_logs" USING "btree" ("user_id");



CREATE INDEX "idx_auth_errors_action" ON "public"."auth_errors" USING "btree" ("action_type");



CREATE INDEX "idx_auth_errors_created" ON "public"."auth_errors" USING "btree" ("created_at");



CREATE INDEX "idx_auth_errors_user" ON "public"."auth_errors" USING "btree" ("user_id");



CREATE INDEX "idx_auth_event_logs_created_at" ON "public"."auth_event_logs" USING "btree" ("created_at");



CREATE INDEX "idx_auth_event_logs_event_type" ON "public"."auth_event_logs" USING "btree" ("event_type");



CREATE INDEX "idx_auth_event_logs_user_id" ON "public"."auth_event_logs" USING "btree" ("user_id");



CREATE INDEX "idx_auth_events_created" ON "public"."auth_events" USING "btree" ("created_at");



CREATE INDEX "idx_auth_events_type" ON "public"."auth_events" USING "btree" ("event_type");



CREATE INDEX "idx_auth_events_user" ON "public"."auth_events" USING "btree" ("user_id");



CREATE INDEX "idx_cookie_errors_cookie" ON "public"."cookie_errors" USING "btree" ("cookie_name");



CREATE INDEX "idx_cookie_errors_type" ON "public"."cookie_errors" USING "btree" ("error_type");



CREATE INDEX "idx_cookie_errors_user" ON "public"."cookie_errors" USING "btree" ("user_id");



CREATE INDEX "idx_cookie_metrics_name" ON "public"."cookie_metrics" USING "btree" ("cookie_name");



CREATE INDEX "idx_cookie_metrics_operation" ON "public"."cookie_metrics" USING "btree" ("operation");



CREATE INDEX "idx_cookie_metrics_success" ON "public"."cookie_metrics" USING "btree" ("success");



CREATE INDEX "idx_cookie_metrics_user" ON "public"."cookie_metrics" USING "btree" ("user_id");



CREATE INDEX "idx_coverage_date" ON "public"."daily_coverage" USING "btree" ("date");



CREATE INDEX "idx_daily_coverage_date" ON "public"."daily_coverage" USING "btree" ("date");



CREATE INDEX "idx_daily_coverage_period" ON "public"."daily_coverage" USING "btree" ("period_id");



CREATE INDEX "idx_daily_coverage_status" ON "public"."daily_coverage" USING "btree" ("coverage_status");



CREATE INDEX "idx_employee_operations_created" ON "public"."employee_operations" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_employee_operations_employee" ON "public"."employee_operations" USING "btree" ("employee_id");



CREATE INDEX "idx_employee_operations_status" ON "public"."employee_operations" USING "btree" ("status");



CREATE INDEX "idx_employee_patterns_date" ON "public"."employee_patterns" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_employee_patterns_dates" ON "public"."employee_patterns" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_employee_patterns_employee" ON "public"."employee_patterns" USING "btree" ("employee_id");



CREATE INDEX "idx_employee_patterns_pattern" ON "public"."employee_patterns" USING "btree" ("pattern_id");



CREATE INDEX "idx_error_actions_timestamp" ON "public"."error_actions" USING "btree" ("action_timestamp");



CREATE INDEX "idx_error_actions_user" ON "public"."error_actions" USING "btree" ("user_id");



CREATE INDEX "idx_error_analytics_component" ON "public"."error_analytics_storage" USING "btree" ("component");



CREATE INDEX "idx_error_analytics_data_component" ON "public"."error_analytics_data" USING "btree" ("component");



CREATE INDEX "idx_error_analytics_data_timestamp" ON "public"."error_analytics_data" USING "btree" ("timestamp");



CREATE INDEX "idx_error_analytics_last_accessed" ON "public"."error_analytics_storage" USING "btree" ("last_accessed");



CREATE INDEX "idx_error_analytics_trends_component" ON "public"."error_analytics_trends" USING "btree" ("component");



CREATE INDEX "idx_error_metrics_component" ON "public"."error_metrics" USING "btree" ("component");



CREATE INDEX "idx_error_metrics_last_error" ON "public"."error_metrics" USING "btree" ("last_error");



CREATE INDEX "idx_jwt_audit_logs_issued" ON "public"."jwt_audit_logs" USING "btree" ("issued_at" DESC);



CREATE INDEX "idx_jwt_audit_logs_template" ON "public"."jwt_audit_logs" USING "btree" ("template_id", "template_version");



CREATE INDEX "idx_jwt_audit_logs_user" ON "public"."jwt_audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_network_retry_metrics_component" ON "public"."network_retry_metrics" USING "btree" ("component");



CREATE INDEX "idx_network_retry_metrics_endpoint" ON "public"."network_retry_metrics" USING "btree" ("endpoint");



CREATE INDEX "idx_organization_users_org" ON "public"."organization_users" USING "btree" ("organization_id");



CREATE INDEX "idx_organization_users_user" ON "public"."organization_users" USING "btree" ("user_id");



CREATE INDEX "idx_organizations_slug" ON "public"."organizations" USING "btree" ("slug");



CREATE INDEX "idx_password_history_user_created" ON "public"."password_history" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_pattern_actions_created" ON "public"."pattern_actions" USING "btree" ("created_at");



CREATE INDEX "idx_pattern_actions_pattern" ON "public"."pattern_actions" USING "btree" ("pattern_id");



CREATE INDEX "idx_pattern_actions_user" ON "public"."pattern_actions" USING "btree" ("user_id");



CREATE INDEX "idx_period_format_issues_component" ON "public"."period_format_issues" USING "btree" ("component");



CREATE INDEX "idx_period_format_issues_created" ON "public"."period_format_issues" USING "btree" ("created_at");



CREATE INDEX "idx_rate_limit_metrics_key_user" ON "public"."rate_limit_metrics" USING "btree" ("key", "user_id");



CREATE INDEX "idx_rate_limit_metrics_window" ON "public"."rate_limit_metrics" USING "btree" ("window_start");



CREATE INDEX "idx_role_history_changed_at" ON "public"."employee_role_history" USING "btree" ("changed_at");



CREATE INDEX "idx_role_history_changed_by" ON "public"."employee_role_history" USING "btree" ("changed_by");



CREATE INDEX "idx_role_history_employee" ON "public"."employee_role_history" USING "btree" ("employee_id");



CREATE INDEX "idx_schedule_operations_schedule" ON "public"."schedule_operations" USING "btree" ("schedule_id");



CREATE INDEX "idx_schedule_operations_status" ON "public"."schedule_operations" USING "btree" ("status");



CREATE INDEX "idx_scheduler_metrics_created_at" ON "public"."scheduler_metrics" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_scheduler_metrics_history_measured_at" ON "public"."scheduler_metrics_history" USING "btree" ("measured_at");



CREATE INDEX "idx_scheduler_metrics_history_type_env" ON "public"."scheduler_metrics_history" USING "btree" ("metrics_type", "environment");



CREATE INDEX "idx_schedules_date" ON "public"."schedules" USING "btree" ("date");



CREATE INDEX "idx_schedules_employee" ON "public"."schedules" USING "btree" ("employee_id");



CREATE INDEX "idx_schedules_employee_date" ON "public"."schedules" USING "btree" ("employee_id", "date");



CREATE INDEX "idx_shift_preferences_dates" ON "public"."employee_shift_preferences" USING "btree" ("effective_date", "expiry_date");



CREATE INDEX "idx_shift_preferences_employee" ON "public"."employee_shift_preferences" USING "btree" ("employee_id");



CREATE INDEX "idx_time_off_access_accessed" ON "public"."time_off_access_logs" USING "btree" ("accessed_user_id");



CREATE INDEX "idx_time_off_access_time" ON "public"."time_off_access_logs" USING "btree" ("accessed_at");



CREATE INDEX "idx_time_off_access_user" ON "public"."time_off_access_logs" USING "btree" ("user_id");



CREATE INDEX "idx_time_off_requests_employee" ON "public"."time_off_requests" USING "btree" ("employee_id");



CREATE INDEX "idx_validation_history_schedule" ON "public"."validation_history" USING "btree" ("schedule_id");



CREATE INDEX "time_off_requests_employee_id_idx" ON "public"."time_off_requests" USING "btree" ("employee_id");



CREATE INDEX "time_off_requests_status_idx" ON "public"."time_off_requests" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "audit_employees" AFTER INSERT OR DELETE OR UPDATE ON "public"."employees" FOR EACH ROW EXECUTE FUNCTION "public"."create_audit_log"();



CREATE OR REPLACE TRIGGER "audit_schedules" AFTER INSERT OR DELETE OR UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."create_audit_log"();



CREATE OR REPLACE TRIGGER "audit_time_off_requests" AFTER INSERT OR DELETE OR UPDATE ON "public"."time_off_requests" FOR EACH ROW EXECUTE FUNCTION "public"."create_audit_log"();



CREATE OR REPLACE TRIGGER "check_schedule_conflicts_trigger" BEFORE INSERT OR UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."check_schedule_conflicts"();



CREATE OR REPLACE TRIGGER "on_employee_deleted" AFTER DELETE ON "public"."employees" FOR EACH ROW EXECUTE FUNCTION "public"."handle_deleted_user"();



CREATE OR REPLACE TRIGGER "prevent_overlapping_patterns_trigger" BEFORE INSERT OR UPDATE ON "public"."employee_patterns" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_overlapping_patterns"();



CREATE OR REPLACE TRIGGER "schedule_status_transition_validation" BEFORE UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."validate_schedule_status_transition"();



CREATE OR REPLACE TRIGGER "shift_times_validation" BEFORE INSERT OR UPDATE ON "public"."shifts" FOR EACH ROW EXECUTE FUNCTION "public"."validate_shift_times"();



CREATE OR REPLACE TRIGGER "standardize_schedule_timestamps" BEFORE INSERT OR UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."standardize_timestamps"();



CREATE OR REPLACE TRIGGER "standardize_time_off_timestamps" BEFORE INSERT OR UPDATE ON "public"."time_off_requests" FOR EACH ROW EXECUTE FUNCTION "public"."standardize_timestamps"();



CREATE OR REPLACE TRIGGER "update_coverage_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."update_coverage_status"();



CREATE OR REPLACE TRIGGER "update_daily_coverage_updated_at" BEFORE UPDATE ON "public"."daily_coverage" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_employee_patterns_updated_at" BEFORE UPDATE ON "public"."employee_patterns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_employee_shift_preferences_updated_at" BEFORE UPDATE ON "public"."employee_shift_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_employees_updated_at" BEFORE UPDATE ON "public"."employees" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_error_analytics_config_timestamp" BEFORE UPDATE ON "public"."error_analytics_config" FOR EACH ROW EXECUTE FUNCTION "public"."update_error_analytics_timestamp"();



CREATE OR REPLACE TRIGGER "update_error_analytics_storage_timestamp" BEFORE UPDATE ON "public"."error_analytics_storage" FOR EACH ROW EXECUTE FUNCTION "public"."update_error_analytics_storage_updated_at"();



CREATE OR REPLACE TRIGGER "update_error_analytics_trends_timestamp" BEFORE UPDATE ON "public"."error_analytics_trends" FOR EACH ROW EXECUTE FUNCTION "public"."update_error_analytics_timestamp"();



CREATE OR REPLACE TRIGGER "update_error_metrics_timestamp" BEFORE UPDATE ON "public"."error_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."update_error_metrics_updated_at"();



CREATE OR REPLACE TRIGGER "update_network_retry_metrics_timestamp" BEFORE UPDATE ON "public"."network_retry_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."update_network_retry_metrics_updated_at"();



CREATE OR REPLACE TRIGGER "update_organization_users_updated_at" BEFORE UPDATE ON "public"."organization_users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_rate_limit_config_timestamp" BEFORE UPDATE ON "public"."rate_limit_config" FOR EACH ROW EXECUTE FUNCTION "public"."update_rate_limit_timestamp"();



CREATE OR REPLACE TRIGGER "update_rate_limit_metrics_timestamp" BEFORE UPDATE ON "public"."rate_limit_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."update_rate_limit_timestamp"();



CREATE OR REPLACE TRIGGER "update_schedule_settings_updated_at" BEFORE UPDATE ON "public"."schedule_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_schedules_updated_at" BEFORE UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_shift_patterns_updated_at" BEFORE UPDATE ON "public"."shift_patterns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_shift_types_updated_at" BEFORE UPDATE ON "public"."shift_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_shifts_updated_at" BEFORE UPDATE ON "public"."shifts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_staffing_requirements_updated_at" BEFORE UPDATE ON "public"."staffing_requirements" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_time_off_requests_updated_at" BEFORE UPDATE ON "public"."time_off_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "validate_overtime_trigger" BEFORE INSERT OR UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."validate_overtime"();



CREATE OR REPLACE TRIGGER "validate_schedule_overlap" BEFORE INSERT OR UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_schedule_overlap"();



CREATE OR REPLACE TRIGGER "validate_schedule_trigger" BEFORE INSERT OR UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."validate_schedule"();



CREATE OR REPLACE TRIGGER "validate_shift_overlap" BEFORE INSERT OR UPDATE ON "public"."shifts" FOR EACH ROW EXECUTE FUNCTION "public"."validate_shift_trigger"();



CREATE OR REPLACE TRIGGER "validate_shift_pattern_trigger" BEFORE INSERT OR UPDATE ON "public"."schedules" FOR EACH ROW EXECUTE FUNCTION "public"."validate_shift_pattern"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."auth_errors"
    ADD CONSTRAINT "auth_errors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."auth_event_logs"
    ADD CONSTRAINT "auth_event_logs_error_id_fkey" FOREIGN KEY ("error_id") REFERENCES "public"."auth_error_logs"("id");



ALTER TABLE ONLY "public"."auth_events"
    ADD CONSTRAINT "auth_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."cookie_errors"
    ADD CONSTRAINT "cookie_errors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."cookie_metrics"
    ADD CONSTRAINT "cookie_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."daily_coverage"
    ADD CONSTRAINT "daily_coverage_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "public"."staffing_requirements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_access_logs"
    ADD CONSTRAINT "employee_access_logs_accessed_employee_id_fkey" FOREIGN KEY ("accessed_employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."employee_access_logs"
    ADD CONSTRAINT "employee_access_logs_accessor_id_fkey" FOREIGN KEY ("accessor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employee_operations"
    ADD CONSTRAINT "employee_operations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employee_operations"
    ADD CONSTRAINT "employee_operations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."employee_patterns"
    ADD CONSTRAINT "employee_patterns_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_patterns"
    ADD CONSTRAINT "employee_patterns_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "public"."shift_patterns"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."employee_role_history"
    ADD CONSTRAINT "employee_role_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employee_role_history"
    ADD CONSTRAINT "employee_role_history_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."employee_shift_preferences"
    ADD CONSTRAINT "employee_shift_preferences_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_shift_preferences"
    ADD CONSTRAINT "employee_shift_preferences_shift_type_id_fkey" FOREIGN KEY ("shift_type_id") REFERENCES "public"."shift_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_default_shift_type_id_fkey" FOREIGN KEY ("default_shift_type_id") REFERENCES "public"."shift_types"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."error_actions"
    ADD CONSTRAINT "error_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "fk_profile" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."jwt_audit_logs"
    ADD CONSTRAINT "jwt_audit_logs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."jwt_templates"("id");



ALTER TABLE ONLY "public"."jwt_audit_logs"
    ADD CONSTRAINT "jwt_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."jwt_templates"
    ADD CONSTRAINT "jwt_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."jwt_templates"
    ADD CONSTRAINT "jwt_templates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_users"
    ADD CONSTRAINT "organization_users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_users"
    ADD CONSTRAINT "organization_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."password_history"
    ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."password_policies"
    ADD CONSTRAINT "password_policies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."password_policies"
    ADD CONSTRAINT "password_policies_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."pattern_actions"
    ADD CONSTRAINT "pattern_actions_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "public"."shift_patterns"("id");



ALTER TABLE ONLY "public"."pattern_actions"
    ADD CONSTRAINT "pattern_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_operations"
    ADD CONSTRAINT "schedule_operations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."schedule_operations"
    ADD CONSTRAINT "schedule_operations_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_settings"
    ADD CONSTRAINT "schedule_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scheduler_config"
    ADD CONSTRAINT "scheduler_config_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."scheduler_config"
    ADD CONSTRAINT "scheduler_config_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_last_operation_id_fkey" FOREIGN KEY ("last_operation_id") REFERENCES "public"."schedule_operations"("id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_shift_type_id_fkey" FOREIGN KEY ("shift_type_id") REFERENCES "public"."shift_types"("id");



ALTER TABLE ONLY "public"."time_off_access_logs"
    ADD CONSTRAINT "time_off_access_logs_accessed_user_id_fkey" FOREIGN KEY ("accessed_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."time_off_access_logs"
    ADD CONSTRAINT "time_off_access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."timezone_configs"
    ADD CONSTRAINT "timezone_configs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."timezone_configs"
    ADD CONSTRAINT "timezone_configs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."validation_history"
    ADD CONSTRAINT "validation_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."validation_history"
    ADD CONSTRAINT "validation_history_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id");



CREATE POLICY "Admins can manage JWT templates" ON "public"."jwt_templates" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can manage error analytics config" ON "public"."error_analytics_config" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can manage password policies" ON "public"."password_policies" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can manage rate limit config" ON "public"."rate_limit_config" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can manage timezone configs" ON "public"."timezone_configs" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can manage validation rules" ON "public"."validation_rules" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can read all audit logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can read all auth error logs" ON "public"."auth_error_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can read all auth event logs" ON "public"."auth_event_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can update their organization's schedule settings" ON "public"."schedule_settings" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "organization_users"."user_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."organization_id" = "schedule_settings"."organization_id") AND ("organization_users"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all JWT audit logs" ON "public"."jwt_audit_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can view all access logs" ON "public"."time_off_access_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("auth"."uid"() = "users"."id") AND (("users"."raw_user_meta_data" ->> 'role'::"text") = 'ADMIN'::"text")))));



CREATE POLICY "Admins can view all auth events" ON "public"."auth_events" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can view all confirmation attempts" ON "public"."auth_confirmation_attempts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can view all cookie errors" ON "public"."cookie_errors" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can view all cookie metrics" ON "public"."cookie_metrics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can view all employee operations" ON "public"."employee_operations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can view all error metrics" ON "public"."error_metrics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can view all network retry metrics" ON "public"."network_retry_metrics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Admins can view all pattern actions" ON "public"."pattern_actions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("auth"."uid"() = "users"."id") AND (("users"."raw_user_meta_data" ->> 'role'::"text") = 'ADMIN'::"text")))));



CREATE POLICY "All authenticated users can view patterns" ON "public"."shift_patterns" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view period format issues" ON "public"."period_format_issues" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view validation history" ON "public"."validation_history" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Everyone can read error status codes" ON "public"."error_status_codes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Managers can create patterns" ON "public"."shift_patterns" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = ANY (ARRAY['MANAGER'::"public"."employee_role", 'ADMIN'::"public"."employee_role"]))))));



CREATE POLICY "Managers can delete patterns" ON "public"."shift_patterns" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = ANY (ARRAY['MANAGER'::"public"."employee_role", 'ADMIN'::"public"."employee_role"]))))));



CREATE POLICY "Managers can insert validation history" ON "public"."validation_history" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = ANY (ARRAY['MANAGER'::"public"."employee_role", 'ADMIN'::"public"."employee_role"]))))));



CREATE POLICY "Managers can update patterns" ON "public"."shift_patterns" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = ANY (ARRAY['MANAGER'::"public"."employee_role", 'ADMIN'::"public"."employee_role"]))))));



CREATE POLICY "Managers can view validation rules" ON "public"."validation_rules" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = ANY (ARRAY['MANAGER'::"public"."employee_role", 'ADMIN'::"public"."employee_role"]))))));



CREATE POLICY "Only admins can modify error status codes" ON "public"."error_status_codes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Only managers can delete time-off requests" ON "public"."time_off_requests" FOR DELETE TO "authenticated" USING ("public"."can_manage_time_off_requests"("auth"."uid"()));



CREATE POLICY "Users can access their component data" ON "public"."error_analytics_storage" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Users can insert error actions" ON "public"."error_actions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can insert error analytics data" ON "public"."error_analytics_data" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can insert their own time-off requests" ON "public"."time_off_requests" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "employee_id"));



CREATE POLICY "Users can manage their component quotas" ON "public"."storage_quotas" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role")))));



CREATE POLICY "Users can read their own auth error logs" ON "public"."auth_error_logs" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their own auth event logs" ON "public"."auth_event_logs" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their own password history" ON "public"."password_history" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own pending time-off requests" ON "public"."time_off_requests" FOR UPDATE TO "authenticated" USING (((("auth"."uid"() = "employee_id") AND ("status" = 'Pending'::"public"."time_off_status_enum")) OR "public"."can_manage_time_off_requests"("auth"."uid"())));



CREATE POLICY "Users can view access logs they're involved in" ON "public"."employee_access_logs" FOR SELECT TO "authenticated" USING ((("accessor_id" = "auth"."uid"()) OR ("accessed_employee_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role"))))));



CREATE POLICY "Users can view error actions" ON "public"."error_actions" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role"))))));



CREATE POLICY "Users can view their component error analytics" ON "public"."error_analytics_trends" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view their organization memberships" ON "public"."organization_users" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() IN ( SELECT "organization_users_1"."user_id"
   FROM "public"."organization_users" "organization_users_1"
  WHERE (("organization_users_1"."organization_id" = "organization_users_1"."organization_id") AND ("organization_users_1"."role" = 'admin'::"text"))))));



CREATE POLICY "Users can view their organization's schedule settings" ON "public"."schedule_settings" FOR SELECT USING (("auth"."uid"() IN ( SELECT "organization_users"."user_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."organization_id" = "schedule_settings"."organization_id"))));



CREATE POLICY "Users can view their organizations" ON "public"."organizations" FOR SELECT USING (("auth"."uid"() IN ( SELECT "organization_users"."user_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."organization_id" = "organizations"."id"))));



CREATE POLICY "Users can view their own JWT audit logs" ON "public"."jwt_audit_logs" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own access logs" ON "public"."time_off_access_logs" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own auth errors" ON "public"."auth_errors" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role"))))));



CREATE POLICY "Users can view their own auth events" ON "public"."auth_events" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own cookie errors" ON "public"."cookie_errors" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own cookie metrics" ON "public"."cookie_metrics" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own operations" ON "public"."employee_operations" FOR SELECT TO "authenticated" USING ((("employee_id" = "auth"."uid"()) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Users can view their own pattern actions" ON "public"."pattern_actions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own rate limit metrics" ON "public"."rate_limit_metrics" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = 'ADMIN'::"public"."employee_role"))))));



CREATE POLICY "Users can view their own role history" ON "public"."employee_role_history" FOR SELECT TO "authenticated" USING ((("employee_id" = "auth"."uid"()) OR ("changed_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."employees"
  WHERE (("employees"."id" = "auth"."uid"()) AND ("employees"."employee_role" = ANY (ARRAY['ADMIN'::"public"."employee_role", 'MANAGER'::"public"."employee_role"])))))));



CREATE POLICY "Users can view their own schedule operations" ON "public"."schedule_operations" FOR SELECT TO "authenticated" USING (("schedule_id" IN ( SELECT "schedules"."id"
   FROM "public"."schedules"
  WHERE ("schedules"."employee_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own time-off requests" ON "public"."time_off_requests" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "employee_id") OR "public"."can_manage_time_off_requests"("auth"."uid"())));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_confirmation_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_error_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_errors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_event_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cookie_errors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cookie_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_coverage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_access_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_operations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_patterns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_role_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "employees_read_all_managers" ON "public"."employees" FOR SELECT TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



CREATE POLICY "employees_read_self" ON "public"."employees" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "employees_update_managers" ON "public"."employees" FOR UPDATE TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



CREATE POLICY "employees_update_self" ON "public"."employees" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."error_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_analytics_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_analytics_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_analytics_storage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_analytics_trends" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_status_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jwt_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jwt_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."network_retry_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."password_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."password_policies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pattern_actions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "patterns_read" ON "public"."shift_patterns" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "patterns_write" ON "public"."shift_patterns" TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



ALTER TABLE "public"."period_format_issues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_read_all_managers" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



CREATE POLICY "profiles_read_self" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "profiles_update_managers" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



CREATE POLICY "profiles_update_self" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."rate_limit_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limit_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_operations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedules" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "schedules_read_all_managers" ON "public"."schedules" FOR SELECT TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



CREATE POLICY "schedules_read_self" ON "public"."schedules" FOR SELECT TO "authenticated" USING (("employee_id" = "auth"."uid"()));



CREATE POLICY "schedules_write_managers" ON "public"."schedules" TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



ALTER TABLE "public"."shift_patterns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shift_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "shift_types_read" ON "public"."shift_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "shift_types_write" ON "public"."shift_types" TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



ALTER TABLE "public"."shifts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "shifts_read" ON "public"."shifts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "shifts_write_managers" ON "public"."shifts" TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



CREATE POLICY "staffing_read" ON "public"."staffing_requirements" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."staffing_requirements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "staffing_write" ON "public"."staffing_requirements" TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



ALTER TABLE "public"."storage_quotas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_off_access_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "time_off_admin_access" ON "public"."time_off_requests" TO "authenticated" USING ((COALESCE(((("current_setting"('request.jwt.claims'::"text", true))::"json" -> 'user_metadata'::"text") ->> 'user_role'::"text"), ''::"text") = 'Manager'::"text"));



ALTER TABLE "public"."time_off_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "time_off_self_read" ON "public"."time_off_requests" FOR SELECT TO "authenticated" USING (("employee_id" = "auth"."uid"()));



ALTER TABLE "public"."timezone_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."validation_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."validation_rules" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."analyze_auth_patterns"("p_time_window" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."analyze_auth_patterns"("p_time_window" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."analyze_auth_patterns"("p_time_window" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."analyze_error_patterns"("p_time_window" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."analyze_error_patterns"("p_time_window" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."analyze_error_patterns"("p_time_window" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."analyze_network_retry_patterns"("p_time_window" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."analyze_network_retry_patterns"("p_time_window" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."analyze_network_retry_patterns"("p_time_window" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."begin_transaction"() TO "anon";
GRANT ALL ON FUNCTION "public"."begin_transaction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."begin_transaction"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_period_coverage"("p_date" "date", "p_period_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_period_coverage"("p_date" "date", "p_period_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_period_coverage"("p_date" "date", "p_period_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_weekly_hours"("p_employee_id" "uuid", "p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_weekly_hours"("p_employee_id" "uuid", "p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_weekly_hours"("p_employee_id" "uuid", "p_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_user_data"("p_accessor_id" "uuid", "p_target_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_user_data"("p_accessor_id" "uuid", "p_target_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_user_data"("p_accessor_id" "uuid", "p_target_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_manage_time_off_requests"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_manage_time_off_requests"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_manage_time_off_requests"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_confirmation_rate_limit"("p_email" "text", "p_ip_address" "text", "p_window_minutes" integer, "p_max_attempts" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_confirmation_rate_limit"("p_email" "text", "p_ip_address" "text", "p_window_minutes" integer, "p_max_attempts" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_confirmation_rate_limit"("p_email" "text", "p_ip_address" "text", "p_window_minutes" integer, "p_max_attempts" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_employee_dependencies"("employee_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_employee_dependencies"("employee_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_employee_dependencies"("employee_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_password_history"("p_user_id" "uuid", "p_new_password" "text", "p_policy_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_password_history"("p_user_id" "uuid", "p_new_password" "text", "p_policy_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_password_history"("p_user_id" "uuid", "p_new_password" "text", "p_policy_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_key" "text", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_key" "text", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_key" "text", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_schedule_conflicts"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_schedule_conflicts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_schedule_conflicts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_storage_quota_status"("p_component" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_storage_quota_status"("p_component" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_storage_quota_status"("p_component" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_error_analytics_data"("p_component" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_error_analytics_data"("p_component" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_error_analytics_data"("p_component" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_error_analytics_storage"("p_component" "text", "p_older_than_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_error_analytics_storage"("p_component" "text", "p_older_than_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_error_analytics_storage"("p_component" "text", "p_older_than_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."column_exists"("p_table" "text", "p_column" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."column_exists"("p_table" "text", "p_column" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."column_exists"("p_table" "text", "p_column" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."commit_transaction"() TO "anon";
GRANT ALL ON FUNCTION "public"."commit_transaction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."commit_transaction"() TO "service_role";



GRANT ALL ON TABLE "public"."employee_operations" TO "anon";
GRANT ALL ON TABLE "public"."employee_operations" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_operations" TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_employee_operation"("p_operation_id" "uuid", "p_status" "text", "p_error_code" "text", "p_error_details" "text", "p_stack_trace" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_employee_operation"("p_operation_id" "uuid", "p_status" "text", "p_error_code" "text", "p_error_details" "text", "p_stack_trace" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_employee_operation"("p_operation_id" "uuid", "p_status" "text", "p_error_code" "text", "p_error_details" "text", "p_stack_trace" "text") TO "service_role";



GRANT ALL ON TABLE "public"."schedule_operations" TO "anon";
GRANT ALL ON TABLE "public"."schedule_operations" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_operations" TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_schedule_operation"("p_operation_id" "uuid", "p_status" "text", "p_error_details" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_schedule_operation"("p_operation_id" "uuid", "p_status" "text", "p_error_details" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_schedule_operation"("p_operation_id" "uuid", "p_status" "text", "p_error_details" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."convert_time_between_zones"("p_time" time without time zone, "p_source_timezone" "text", "p_target_timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."convert_time_between_zones"("p_time" time without time zone, "p_source_timezone" "text", "p_target_timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."convert_time_between_zones"("p_time" time without time zone, "p_source_timezone" "text", "p_target_timezone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."convert_timezone"("p_timestamp" timestamp with time zone, "p_target_zone" "text", "p_config_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."convert_timezone"("p_timestamp" timestamp with time zone, "p_target_zone" "text", "p_config_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."convert_timezone"("p_timestamp" timestamp with time zone, "p_target_zone" "text", "p_config_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_audit_log"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_audit_log"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_audit_log"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_employee"("employee_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_employee"("employee_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_employee"("employee_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."down_20240328000001"() TO "anon";
GRANT ALL ON FUNCTION "public"."down_20240328000001"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."down_20240328000001"() TO "service_role";



GRANT ALL ON FUNCTION "public"."down_20240328000002"() TO "anon";
GRANT ALL ON FUNCTION "public"."down_20240328000002"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."down_20240328000002"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_schedule"("p_start_date" "date", "p_end_date" "date", "p_department_id" "uuid", "p_environment" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_schedule"("p_start_date" "date", "p_end_date" "date", "p_department_id" "uuid", "p_environment" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_schedule"("p_start_date" "date", "p_end_date" "date", "p_department_id" "uuid", "p_environment" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_auth_error_history"("p_user_id" "uuid", "p_action" "text", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_auth_error_history"("p_user_id" "uuid", "p_action" "text", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_auth_error_history"("p_user_id" "uuid", "p_action" "text", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_available_shifts"("p_employee_id" "uuid", "p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_available_shifts"("p_employee_id" "uuid", "p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_available_shifts"("p_employee_id" "uuid", "p_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_component_error_metrics"("p_component" "text", "p_time_window" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."get_component_error_metrics"("p_component" "text", "p_time_window" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_component_error_metrics"("p_component" "text", "p_time_window" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_cookie_success_rate"("p_cookie_name" "text", "p_operation" "text", "p_time_window" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."get_cookie_success_rate"("p_cookie_name" "text", "p_operation" "text", "p_time_window" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_cookie_success_rate"("p_cookie_name" "text", "p_operation" "text", "p_time_window" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_employees"("p_search_term" "text", "p_role" "public"."employee_role", "p_team_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_employees"("p_search_term" "text", "p_role" "public"."employee_role", "p_team_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_employees"("p_search_term" "text", "p_role" "public"."employee_role", "p_team_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_error_action_history"("p_path" "text", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_error_action_history"("p_path" "text", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_error_action_history"("p_path" "text", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_error_analytics_data"("p_component" "text", "p_storage_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_error_analytics_data"("p_component" "text", "p_storage_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_error_analytics_data"("p_component" "text", "p_storage_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_error_http_code"("p_error_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_error_http_code"("p_error_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_error_http_code"("p_error_code" "text") TO "service_role";



GRANT ALL ON TABLE "public"."jwt_templates" TO "anon";
GRANT ALL ON TABLE "public"."jwt_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."jwt_templates" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_jwt_template"("template_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_jwt_template"("template_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_jwt_template"("template_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pattern_action_history"("p_pattern_id" "uuid", "p_user_id" "uuid", "p_action_type" "public"."pattern_action_type", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_pattern_action_history"("p_pattern_id" "uuid", "p_user_id" "uuid", "p_action_type" "public"."pattern_action_type", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pattern_action_history"("p_pattern_id" "uuid", "p_user_id" "uuid", "p_action_type" "public"."pattern_action_type", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pattern_violations"("start_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_pattern_violations"("start_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pattern_violations"("start_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_rate_limit_metrics"("p_key" "text", "p_user_id" "uuid", "p_window_start" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_rate_limit_metrics"("p_key" "text", "p_user_id" "uuid", "p_window_start" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_rate_limit_metrics"("p_key" "text", "p_user_id" "uuid", "p_window_start" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_scheduler_config"("p_config_key" "text", "p_environment" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_scheduler_config"("p_config_key" "text", "p_environment" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_scheduler_config"("p_config_key" "text", "p_environment" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_scheduler_metrics_history"("p_metrics_type" "text", "p_environment" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_scheduler_metrics_history"("p_metrics_type" "text", "p_environment" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_scheduler_metrics_history"("p_metrics_type" "text", "p_environment" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_time_off_access_level"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_time_off_access_level"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_time_off_access_level"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_time_off_requests"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_time_off_requests"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_time_off_requests"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_auth_history"("p_user_id" "uuid", "p_time_window" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_auth_history"("p_user_id" "uuid", "p_time_window" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_auth_history"("p_user_id" "uuid", "p_time_window" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_week_number"("p_date" "date", "p_timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_week_number"("p_date" "date", "p_timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_week_number"("p_date" "date", "p_timezone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_deleted_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_deleted_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_deleted_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_valid_cookie_name"("p_cookie_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_valid_cookie_name"("p_cookie_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_valid_cookie_name"("p_cookie_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_valid_cookie_value"("p_cookie_value" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_valid_cookie_value"("p_cookie_value" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_valid_cookie_value"("p_cookie_value" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_valid_timezone"("p_timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_valid_timezone"("p_timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_valid_timezone"("p_timezone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_auth_error"("p_user_id" "uuid", "p_action" "text", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_ip_address" "text", "p_user_agent" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."log_auth_error"("p_user_id" "uuid", "p_action" "text", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_ip_address" "text", "p_user_agent" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_auth_error"("p_user_id" "uuid", "p_action" "text", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_ip_address" "text", "p_user_agent" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_auth_error"("p_error_type" "public"."auth_error_type", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_user_id" "uuid", "p_session_id" "uuid", "p_severity" "public"."auth_error_severity") TO "anon";
GRANT ALL ON FUNCTION "public"."log_auth_error"("p_error_type" "public"."auth_error_type", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_user_id" "uuid", "p_session_id" "uuid", "p_severity" "public"."auth_error_severity") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_auth_error"("p_error_type" "public"."auth_error_type", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_user_id" "uuid", "p_session_id" "uuid", "p_severity" "public"."auth_error_severity") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_auth_event"("p_event_type" "text", "p_user_id" "uuid", "p_metadata" "jsonb", "p_client_info" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_auth_event"("p_event_type" "text", "p_user_id" "uuid", "p_metadata" "jsonb", "p_client_info" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_auth_event"("p_event_type" "text", "p_user_id" "uuid", "p_metadata" "jsonb", "p_client_info" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_auth_event"("p_event_type" "text", "p_user_id" "uuid", "p_metadata" "jsonb", "p_success" boolean, "p_error_id" "uuid", "p_session_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."log_auth_event"("p_event_type" "text", "p_user_id" "uuid", "p_metadata" "jsonb", "p_success" boolean, "p_error_id" "uuid", "p_session_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_auth_event"("p_event_type" "text", "p_user_id" "uuid", "p_metadata" "jsonb", "p_success" boolean, "p_error_id" "uuid", "p_session_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_confirmation_attempt"("p_email" "text", "p_type" "text", "p_token_hash" "text", "p_ip_address" "text", "p_user_agent" "text", "p_success" boolean, "p_error_message" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."log_confirmation_attempt"("p_email" "text", "p_type" "text", "p_token_hash" "text", "p_ip_address" "text", "p_user_agent" "text", "p_success" boolean, "p_error_message" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_confirmation_attempt"("p_email" "text", "p_type" "text", "p_token_hash" "text", "p_ip_address" "text", "p_user_agent" "text", "p_success" boolean, "p_error_message" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_cookie_error"("p_error_type" "text", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_cookie_name" "text", "p_cookie_operation" "text", "p_user_id" "uuid", "p_session_id" "uuid", "p_request_path" "text", "p_request_method" "text", "p_ip_address" "text", "p_user_agent" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."log_cookie_error"("p_error_type" "text", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_cookie_name" "text", "p_cookie_operation" "text", "p_user_id" "uuid", "p_session_id" "uuid", "p_request_path" "text", "p_request_method" "text", "p_ip_address" "text", "p_user_agent" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_cookie_error"("p_error_type" "text", "p_error_code" "text", "p_error_message" "text", "p_error_details" "jsonb", "p_cookie_name" "text", "p_cookie_operation" "text", "p_user_id" "uuid", "p_session_id" "uuid", "p_request_path" "text", "p_request_method" "text", "p_ip_address" "text", "p_user_agent" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_cookie_metric"("p_cookie_name" "text", "p_operation" "text", "p_success" boolean, "p_duration_ms" integer, "p_user_id" "uuid", "p_session_id" "uuid", "p_request_path" "text", "p_request_method" "text", "p_user_agent" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."log_cookie_metric"("p_cookie_name" "text", "p_operation" "text", "p_success" boolean, "p_duration_ms" integer, "p_user_id" "uuid", "p_session_id" "uuid", "p_request_path" "text", "p_request_method" "text", "p_user_agent" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_cookie_metric"("p_cookie_name" "text", "p_operation" "text", "p_success" boolean, "p_duration_ms" integer, "p_user_id" "uuid", "p_session_id" "uuid", "p_request_path" "text", "p_request_method" "text", "p_user_agent" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_employee_access"("p_accessed_employee_id" "uuid", "p_action_type" "text", "p_success" boolean, "p_error_message" "text", "p_client_info" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_employee_access"("p_accessed_employee_id" "uuid", "p_action_type" "text", "p_success" boolean, "p_error_message" "text", "p_client_info" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_employee_access"("p_accessed_employee_id" "uuid", "p_action_type" "text", "p_success" boolean, "p_error_message" "text", "p_client_info" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_error_action"("p_action" "text", "p_path" "text", "p_timestamp" timestamp with time zone, "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_error_action"("p_action" "text", "p_path" "text", "p_timestamp" timestamp with time zone, "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_error_action"("p_action" "text", "p_path" "text", "p_timestamp" timestamp with time zone, "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_error_metrics"("p_component" "text", "p_metrics" "jsonb", "p_error_details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_error_metrics"("p_component" "text", "p_metrics" "jsonb", "p_error_details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_error_metrics"("p_component" "text", "p_metrics" "jsonb", "p_error_details" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_network_retry_metrics"("p_component" "text", "p_endpoint" "text", "p_metrics" "jsonb", "p_retry_details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_network_retry_metrics"("p_component" "text", "p_endpoint" "text", "p_metrics" "jsonb", "p_retry_details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_network_retry_metrics"("p_component" "text", "p_endpoint" "text", "p_metrics" "jsonb", "p_retry_details" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_pattern_action"("p_action_type" "public"."pattern_action_type", "p_pattern_id" "uuid", "p_pattern_name" "text", "p_pattern_type" "text", "p_error_message" "text", "p_error_code" "text", "p_metadata" "jsonb", "p_client_info" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_pattern_action"("p_action_type" "public"."pattern_action_type", "p_pattern_id" "uuid", "p_pattern_name" "text", "p_pattern_type" "text", "p_error_message" "text", "p_error_code" "text", "p_metadata" "jsonb", "p_client_info" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_pattern_action"("p_action_type" "public"."pattern_action_type", "p_pattern_id" "uuid", "p_pattern_name" "text", "p_pattern_type" "text", "p_error_message" "text", "p_error_code" "text", "p_metadata" "jsonb", "p_client_info" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_time_off_access"("p_user_id" "uuid", "p_accessed_user_id" "uuid", "p_access_type" "public"."time_off_access_level", "p_client_info" "jsonb", "p_request_path" "text", "p_request_method" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."log_time_off_access"("p_user_id" "uuid", "p_accessed_user_id" "uuid", "p_access_type" "public"."time_off_access_level", "p_client_info" "jsonb", "p_request_path" "text", "p_request_method" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_time_off_access"("p_user_id" "uuid", "p_accessed_user_id" "uuid", "p_access_type" "public"."time_off_access_level", "p_client_info" "jsonb", "p_request_path" "text", "p_request_method" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."normalize_period_format"("p_period_id" "text", "p_source_format" "public"."period_format", "p_target_format" "public"."period_format") TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_period_format"("p_period_id" "text", "p_source_format" "public"."period_format", "p_target_format" "public"."period_format") TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_period_format"("p_period_id" "text", "p_source_format" "public"."period_format", "p_target_format" "public"."period_format") TO "service_role";



GRANT ALL ON FUNCTION "public"."period_crosses_midnight"("p_start_time" "text", "p_end_time" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."period_crosses_midnight"("p_start_time" "text", "p_end_time" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."period_crosses_midnight"("p_start_time" "text", "p_end_time" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_overlapping_patterns"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_overlapping_patterns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_overlapping_patterns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_schedule_overlap"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_schedule_overlap"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_schedule_overlap"() TO "service_role";



GRANT ALL ON FUNCTION "public"."process_error_analytics_batch"("p_batch_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."process_error_analytics_batch"("p_batch_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_error_analytics_batch"("p_batch_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."record_scheduler_metrics"("p_metrics_type" "text", "p_metrics_value" "jsonb", "p_environment" "text", "p_measured_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."record_scheduler_metrics"("p_metrics_type" "text", "p_metrics_value" "jsonb", "p_environment" "text", "p_measured_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_scheduler_metrics"("p_metrics_type" "text", "p_metrics_value" "jsonb", "p_environment" "text", "p_measured_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."resolve_auth_error"("p_error_id" "uuid", "p_resolution_details" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_auth_error"("p_error_id" "uuid", "p_resolution_details" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_auth_error"("p_error_id" "uuid", "p_resolution_details" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rollback_transaction"() TO "anon";
GRANT ALL ON FUNCTION "public"."rollback_transaction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rollback_transaction"() TO "service_role";



GRANT ALL ON FUNCTION "public"."save_error_analytics_data"("p_component" "text", "p_storage_key" "text", "p_data" "jsonb", "p_size_bytes" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."save_error_analytics_data"("p_component" "text", "p_storage_key" "text", "p_data" "jsonb", "p_size_bytes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_error_analytics_data"("p_component" "text", "p_storage_key" "text", "p_data" "jsonb", "p_size_bytes" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."shifts_overlap"("p_start1" time without time zone, "p_end1" time without time zone, "p_start2" time without time zone, "p_end2" time without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."shifts_overlap"("p_start1" time without time zone, "p_end1" time without time zone, "p_start2" time without time zone, "p_end2" time without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."shifts_overlap"("p_start1" time without time zone, "p_end1" time without time zone, "p_start2" time without time zone, "p_end2" time without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."standardize_timestamps"() TO "anon";
GRANT ALL ON FUNCTION "public"."standardize_timestamps"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."standardize_timestamps"() TO "service_role";



GRANT ALL ON FUNCTION "public"."standardize_timezone"("p_timestamp" timestamp with time zone, "p_source_zone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."standardize_timezone"("p_timestamp" timestamp with time zone, "p_source_zone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."standardize_timezone"("p_timestamp" timestamp with time zone, "p_source_zone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."track_employee_operation"("p_employee_id" "uuid", "p_operation" "public"."employee_operation", "p_severity" "public"."operation_severity", "p_metadata" "jsonb", "p_client_info" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."track_employee_operation"("p_employee_id" "uuid", "p_operation" "public"."employee_operation", "p_severity" "public"."operation_severity", "p_metadata" "jsonb", "p_client_info" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_employee_operation"("p_employee_id" "uuid", "p_operation" "public"."employee_operation", "p_severity" "public"."operation_severity", "p_metadata" "jsonb", "p_client_info" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."track_schedule_operation"("p_schedule_id" "uuid", "p_operation" "public"."schedule_operation", "p_previous_state" "jsonb", "p_new_state" "jsonb", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."track_schedule_operation"("p_schedule_id" "uuid", "p_operation" "public"."schedule_operation", "p_previous_state" "jsonb", "p_new_state" "jsonb", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_schedule_operation"("p_schedule_id" "uuid", "p_operation" "public"."schedule_operation", "p_previous_state" "jsonb", "p_new_state" "jsonb", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_coverage_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_coverage_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_coverage_status"() TO "service_role";



GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON FUNCTION "public"."update_employee_and_profile"("p_employee_id" "uuid", "p_full_name" "text", "p_username" "text", "p_employee_role" "public"."employee_role_enum", "p_weekly_hours_scheduled" integer, "p_default_shift_type_id" "uuid", "p_allow_overtime" boolean, "p_max_weekly_hours" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_employee_and_profile"("p_employee_id" "uuid", "p_full_name" "text", "p_username" "text", "p_employee_role" "public"."employee_role_enum", "p_weekly_hours_scheduled" integer, "p_default_shift_type_id" "uuid", "p_allow_overtime" boolean, "p_max_weekly_hours" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_employee_and_profile"("p_employee_id" "uuid", "p_full_name" "text", "p_username" "text", "p_employee_role" "public"."employee_role_enum", "p_weekly_hours_scheduled" integer, "p_default_shift_type_id" "uuid", "p_allow_overtime" boolean, "p_max_weekly_hours" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_employee_role"("p_employee_id" "uuid", "p_new_role" "public"."employee_role", "p_reason" "text", "p_client_info" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_employee_role"("p_employee_id" "uuid", "p_new_role" "public"."employee_role", "p_reason" "text", "p_client_info" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_employee_role"("p_employee_id" "uuid", "p_new_role" "public"."employee_role", "p_reason" "text", "p_client_info" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_error_analytics_storage_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_error_analytics_storage_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_error_analytics_storage_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_error_analytics_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_error_analytics_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_error_analytics_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_error_metrics_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_error_metrics_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_error_metrics_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_network_retry_metrics_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_network_retry_metrics_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_network_retry_metrics_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_rate_limit_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_rate_limit_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_rate_limit_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_scheduler_config"("p_config_key" "text", "p_config_value" "jsonb", "p_environment" "text", "p_description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_scheduler_config"("p_config_key" "text", "p_config_value" "jsonb", "p_environment" "text", "p_description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_scheduler_config"("p_config_key" "text", "p_config_value" "jsonb", "p_environment" "text", "p_description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_business_hours"("p_start_time" time without time zone, "p_end_time" time without time zone, "p_timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_business_hours"("p_start_time" time without time zone, "p_end_time" time without time zone, "p_timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_business_hours"("p_start_time" time without time zone, "p_end_time" time without time zone, "p_timezone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_date_range"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_allow_null_end" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."validate_date_range"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_allow_null_end" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_date_range"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_allow_null_end" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_jwt_template"("template" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_jwt_template"("template" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_jwt_template"("template" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_overtime"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_overtime"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_overtime"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_password"("p_password" "text", "p_policy_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_password"("p_password" "text", "p_policy_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_password"("p_password" "text", "p_policy_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_period_format"("p_period_id" "text", "p_format" "public"."period_format") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_period_format"("p_period_id" "text", "p_format" "public"."period_format") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_period_format"("p_period_id" "text", "p_format" "public"."period_format") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_role_change"("p_employee_id" "uuid", "p_new_role" "public"."employee_role", "p_changed_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_role_change"("p_employee_id" "uuid", "p_new_role" "public"."employee_role", "p_changed_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_role_change"("p_employee_id" "uuid", "p_new_role" "public"."employee_role", "p_changed_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_schedule"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_schedule"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_schedule"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_schedule_against_pattern"("p_employee_id" "uuid", "p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_schedule_against_pattern"("p_employee_id" "uuid", "p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_schedule_against_pattern"("p_employee_id" "uuid", "p_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_schedule_overlap"("p_employee_id" "uuid", "p_period_start" timestamp with time zone, "p_period_end" timestamp with time zone, "p_exclude_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_schedule_overlap"("p_employee_id" "uuid", "p_period_start" timestamp with time zone, "p_period_end" timestamp with time zone, "p_exclude_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_schedule_overlap"("p_employee_id" "uuid", "p_period_start" timestamp with time zone, "p_period_end" timestamp with time zone, "p_exclude_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_schedule_status_transition"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_schedule_status_transition"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_schedule_status_transition"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_shift_assignment"("p_employee_id" "uuid", "p_shift_id" "uuid", "p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_shift_assignment"("p_employee_id" "uuid", "p_shift_id" "uuid", "p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_shift_assignment"("p_employee_id" "uuid", "p_shift_id" "uuid", "p_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_shift_overlap"("p_shift_id" "uuid", "p_employee_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."validate_shift_overlap"("p_shift_id" "uuid", "p_employee_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_shift_overlap"("p_shift_id" "uuid", "p_employee_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_shift_pattern"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_shift_pattern"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_shift_pattern"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_shift_pattern"("p_shifts" "jsonb", "p_pattern" "jsonb", "p_timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_shift_pattern"("p_shifts" "jsonb", "p_pattern" "jsonb", "p_timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_shift_pattern"("p_shifts" "jsonb", "p_pattern" "jsonb", "p_timezone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_shift_times"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_shift_times"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_shift_times"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_shift_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_shift_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_shift_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_staffing_requirements"("p_schedule_id" "uuid", "p_date" "date", "p_timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_staffing_requirements"("p_schedule_id" "uuid", "p_date" "date", "p_timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_staffing_requirements"("p_schedule_id" "uuid", "p_date" "date", "p_timezone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_time_off_request"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_request_type" "text", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_time_off_request"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_request_type" "text", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_time_off_request"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date", "p_request_type" "text", "p_reason" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."auth_confirmation_attempts" TO "anon";
GRANT ALL ON TABLE "public"."auth_confirmation_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_confirmation_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."auth_error_logs" TO "anon";
GRANT ALL ON TABLE "public"."auth_error_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_error_logs" TO "service_role";



GRANT ALL ON TABLE "public"."auth_errors" TO "anon";
GRANT ALL ON TABLE "public"."auth_errors" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_errors" TO "service_role";



GRANT ALL ON TABLE "public"."auth_event_logs" TO "anon";
GRANT ALL ON TABLE "public"."auth_event_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_event_logs" TO "service_role";



GRANT ALL ON TABLE "public"."auth_events" TO "anon";
GRANT ALL ON TABLE "public"."auth_events" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_events" TO "service_role";



GRANT ALL ON TABLE "public"."cookie_errors" TO "anon";
GRANT ALL ON TABLE "public"."cookie_errors" TO "authenticated";
GRANT ALL ON TABLE "public"."cookie_errors" TO "service_role";



GRANT ALL ON TABLE "public"."cookie_metrics" TO "anon";
GRANT ALL ON TABLE "public"."cookie_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."cookie_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."daily_coverage" TO "anon";
GRANT ALL ON TABLE "public"."daily_coverage" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_coverage" TO "service_role";



GRANT ALL ON TABLE "public"."employee_access_logs" TO "anon";
GRANT ALL ON TABLE "public"."employee_access_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_access_logs" TO "service_role";



GRANT ALL ON TABLE "public"."employee_patterns" TO "anon";
GRANT ALL ON TABLE "public"."employee_patterns" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_patterns" TO "service_role";



GRANT ALL ON TABLE "public"."employee_role_history" TO "anon";
GRANT ALL ON TABLE "public"."employee_role_history" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_role_history" TO "service_role";



GRANT ALL ON TABLE "public"."employee_shift_preferences" TO "anon";
GRANT ALL ON TABLE "public"."employee_shift_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_shift_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."error_actions" TO "anon";
GRANT ALL ON TABLE "public"."error_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."error_actions" TO "service_role";



GRANT ALL ON TABLE "public"."error_analytics_config" TO "anon";
GRANT ALL ON TABLE "public"."error_analytics_config" TO "authenticated";
GRANT ALL ON TABLE "public"."error_analytics_config" TO "service_role";



GRANT ALL ON TABLE "public"."error_analytics_data" TO "anon";
GRANT ALL ON TABLE "public"."error_analytics_data" TO "authenticated";
GRANT ALL ON TABLE "public"."error_analytics_data" TO "service_role";



GRANT ALL ON TABLE "public"."error_analytics_storage" TO "anon";
GRANT ALL ON TABLE "public"."error_analytics_storage" TO "authenticated";
GRANT ALL ON TABLE "public"."error_analytics_storage" TO "service_role";



GRANT ALL ON TABLE "public"."error_analytics_trends" TO "anon";
GRANT ALL ON TABLE "public"."error_analytics_trends" TO "authenticated";
GRANT ALL ON TABLE "public"."error_analytics_trends" TO "service_role";



GRANT ALL ON TABLE "public"."error_metrics" TO "anon";
GRANT ALL ON TABLE "public"."error_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."error_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."error_status_codes" TO "anon";
GRANT ALL ON TABLE "public"."error_status_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."error_status_codes" TO "service_role";



GRANT ALL ON TABLE "public"."jwt_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."jwt_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."jwt_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."network_retry_metrics" TO "anon";
GRANT ALL ON TABLE "public"."network_retry_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."network_retry_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."organization_users" TO "anon";
GRANT ALL ON TABLE "public"."organization_users" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_users" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."password_history" TO "anon";
GRANT ALL ON TABLE "public"."password_history" TO "authenticated";
GRANT ALL ON TABLE "public"."password_history" TO "service_role";



GRANT ALL ON TABLE "public"."password_policies" TO "anon";
GRANT ALL ON TABLE "public"."password_policies" TO "authenticated";
GRANT ALL ON TABLE "public"."password_policies" TO "service_role";



GRANT ALL ON TABLE "public"."pattern_actions" TO "anon";
GRANT ALL ON TABLE "public"."pattern_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."pattern_actions" TO "service_role";



GRANT ALL ON TABLE "public"."period_format_issues" TO "anon";
GRANT ALL ON TABLE "public"."period_format_issues" TO "authenticated";
GRANT ALL ON TABLE "public"."period_format_issues" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."rate_limit_config" TO "anon";
GRANT ALL ON TABLE "public"."rate_limit_config" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limit_config" TO "service_role";



GRANT ALL ON TABLE "public"."rate_limit_metrics" TO "anon";
GRANT ALL ON TABLE "public"."rate_limit_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limit_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."schedule_settings" TO "anon";
GRANT ALL ON TABLE "public"."schedule_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_settings" TO "service_role";



GRANT ALL ON TABLE "public"."scheduler_config" TO "anon";
GRANT ALL ON TABLE "public"."scheduler_config" TO "authenticated";
GRANT ALL ON TABLE "public"."scheduler_config" TO "service_role";



GRANT ALL ON TABLE "public"."scheduler_metrics" TO "anon";
GRANT ALL ON TABLE "public"."scheduler_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."scheduler_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."scheduler_metrics_history" TO "anon";
GRANT ALL ON TABLE "public"."scheduler_metrics_history" TO "authenticated";
GRANT ALL ON TABLE "public"."scheduler_metrics_history" TO "service_role";



GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";



GRANT ALL ON TABLE "public"."shift_patterns" TO "anon";
GRANT ALL ON TABLE "public"."shift_patterns" TO "authenticated";
GRANT ALL ON TABLE "public"."shift_patterns" TO "service_role";



GRANT ALL ON TABLE "public"."shift_types" TO "anon";
GRANT ALL ON TABLE "public"."shift_types" TO "authenticated";
GRANT ALL ON TABLE "public"."shift_types" TO "service_role";



GRANT ALL ON TABLE "public"."shifts" TO "anon";
GRANT ALL ON TABLE "public"."shifts" TO "authenticated";
GRANT ALL ON TABLE "public"."shifts" TO "service_role";



GRANT ALL ON TABLE "public"."staffing_requirements" TO "anon";
GRANT ALL ON TABLE "public"."staffing_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."staffing_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."storage_quotas" TO "anon";
GRANT ALL ON TABLE "public"."storage_quotas" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_quotas" TO "service_role";



GRANT ALL ON TABLE "public"."time_off_access_logs" TO "anon";
GRANT ALL ON TABLE "public"."time_off_access_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."time_off_access_logs" TO "service_role";



GRANT ALL ON TABLE "public"."time_off_requests" TO "anon";
GRANT ALL ON TABLE "public"."time_off_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."time_off_requests" TO "service_role";



GRANT ALL ON TABLE "public"."timezone_configs" TO "anon";
GRANT ALL ON TABLE "public"."timezone_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."timezone_configs" TO "service_role";



GRANT ALL ON TABLE "public"."validation_history" TO "anon";
GRANT ALL ON TABLE "public"."validation_history" TO "authenticated";
GRANT ALL ON TABLE "public"."validation_history" TO "service_role";



GRANT ALL ON TABLE "public"."validation_rules" TO "anon";
GRANT ALL ON TABLE "public"."validation_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."validation_rules" TO "service_role";



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
