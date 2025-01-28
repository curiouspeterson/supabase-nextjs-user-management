-- Type creation is handled in 20250128135506_remote_types.sql

drop trigger if exists "update_alert_templates_updated_at" on "public"."alert_templates";

drop trigger if exists "update_alerts_updated_at" on "public"."alerts";

drop trigger if exists "update_employee_operations_updated_at" on "public"."employee_operations";

drop trigger if exists "update_error_status_codes_updated_at" on "public"."error_status_codes";

drop trigger if exists "update_health_check_config_updated_at" on "public"."health_check_config";

drop trigger if exists "update_jwt_templates_updated_at" on "public"."jwt_templates";

drop trigger if exists "update_schedule_operations_updated_at" on "public"."schedule_operations";

drop trigger if exists "update_status_colors_updated_at" on "public"."status_colors";

drop policy "Users can view their organization's alert templates" on "public"."alert_templates";

drop policy "Users can view their organization's alerts" on "public"."alerts";

drop policy "Admins can view all audit logs" on "public"."audit_logs";

drop policy "Users can view their organization's health checks" on "public"."health_check_config";

drop policy "Users can view their organization's health results" on "public"."health_check_results";

drop policy "Admins can update all profiles" on "public"."profiles";

drop policy "Users can update own profile" on "public"."profiles";

drop policy "Users can view own profile" on "public"."profiles";

drop policy "Admins can view all logs" on "public"."request_logs";

drop policy "Users can view their schedule operations" on "public"."schedule_operations";

drop policy "Users can view their organization's metrics" on "public"."scheduler_metrics";

drop policy "Users can view their schedules" on "public"."schedules";

drop policy "Users can view their organization's status colors" on "public"."status_colors";

drop policy "Users can view their time off requests" on "public"."time_off_requests";

drop policy "Admins can view all employee operations" on "public"."employee_operations";

drop policy "Users can view their own operations" on "public"."employee_operations";

drop policy "Only admins can modify error status codes" on "public"."error_status_codes";

drop policy "Admins can view all JWT audit logs" on "public"."jwt_audit_logs";

drop policy "Users can view their own JWT audit logs" on "public"."jwt_audit_logs";

drop policy "Admins can manage JWT templates" on "public"."jwt_templates";

drop policy "Users can view their organization memberships" on "public"."organization_users";

revoke delete on table "public"."alert_templates" from "anon";

revoke insert on table "public"."alert_templates" from "anon";

revoke references on table "public"."alert_templates" from "anon";

revoke select on table "public"."alert_templates" from "anon";

revoke trigger on table "public"."alert_templates" from "anon";

revoke truncate on table "public"."alert_templates" from "anon";

revoke update on table "public"."alert_templates" from "anon";

revoke delete on table "public"."alert_templates" from "authenticated";

revoke insert on table "public"."alert_templates" from "authenticated";

revoke references on table "public"."alert_templates" from "authenticated";

revoke select on table "public"."alert_templates" from "authenticated";

revoke trigger on table "public"."alert_templates" from "authenticated";

revoke truncate on table "public"."alert_templates" from "authenticated";

revoke update on table "public"."alert_templates" from "authenticated";

revoke delete on table "public"."alert_templates" from "service_role";

revoke insert on table "public"."alert_templates" from "service_role";

revoke references on table "public"."alert_templates" from "service_role";

revoke select on table "public"."alert_templates" from "service_role";

revoke trigger on table "public"."alert_templates" from "service_role";

revoke truncate on table "public"."alert_templates" from "service_role";

revoke update on table "public"."alert_templates" from "service_role";

revoke delete on table "public"."alerts" from "anon";

revoke insert on table "public"."alerts" from "anon";

revoke references on table "public"."alerts" from "anon";

revoke select on table "public"."alerts" from "anon";

revoke trigger on table "public"."alerts" from "anon";

revoke truncate on table "public"."alerts" from "anon";

revoke update on table "public"."alerts" from "anon";

revoke delete on table "public"."alerts" from "authenticated";

revoke insert on table "public"."alerts" from "authenticated";

revoke references on table "public"."alerts" from "authenticated";

revoke select on table "public"."alerts" from "authenticated";

revoke trigger on table "public"."alerts" from "authenticated";

revoke truncate on table "public"."alerts" from "authenticated";

revoke update on table "public"."alerts" from "authenticated";

revoke delete on table "public"."alerts" from "service_role";

revoke insert on table "public"."alerts" from "service_role";

revoke references on table "public"."alerts" from "service_role";

revoke select on table "public"."alerts" from "service_role";

revoke trigger on table "public"."alerts" from "service_role";

revoke truncate on table "public"."alerts" from "service_role";

revoke update on table "public"."alerts" from "service_role";

revoke delete on table "public"."health_check_config" from "anon";

revoke insert on table "public"."health_check_config" from "anon";

revoke references on table "public"."health_check_config" from "anon";

revoke select on table "public"."health_check_config" from "anon";

revoke trigger on table "public"."health_check_config" from "anon";

revoke truncate on table "public"."health_check_config" from "anon";

revoke update on table "public"."health_check_config" from "anon";

revoke delete on table "public"."health_check_config" from "authenticated";

revoke insert on table "public"."health_check_config" from "authenticated";

revoke references on table "public"."health_check_config" from "authenticated";

revoke select on table "public"."health_check_config" from "authenticated";

revoke trigger on table "public"."health_check_config" from "authenticated";

revoke truncate on table "public"."health_check_config" from "authenticated";

revoke update on table "public"."health_check_config" from "authenticated";

revoke delete on table "public"."health_check_config" from "service_role";

revoke insert on table "public"."health_check_config" from "service_role";

revoke references on table "public"."health_check_config" from "service_role";

revoke select on table "public"."health_check_config" from "service_role";

revoke trigger on table "public"."health_check_config" from "service_role";

revoke truncate on table "public"."health_check_config" from "service_role";

revoke update on table "public"."health_check_config" from "service_role";

revoke delete on table "public"."health_check_results" from "anon";

revoke insert on table "public"."health_check_results" from "anon";

revoke references on table "public"."health_check_results" from "anon";

revoke select on table "public"."health_check_results" from "anon";

revoke trigger on table "public"."health_check_results" from "anon";

revoke truncate on table "public"."health_check_results" from "anon";

revoke update on table "public"."health_check_results" from "anon";

revoke delete on table "public"."health_check_results" from "authenticated";

revoke insert on table "public"."health_check_results" from "authenticated";

revoke references on table "public"."health_check_results" from "authenticated";

revoke select on table "public"."health_check_results" from "authenticated";

revoke trigger on table "public"."health_check_results" from "authenticated";

revoke truncate on table "public"."health_check_results" from "authenticated";

revoke update on table "public"."health_check_results" from "authenticated";

revoke delete on table "public"."health_check_results" from "service_role";

revoke insert on table "public"."health_check_results" from "service_role";

revoke references on table "public"."health_check_results" from "service_role";

revoke select on table "public"."health_check_results" from "service_role";

revoke trigger on table "public"."health_check_results" from "service_role";

revoke truncate on table "public"."health_check_results" from "service_role";

revoke update on table "public"."health_check_results" from "service_role";

revoke delete on table "public"."request_logs" from "anon";

revoke insert on table "public"."request_logs" from "anon";

revoke references on table "public"."request_logs" from "anon";

revoke select on table "public"."request_logs" from "anon";

revoke trigger on table "public"."request_logs" from "anon";

revoke truncate on table "public"."request_logs" from "anon";

revoke update on table "public"."request_logs" from "anon";

revoke delete on table "public"."request_logs" from "authenticated";

revoke insert on table "public"."request_logs" from "authenticated";

revoke references on table "public"."request_logs" from "authenticated";

revoke select on table "public"."request_logs" from "authenticated";

revoke trigger on table "public"."request_logs" from "authenticated";

revoke truncate on table "public"."request_logs" from "authenticated";

revoke update on table "public"."request_logs" from "authenticated";

revoke delete on table "public"."request_logs" from "service_role";

revoke insert on table "public"."request_logs" from "service_role";

revoke references on table "public"."request_logs" from "service_role";

revoke select on table "public"."request_logs" from "service_role";

revoke trigger on table "public"."request_logs" from "service_role";

revoke truncate on table "public"."request_logs" from "service_role";

revoke update on table "public"."request_logs" from "service_role";

revoke delete on table "public"."status_colors" from "anon";

revoke insert on table "public"."status_colors" from "anon";

revoke references on table "public"."status_colors" from "anon";

revoke select on table "public"."status_colors" from "anon";

revoke trigger on table "public"."status_colors" from "anon";

revoke truncate on table "public"."status_colors" from "anon";

revoke update on table "public"."status_colors" from "anon";

revoke delete on table "public"."status_colors" from "authenticated";

revoke insert on table "public"."status_colors" from "authenticated";

revoke references on table "public"."status_colors" from "authenticated";

revoke select on table "public"."status_colors" from "authenticated";

revoke trigger on table "public"."status_colors" from "authenticated";

revoke truncate on table "public"."status_colors" from "authenticated";

revoke update on table "public"."status_colors" from "authenticated";

revoke delete on table "public"."status_colors" from "service_role";

revoke insert on table "public"."status_colors" from "service_role";

revoke references on table "public"."status_colors" from "service_role";

revoke select on table "public"."status_colors" from "service_role";

revoke trigger on table "public"."status_colors" from "service_role";

revoke truncate on table "public"."status_colors" from "service_role";

revoke update on table "public"."status_colors" from "service_role";

alter table "public"."alert_templates" drop constraint "alert_templates_organization_id_fkey";

alter table "public"."alert_templates" drop constraint "alert_templates_organization_id_name_key";

alter table "public"."alerts" drop constraint "alerts_organization_id_fkey";

alter table "public"."alerts" drop constraint "alerts_resolved_by_fkey";

alter table "public"."alerts" drop constraint "alerts_template_id_fkey";

alter table "public"."audit_logs" drop constraint "valid_operation";

alter table "public"."health_check_config" drop constraint "health_check_config_organization_id_check_name_key";

alter table "public"."health_check_config" drop constraint "health_check_config_organization_id_fkey";

alter table "public"."health_check_results" drop constraint "health_check_results_config_id_fkey";

alter table "public"."health_check_results" drop constraint "health_check_results_organization_id_fkey";

alter table "public"."profiles" drop constraint "valid_metadata_schema";

alter table "public"."profiles" drop constraint "valid_preferences_schema";

alter table "public"."request_logs" drop constraint "request_logs_check";

alter table "public"."request_logs" drop constraint "request_logs_organization_id_fkey";

alter table "public"."scheduler_metrics" drop constraint "scheduler_metrics_organization_id_fkey";

alter table "public"."scheduler_metrics" drop constraint "valid_metrics_schema";

alter table "public"."schedules" drop constraint "schedules_organization_id_fkey";

alter table "public"."status_colors" drop constraint "status_colors_organization_id_fkey";

alter table "public"."status_colors" drop constraint "status_colors_organization_id_status_key";

alter table "public"."time_off_requests" drop constraint "time_off_requests_organization_id_fkey";

alter table "public"."time_off_requests" drop constraint "valid_date_range";

alter table "public"."time_off_requests" drop constraint "valid_status";

alter table "public"."schedules" drop constraint "schedules_employee_id_fkey";

drop function if exists "public"."generate_health_alerts"();

drop function if exists "public"."get_metrics_history"(p_organization_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone, p_interval interval);

drop function if exists "public"."get_user_profile"(p_user_id uuid);

drop function if exists "public"."log_auth_error"(p_user_id uuid, p_action text, p_error_code text, p_error_message text, p_ip_address text, p_user_agent text);

drop function if exists "public"."log_request"(p_message text, p_level log_level, p_request_data jsonb, p_user_data jsonb, p_metadata jsonb);

alter table "public"."alert_templates" drop constraint "alert_templates_pkey";

alter table "public"."alerts" drop constraint "alerts_pkey";

alter table "public"."health_check_config" drop constraint "health_check_config_pkey";

alter table "public"."health_check_results" drop constraint "health_check_results_pkey";

alter table "public"."request_logs" drop constraint "request_logs_pkey";

alter table "public"."status_colors" drop constraint "status_colors_pkey";

drop index if exists "public"."alert_templates_organization_id_name_key";

drop index if exists "public"."alert_templates_pkey";

drop index if exists "public"."alerts_pkey";

drop index if exists "public"."health_check_config_organization_id_check_name_key";

drop index if exists "public"."health_check_config_pkey";

drop index if exists "public"."health_check_results_pkey";

drop index if exists "public"."idx_alerts_org_date";

drop index if exists "public"."idx_alerts_severity";

drop index if exists "public"."idx_alerts_template";

drop index if exists "public"."idx_error_codes_status";

drop index if exists "public"."idx_health_results_config";

drop index if exists "public"."idx_health_results_org_date";

drop index if exists "public"."idx_health_results_status";

drop index if exists "public"."idx_metrics_org_time";

drop index if exists "public"."idx_metrics_status";

drop index if exists "public"."idx_profiles_role";

drop index if exists "public"."idx_profiles_status";

drop index if exists "public"."idx_request_logs_created_at";

drop index if exists "public"."idx_request_logs_level";

drop index if exists "public"."idx_request_logs_org";

drop index if exists "public"."idx_schedules_organization";

drop index if exists "public"."idx_time_off_dates";

drop index if exists "public"."idx_time_off_employee";

drop index if exists "public"."idx_time_off_status";

drop index if exists "public"."request_logs_pkey";

drop index if exists "public"."status_colors_organization_id_status_key";

drop index if exists "public"."status_colors_pkey";

drop table "public"."alert_templates";

drop table "public"."alerts";

drop table "public"."health_check_config";

drop table "public"."health_check_results";

drop table "public"."request_logs";

drop table "public"."status_colors";

-- Create new type
-- create type "public"."schedule_status" as enum ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'CANCELLED');

-- Update existing values
-- UPDATE public.schedules SET status = CASE WHEN UPPER(status) = 'DRAFT' THEN 'DRAFT' WHEN UPPER(status) = 'PUBLISHED' THEN 'PUBLISHED' WHEN UPPER(status) = 'PENDING' THEN 'PENDING' WHEN UPPER(status) = 'APPROVED' THEN 'APPROVED' WHEN UPPER(status) = 'CANCELLED' THEN 'CANCELLED' ELSE 'DRAFT' END;

-- Handle column type change
-- ALTER TABLE public.schedules ALTER COLUMN status DROP DEFAULT;
-- ALTER TABLE public.schedules ALTER COLUMN status TYPE public.schedule_status USING CASE WHEN UPPER(status) = 'DRAFT' THEN 'DRAFT'::public.schedule_status WHEN UPPER(status) = 'PUBLISHED' THEN 'PUBLISHED'::public.schedule_status WHEN UPPER(status) = 'PENDING' THEN 'PENDING'::public.schedule_status WHEN UPPER(status) = 'APPROVED' THEN 'APPROVED'::public.schedule_status WHEN UPPER(status) = 'CANCELLED' THEN 'CANCELLED'::public.schedule_status ELSE 'DRAFT'::public.schedule_status END;
-- ALTER TABLE public.schedules ALTER COLUMN status SET DEFAULT 'DRAFT'::public.schedule_status;

-- Remove old type drop
-- drop type "public"."schedule_status__old_version_to_be_dropped";

create table "public"."auth_confirmation_attempts" (
    "id" uuid not null default uuid_generate_v4(),
    "email" text,
    "type" text not null,
    "token_hash" text,
    "ip_address" text,
    "user_agent" text,
    "success" boolean not null default false,
    "error_message" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."auth_confirmation_attempts" enable row level security;

create table "public"."auth_error_logs" (
    "id" uuid not null default uuid_generate_v4(),
    "error_type" auth_error_type not null,
    "error_code" text not null,
    "error_message" text not null,
    "error_details" jsonb,
    "severity" auth_error_severity not null default 'MEDIUM'::auth_error_severity,
    "user_id" uuid,
    "session_id" uuid,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now(),
    "resolved_at" timestamp with time zone,
    "resolution_details" jsonb,
    "retry_count" integer not null default 0,
    "last_retry_at" timestamp with time zone,
    "recovery_strategy" text
);


alter table "public"."auth_error_logs" enable row level security;

create table "public"."auth_errors" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "action_type" text not null,
    "error_code" text not null,
    "error_message" text,
    "error_details" jsonb default '{}'::jsonb,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."auth_errors" enable row level security;

create table "public"."auth_event_logs" (
    "id" uuid not null default uuid_generate_v4(),
    "event_type" text not null,
    "user_id" uuid,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "success" boolean not null default true,
    "error_id" uuid,
    "session_id" uuid,
    "ip_address" text,
    "user_agent" text
);


alter table "public"."auth_event_logs" enable row level security;

create table "public"."auth_events" (
    "id" uuid not null default uuid_generate_v4(),
    "event_type" text not null,
    "user_id" uuid,
    "metadata" jsonb,
    "client_info" jsonb,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."auth_events" enable row level security;

create table "public"."cookie_errors" (
    "id" uuid not null default uuid_generate_v4(),
    "error_type" text not null,
    "error_code" text,
    "error_message" text,
    "error_details" jsonb,
    "cookie_name" text,
    "cookie_operation" text,
    "user_id" uuid,
    "session_id" uuid,
    "request_path" text,
    "request_method" text,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."cookie_errors" enable row level security;

create table "public"."cookie_metrics" (
    "id" uuid not null default uuid_generate_v4(),
    "cookie_name" text not null,
    "operation" text not null,
    "success" boolean not null,
    "duration_ms" integer,
    "user_id" uuid,
    "session_id" uuid,
    "request_path" text,
    "request_method" text,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."cookie_metrics" enable row level security;

create table "public"."daily_coverage" (
    "id" uuid not null default gen_random_uuid(),
    "date" date not null,
    "period_id" uuid not null,
    "actual_coverage" integer not null default 0,
    "coverage_status" coverage_status_enum not null default 'Under'::coverage_status_enum,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "supervisor_count" integer not null default 0,
    "overtime_hours" integer not null default 0
);


alter table "public"."daily_coverage" enable row level security;

create table "public"."employee_access_logs" (
    "id" uuid not null default uuid_generate_v4(),
    "accessor_id" uuid,
    "accessed_employee_id" uuid,
    "action_type" text not null,
    "success" boolean not null default true,
    "error_message" text,
    "client_info" jsonb,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."employee_access_logs" enable row level security;

create table "public"."employee_patterns" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid not null,
    "pattern_id" uuid not null,
    "start_date" date not null,
    "end_date" date,
    "rotation_start_date" date not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."employee_patterns" enable row level security;

create table "public"."employee_role_history" (
    "id" uuid not null default uuid_generate_v4(),
    "employee_id" uuid,
    "previous_role" employee_role,
    "new_role" employee_role,
    "changed_by" uuid,
    "changed_at" timestamp with time zone not null default now(),
    "reason" text,
    "client_info" jsonb
);


alter table "public"."employee_role_history" enable row level security;

create table "public"."employee_shift_preferences" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid not null,
    "shift_type_id" uuid not null,
    "preference_level" integer not null default 0,
    "effective_date" date not null,
    "expiry_date" date,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."employees" (
    "id" uuid not null,
    "user_role" user_role_enum not null,
    "weekly_hours_scheduled" integer default 0,
    "default_shift_type_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "allow_overtime" boolean not null default false,
    "max_weekly_hours" integer not null default 40,
    "employee_role" employee_role not null
);


alter table "public"."employees" enable row level security;

create table "public"."error_actions" (
    "id" uuid not null default uuid_generate_v4(),
    "action" text not null,
    "path" text not null,
    "user_id" uuid,
    "action_timestamp" timestamp with time zone not null default now(),
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."error_actions" enable row level security;

create table "public"."error_analytics_config" (
    "id" uuid not null default uuid_generate_v4(),
    "component" text not null,
    "max_contexts" integer not null default 100,
    "max_user_agents" integer not null default 50,
    "max_urls" integer not null default 100,
    "max_trends" integer not null default 1000,
    "trend_period_ms" integer not null default 3600000,
    "retention_days" integer not null default 30,
    "batch_size" integer not null default 50,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."error_analytics_config" enable row level security;

create table "public"."error_analytics_data" (
    "id" uuid not null default uuid_generate_v4(),
    "component" text not null,
    "error_type" text not null,
    "error_message" text,
    "context" jsonb,
    "user_agent" text,
    "url" text,
    "timestamp" timestamp with time zone not null default now(),
    "batch_id" uuid,
    "processed" boolean default false,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."error_analytics_data" enable row level security;

create table "public"."error_analytics_storage" (
    "id" uuid not null default uuid_generate_v4(),
    "component" text not null,
    "storage_key" text not null,
    "data" jsonb not null,
    "size_bytes" integer not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "last_accessed" timestamp with time zone,
    "retention_days" integer default 30
);


alter table "public"."error_analytics_storage" enable row level security;

create table "public"."error_analytics_trends" (
    "id" uuid not null default uuid_generate_v4(),
    "component" text not null,
    "error_type" text not null,
    "count" integer not null default 0,
    "first_seen" timestamp with time zone not null,
    "last_seen" timestamp with time zone not null,
    "contexts" jsonb default '[]'::jsonb,
    "user_agents" jsonb default '[]'::jsonb,
    "urls" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."error_analytics_trends" enable row level security;

create table "public"."error_metrics" (
    "id" uuid not null default uuid_generate_v4(),
    "component" text not null,
    "error_count" integer not null default 0,
    "recovery_attempts" integer not null default 0,
    "successful_recoveries" integer not null default 0,
    "last_error" timestamp with time zone,
    "error_details" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."error_metrics" enable row level security;

create table "public"."network_retry_metrics" (
    "id" uuid not null default uuid_generate_v4(),
    "component" text not null,
    "endpoint" text not null,
    "total_retries" integer not null default 0,
    "successful_retries" integer not null default 0,
    "failed_retries" integer not null default 0,
    "last_retry" timestamp with time zone,
    "avg_retry_delay" numeric,
    "max_retry_delay" numeric,
    "retry_details" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."network_retry_metrics" enable row level security;

create table "public"."password_history" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "password_hash" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."password_history" enable row level security;

create table "public"."password_policies" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "policy" password_policy not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by" uuid,
    "updated_by" uuid
);


alter table "public"."password_policies" enable row level security;

create table "public"."pattern_actions" (
    "id" uuid not null default uuid_generate_v4(),
    "action_type" pattern_action_type not null,
    "pattern_id" uuid,
    "user_id" uuid,
    "pattern_name" text,
    "pattern_type" text,
    "error_message" text,
    "error_code" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "client_info" jsonb
);


alter table "public"."pattern_actions" enable row level security;

create table "public"."period_format_issues" (
    "id" uuid not null default uuid_generate_v4(),
    "period_id" text not null,
    "source_format" period_format not null,
    "error_message" text not null,
    "component" text not null,
    "created_at" timestamp with time zone not null default now(),
    "resolved_at" timestamp with time zone,
    "resolution" text
);


alter table "public"."period_format_issues" enable row level security;

create table "public"."rate_limit_config" (
    "id" uuid not null default uuid_generate_v4(),
    "key" text not null,
    "max_requests" integer not null,
    "window_seconds" integer not null,
    "burst_limit" integer,
    "enabled" boolean default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."rate_limit_config" enable row level security;

create table "public"."rate_limit_metrics" (
    "id" uuid not null default uuid_generate_v4(),
    "key" text not null,
    "user_id" uuid,
    "request_count" integer not null default 0,
    "window_start" timestamp with time zone not null,
    "last_request" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."rate_limit_metrics" enable row level security;

create table "public"."scheduler_config" (
    "id" uuid not null default gen_random_uuid(),
    "config_key" text not null,
    "config_value" jsonb not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by" uuid,
    "updated_by" uuid,
    "environment" text not null default 'development'::text,
    "is_active" boolean not null default true,
    "timezone" text not null default 'UTC'::text
);


create table "public"."scheduler_metrics_history" (
    "id" uuid not null default gen_random_uuid(),
    "metrics_type" text not null,
    "metrics_value" jsonb not null,
    "environment" text not null,
    "created_at" timestamp with time zone not null default now(),
    "measured_at" timestamp with time zone not null
);


create table "public"."shift_patterns" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "pattern_type" shift_pattern_type_enum not null,
    "days_on" integer not null,
    "days_off" integer not null,
    "shift_duration" integer not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."shift_patterns" enable row level security;

create table "public"."shift_types" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."shift_types" enable row level security;

create table "public"."shifts" (
    "id" uuid not null default uuid_generate_v4(),
    "shift_type_id" uuid not null,
    "start_time" time without time zone not null,
    "end_time" time without time zone not null,
    "duration_hours" integer not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "duration_category" shift_duration_category not null
);


alter table "public"."shifts" enable row level security;

create table "public"."staffing_requirements" (
    "id" uuid not null default uuid_generate_v4(),
    "period_name" text not null,
    "start_time" time without time zone not null,
    "end_time" time without time zone not null,
    "minimum_employees" integer not null,
    "shift_supervisor_required" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."staffing_requirements" enable row level security;

create table "public"."storage_quotas" (
    "id" uuid not null default uuid_generate_v4(),
    "component" text not null,
    "max_size_bytes" integer not null default 5242880,
    "current_size_bytes" integer not null default 0,
    "quota_alert_threshold" double precision not null default 0.8,
    "last_cleanup" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."storage_quotas" enable row level security;

create table "public"."time_off_access_logs" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "accessed_user_id" uuid,
    "access_type" time_off_access_level not null,
    "accessed_at" timestamp with time zone not null default now(),
    "client_info" jsonb,
    "request_path" text,
    "request_method" text
);


alter table "public"."time_off_access_logs" enable row level security;

create table "public"."timezone_configs" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "policy" timezone_policy not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by" uuid,
    "updated_by" uuid
);


alter table "public"."timezone_configs" enable row level security;

create table "public"."validation_history" (
    "id" uuid not null default uuid_generate_v4(),
    "schedule_id" uuid not null,
    "validation_type" text not null,
    "is_valid" boolean not null,
    "error_code" text,
    "error_message" text,
    "error_details" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid
);


alter table "public"."validation_history" enable row level security;

create table "public"."validation_rules" (
    "id" uuid not null default uuid_generate_v4(),
    "rule_type" text not null,
    "rule_name" text not null,
    "rule_config" jsonb not null,
    "is_active" boolean not null default true,
    "priority" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."validation_rules" enable row level security;

-- Commented out duplicate type conversion
-- alter table "public"."schedules" alter column status type "public"."schedule_status" using status::text::"public"."schedule_status";

-- Commented out unnecessary drop type
-- drop type "public"."schedule_status__old_version_to_be_dropped";

alter table "public"."profiles" drop column "created_at";

alter table "public"."profiles" drop column "last_active";

alter table "public"."profiles" drop column "metadata";

alter table "public"."profiles" drop column "preferences";

alter table "public"."profiles" drop column "status";

alter table "public"."profiles" add column "username" text;

alter table "public"."profiles" add column "website" text;

-- Fix role column type and default
alter table "public"."profiles" alter column "role" drop default;
alter table "public"."profiles" alter column "role" set data type user_role_enum using 
    CASE "role"::text
        WHEN 'ADMIN' THEN 'Admin'::user_role_enum
        WHEN 'MANAGER' THEN 'Manager'::user_role_enum
        WHEN 'EMPLOYEE' THEN 'Employee'::user_role_enum
    END;
alter table "public"."profiles" alter column "role" set default 'Employee'::user_role_enum;

alter table "public"."profiles" alter column "updated_at" drop not null;

alter table "public"."schedule_settings" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."schedule_settings" alter column "updated_at" set default timezone('utc'::text, now());

alter table "public"."scheduler_metrics" drop column "context";

alter table "public"."scheduler_metrics" drop column "metrics";

alter table "public"."scheduler_metrics" drop column "organization_id";

alter table "public"."scheduler_metrics" drop column "status";

alter table "public"."scheduler_metrics" drop column "timestamp";

alter table "public"."scheduler_metrics" add column "coverage_deficit" integer not null default 0;

alter table "public"."scheduler_metrics" add column "error_message" text;

alter table "public"."scheduler_metrics" add column "last_run_status" text not null;

alter table "public"."scheduler_metrics" add column "overtime_violations" integer not null default 0;

alter table "public"."scheduler_metrics" add column "pattern_errors" integer not null default 0;

alter table "public"."scheduler_metrics" add column "schedule_generation_time" integer not null default 0;

alter table "public"."scheduler_metrics" disable row level security;

alter table "public"."schedules" drop column "organization_id";

alter table "public"."schedules" add column "period_end" timestamp with time zone not null;

alter table "public"."schedules" add column "period_start" timestamp with time zone not null;

alter table "public"."schedules" add column "shift_end" time without time zone not null;

alter table "public"."schedules" add column "shift_start" time without time zone not null;

alter table "public"."schedules" add column "timezone" text not null default 'UTC'::text;

alter table "public"."schedules" alter column "id" set default gen_random_uuid();

alter table "public"."schedules" alter column "status" drop default;

alter table "public"."time_off_requests" drop column "end_date";

alter table "public"."time_off_requests" drop column "is_paid";

alter table "public"."time_off_requests" drop column "organization_id";

alter table "public"."time_off_requests" drop column "start_date";

alter table "public"."time_off_requests" add column "period_end" timestamp with time zone not null;

alter table "public"."time_off_requests" add column "period_start" timestamp with time zone not null;

alter table "public"."time_off_requests" add column "reviewed_at" timestamp with time zone;

alter table "public"."time_off_requests" add column "reviewed_by" uuid;

alter table "public"."time_off_requests" add column "submitted_at" timestamp with time zone not null default now();

alter table "public"."time_off_requests" alter column "id" set default gen_random_uuid();

alter table "public"."time_off_requests" alter column "status" set default 'Pending'::time_off_status_enum;

alter table "public"."time_off_requests" alter column "status" set data type time_off_status_enum using "status"::time_off_status_enum;

alter table "public"."time_off_requests" alter column "type" drop default;

alter table "public"."time_off_requests" alter column "type" set data type time_off_type_enum using "type"::text::time_off_type_enum;

drop type "public"."alert_category";

drop type "public"."alert_severity";

drop type "public"."log_level";

drop type "public"."profile_status";

drop type "public"."system_status";

drop type "public"."time_off_type";

drop type "public"."user_role";

CREATE UNIQUE INDEX auth_confirmation_attempts_pkey ON public.auth_confirmation_attempts USING btree (id);

CREATE UNIQUE INDEX auth_error_logs_pkey ON public.auth_error_logs USING btree (id);

CREATE UNIQUE INDEX auth_errors_pkey ON public.auth_errors USING btree (id);

CREATE UNIQUE INDEX auth_event_logs_pkey ON public.auth_event_logs USING btree (id);

CREATE UNIQUE INDEX auth_events_pkey ON public.auth_events USING btree (id);

CREATE UNIQUE INDEX cookie_errors_pkey ON public.cookie_errors USING btree (id);

CREATE UNIQUE INDEX cookie_metrics_pkey ON public.cookie_metrics USING btree (id);

CREATE UNIQUE INDEX daily_coverage_date_period_key ON public.daily_coverage USING btree (date, period_id);

CREATE UNIQUE INDEX daily_coverage_pkey ON public.daily_coverage USING btree (id);

CREATE UNIQUE INDEX employee_access_logs_pkey ON public.employee_access_logs USING btree (id);

CREATE UNIQUE INDEX employee_patterns_pkey ON public.employee_patterns USING btree (id);

CREATE UNIQUE INDEX employee_role_history_pkey ON public.employee_role_history USING btree (id);

CREATE UNIQUE INDEX employee_shift_preferences_pkey ON public.employee_shift_preferences USING btree (id);

CREATE UNIQUE INDEX employees_pkey ON public.employees USING btree (id);

CREATE UNIQUE INDEX error_actions_pkey ON public.error_actions USING btree (id);

CREATE UNIQUE INDEX error_analytics_config_component_key ON public.error_analytics_config USING btree (component);

CREATE UNIQUE INDEX error_analytics_config_pkey ON public.error_analytics_config USING btree (id);

CREATE UNIQUE INDEX error_analytics_data_pkey ON public.error_analytics_data USING btree (id);

CREATE UNIQUE INDEX error_analytics_storage_component_storage_key_key ON public.error_analytics_storage USING btree (component, storage_key);

CREATE UNIQUE INDEX error_analytics_storage_pkey ON public.error_analytics_storage USING btree (id);

CREATE UNIQUE INDEX error_analytics_trends_pkey ON public.error_analytics_trends USING btree (id);

CREATE UNIQUE INDEX error_metrics_pkey ON public.error_metrics USING btree (id);

CREATE INDEX idx_access_logs_accessed ON public.employee_access_logs USING btree (accessed_employee_id);

CREATE INDEX idx_access_logs_accessor ON public.employee_access_logs USING btree (accessor_id);

CREATE INDEX idx_access_logs_created_at ON public.employee_access_logs USING btree (created_at);

CREATE INDEX idx_auth_confirmation_attempts_created ON public.auth_confirmation_attempts USING btree (created_at);

CREATE INDEX idx_auth_confirmation_attempts_email ON public.auth_confirmation_attempts USING btree (email);

CREATE INDEX idx_auth_confirmation_attempts_ip ON public.auth_confirmation_attempts USING btree (ip_address);

CREATE INDEX idx_auth_error_logs_created_at ON public.auth_error_logs USING btree (created_at);

CREATE INDEX idx_auth_error_logs_error_type ON public.auth_error_logs USING btree (error_type);

CREATE INDEX idx_auth_error_logs_user_id ON public.auth_error_logs USING btree (user_id);

CREATE INDEX idx_auth_errors_action ON public.auth_errors USING btree (action_type);

CREATE INDEX idx_auth_errors_created ON public.auth_errors USING btree (created_at);

CREATE INDEX idx_auth_errors_user ON public.auth_errors USING btree (user_id);

CREATE INDEX idx_auth_event_logs_created_at ON public.auth_event_logs USING btree (created_at);

CREATE INDEX idx_auth_event_logs_event_type ON public.auth_event_logs USING btree (event_type);

CREATE INDEX idx_auth_event_logs_user_id ON public.auth_event_logs USING btree (user_id);

CREATE INDEX idx_auth_events_created ON public.auth_events USING btree (created_at);

CREATE INDEX idx_auth_events_type ON public.auth_events USING btree (event_type);

CREATE INDEX idx_auth_events_user ON public.auth_events USING btree (user_id);

CREATE INDEX idx_cookie_errors_cookie ON public.cookie_errors USING btree (cookie_name);

CREATE INDEX idx_cookie_errors_type ON public.cookie_errors USING btree (error_type);

CREATE INDEX idx_cookie_errors_user ON public.cookie_errors USING btree (user_id);

CREATE INDEX idx_cookie_metrics_name ON public.cookie_metrics USING btree (cookie_name);

CREATE INDEX idx_cookie_metrics_operation ON public.cookie_metrics USING btree (operation);

CREATE INDEX idx_cookie_metrics_success ON public.cookie_metrics USING btree (success);

CREATE INDEX idx_cookie_metrics_user ON public.cookie_metrics USING btree (user_id);

CREATE INDEX idx_coverage_date ON public.daily_coverage USING btree (date);

CREATE INDEX idx_daily_coverage_date ON public.daily_coverage USING btree (date);

CREATE INDEX idx_daily_coverage_period ON public.daily_coverage USING btree (period_id);

CREATE INDEX idx_daily_coverage_status ON public.daily_coverage USING btree (coverage_status);

CREATE INDEX idx_employee_patterns_date ON public.employee_patterns USING btree (start_date, end_date);

CREATE INDEX idx_employee_patterns_dates ON public.employee_patterns USING btree (start_date, end_date);

CREATE INDEX idx_employee_patterns_employee ON public.employee_patterns USING btree (employee_id);

CREATE INDEX idx_employee_patterns_pattern ON public.employee_patterns USING btree (pattern_id);

CREATE INDEX idx_error_actions_timestamp ON public.error_actions USING btree (action_timestamp);

CREATE INDEX idx_error_actions_user ON public.error_actions USING btree (user_id);

CREATE INDEX idx_error_analytics_component ON public.error_analytics_storage USING btree (component);

CREATE INDEX idx_error_analytics_data_component ON public.error_analytics_data USING btree (component);

CREATE INDEX idx_error_analytics_data_timestamp ON public.error_analytics_data USING btree ("timestamp");

CREATE INDEX idx_error_analytics_last_accessed ON public.error_analytics_storage USING btree (last_accessed);

CREATE INDEX idx_error_analytics_trends_component ON public.error_analytics_trends USING btree (component);

CREATE INDEX idx_error_metrics_component ON public.error_metrics USING btree (component);

CREATE INDEX idx_error_metrics_last_error ON public.error_metrics USING btree (last_error);

CREATE INDEX idx_network_retry_metrics_component ON public.network_retry_metrics USING btree (component);

CREATE INDEX idx_network_retry_metrics_endpoint ON public.network_retry_metrics USING btree (endpoint);

CREATE INDEX idx_password_history_user_created ON public.password_history USING btree (user_id, created_at DESC);

CREATE INDEX idx_pattern_actions_created ON public.pattern_actions USING btree (created_at);

CREATE INDEX idx_pattern_actions_pattern ON public.pattern_actions USING btree (pattern_id);

CREATE INDEX idx_pattern_actions_user ON public.pattern_actions USING btree (user_id);

CREATE INDEX idx_period_format_issues_component ON public.period_format_issues USING btree (component);

CREATE INDEX idx_period_format_issues_created ON public.period_format_issues USING btree (created_at);

CREATE INDEX idx_rate_limit_metrics_key_user ON public.rate_limit_metrics USING btree (key, user_id);

CREATE INDEX idx_rate_limit_metrics_window ON public.rate_limit_metrics USING btree (window_start);

CREATE INDEX idx_role_history_changed_at ON public.employee_role_history USING btree (changed_at);

CREATE INDEX idx_role_history_changed_by ON public.employee_role_history USING btree (changed_by);

CREATE INDEX idx_role_history_employee ON public.employee_role_history USING btree (employee_id);

CREATE INDEX idx_scheduler_metrics_created_at ON public.scheduler_metrics USING btree (created_at DESC);

CREATE INDEX idx_scheduler_metrics_history_measured_at ON public.scheduler_metrics_history USING btree (measured_at);

CREATE INDEX idx_scheduler_metrics_history_type_env ON public.scheduler_metrics_history USING btree (metrics_type, environment);

CREATE INDEX idx_schedules_employee_date ON public.schedules USING btree (employee_id, date);

CREATE INDEX idx_shift_preferences_dates ON public.employee_shift_preferences USING btree (effective_date, expiry_date);

CREATE INDEX idx_shift_preferences_employee ON public.employee_shift_preferences USING btree (employee_id);

CREATE INDEX idx_time_off_access_accessed ON public.time_off_access_logs USING btree (accessed_user_id);

CREATE INDEX idx_time_off_access_time ON public.time_off_access_logs USING btree (accessed_at);

CREATE INDEX idx_time_off_access_user ON public.time_off_access_logs USING btree (user_id);

CREATE INDEX idx_time_off_requests_employee ON public.time_off_requests USING btree (employee_id);

CREATE INDEX idx_validation_history_schedule ON public.validation_history USING btree (schedule_id);

CREATE UNIQUE INDEX network_retry_metrics_pkey ON public.network_retry_metrics USING btree (id);

CREATE UNIQUE INDEX password_history_pkey ON public.password_history USING btree (id);

CREATE UNIQUE INDEX password_history_user_id_password_hash_key ON public.password_history USING btree (user_id, password_hash);

CREATE UNIQUE INDEX password_policies_name_key ON public.password_policies USING btree (name);

CREATE UNIQUE INDEX password_policies_pkey ON public.password_policies USING btree (id);

CREATE UNIQUE INDEX pattern_actions_pkey ON public.pattern_actions USING btree (id);

CREATE UNIQUE INDEX period_format_issues_pkey ON public.period_format_issues USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX rate_limit_config_key_key ON public.rate_limit_config USING btree (key);

CREATE UNIQUE INDEX rate_limit_config_pkey ON public.rate_limit_config USING btree (id);

CREATE UNIQUE INDEX rate_limit_metrics_key_user_id_window_start_key ON public.rate_limit_metrics USING btree (key, user_id, window_start);

CREATE UNIQUE INDEX rate_limit_metrics_pkey ON public.rate_limit_metrics USING btree (id);

CREATE UNIQUE INDEX scheduler_config_config_key_environment_key ON public.scheduler_config USING btree (config_key, environment);

CREATE UNIQUE INDEX scheduler_config_pkey ON public.scheduler_config USING btree (id);

CREATE UNIQUE INDEX scheduler_metrics_history_pkey ON public.scheduler_metrics_history USING btree (id);

CREATE UNIQUE INDEX shift_patterns_name_key ON public.shift_patterns USING btree (name);

CREATE UNIQUE INDEX shift_patterns_pkey ON public.shift_patterns USING btree (id);

CREATE UNIQUE INDEX shift_types_name_key ON public.shift_types USING btree (name);

CREATE UNIQUE INDEX shift_types_pkey ON public.shift_types USING btree (id);

CREATE UNIQUE INDEX shifts_pkey ON public.shifts USING btree (id);

CREATE UNIQUE INDEX staffing_requirements_name_key ON public.staffing_requirements USING btree (period_name);

CREATE UNIQUE INDEX staffing_requirements_pkey ON public.staffing_requirements USING btree (id);

CREATE UNIQUE INDEX storage_quotas_component_key ON public.storage_quotas USING btree (component);

CREATE UNIQUE INDEX storage_quotas_pkey ON public.storage_quotas USING btree (id);

CREATE UNIQUE INDEX time_off_access_logs_pkey ON public.time_off_access_logs USING btree (id);

CREATE INDEX time_off_requests_employee_id_idx ON public.time_off_requests USING btree (employee_id);

CREATE INDEX time_off_requests_status_idx ON public.time_off_requests USING btree (status);

CREATE UNIQUE INDEX timezone_configs_name_key ON public.timezone_configs USING btree (name);

CREATE UNIQUE INDEX timezone_configs_pkey ON public.timezone_configs USING btree (id);

CREATE UNIQUE INDEX validation_history_pkey ON public.validation_history USING btree (id);

CREATE UNIQUE INDEX validation_rules_pkey ON public.validation_rules USING btree (id);

CREATE UNIQUE INDEX validation_rules_rule_type_rule_name_key ON public.validation_rules USING btree (rule_type, rule_name);

alter table "public"."auth_confirmation_attempts" add constraint "auth_confirmation_attempts_pkey" PRIMARY KEY using index "auth_confirmation_attempts_pkey";

alter table "public"."auth_error_logs" add constraint "auth_error_logs_pkey" PRIMARY KEY using index "auth_error_logs_pkey";

alter table "public"."auth_errors" add constraint "auth_errors_pkey" PRIMARY KEY using index "auth_errors_pkey";

alter table "public"."auth_event_logs" add constraint "auth_event_logs_pkey" PRIMARY KEY using index "auth_event_logs_pkey";

alter table "public"."auth_events" add constraint "auth_events_pkey" PRIMARY KEY using index "auth_events_pkey";

alter table "public"."cookie_errors" add constraint "cookie_errors_pkey" PRIMARY KEY using index "cookie_errors_pkey";

alter table "public"."cookie_metrics" add constraint "cookie_metrics_pkey" PRIMARY KEY using index "cookie_metrics_pkey";

alter table "public"."daily_coverage" add constraint "daily_coverage_pkey" PRIMARY KEY using index "daily_coverage_pkey";

alter table "public"."employee_access_logs" add constraint "employee_access_logs_pkey" PRIMARY KEY using index "employee_access_logs_pkey";

alter table "public"."employee_patterns" add constraint "employee_patterns_pkey" PRIMARY KEY using index "employee_patterns_pkey";

alter table "public"."employee_role_history" add constraint "employee_role_history_pkey" PRIMARY KEY using index "employee_role_history_pkey";

alter table "public"."employee_shift_preferences" add constraint "employee_shift_preferences_pkey" PRIMARY KEY using index "employee_shift_preferences_pkey";

alter table "public"."employees" add constraint "employees_pkey" PRIMARY KEY using index "employees_pkey";

alter table "public"."error_actions" add constraint "error_actions_pkey" PRIMARY KEY using index "error_actions_pkey";

alter table "public"."error_analytics_config" add constraint "error_analytics_config_pkey" PRIMARY KEY using index "error_analytics_config_pkey";

alter table "public"."error_analytics_data" add constraint "error_analytics_data_pkey" PRIMARY KEY using index "error_analytics_data_pkey";

alter table "public"."error_analytics_storage" add constraint "error_analytics_storage_pkey" PRIMARY KEY using index "error_analytics_storage_pkey";

alter table "public"."error_analytics_trends" add constraint "error_analytics_trends_pkey" PRIMARY KEY using index "error_analytics_trends_pkey";

alter table "public"."error_metrics" add constraint "error_metrics_pkey" PRIMARY KEY using index "error_metrics_pkey";

alter table "public"."network_retry_metrics" add constraint "network_retry_metrics_pkey" PRIMARY KEY using index "network_retry_metrics_pkey";

alter table "public"."password_history" add constraint "password_history_pkey" PRIMARY KEY using index "password_history_pkey";

alter table "public"."password_policies" add constraint "password_policies_pkey" PRIMARY KEY using index "password_policies_pkey";

alter table "public"."pattern_actions" add constraint "pattern_actions_pkey" PRIMARY KEY using index "pattern_actions_pkey";

alter table "public"."period_format_issues" add constraint "period_format_issues_pkey" PRIMARY KEY using index "period_format_issues_pkey";

alter table "public"."rate_limit_config" add constraint "rate_limit_config_pkey" PRIMARY KEY using index "rate_limit_config_pkey";

alter table "public"."rate_limit_metrics" add constraint "rate_limit_metrics_pkey" PRIMARY KEY using index "rate_limit_metrics_pkey";

alter table "public"."scheduler_config" add constraint "scheduler_config_pkey" PRIMARY KEY using index "scheduler_config_pkey";

alter table "public"."scheduler_metrics_history" add constraint "scheduler_metrics_history_pkey" PRIMARY KEY using index "scheduler_metrics_history_pkey";

alter table "public"."shift_patterns" add constraint "shift_patterns_pkey" PRIMARY KEY using index "shift_patterns_pkey";

alter table "public"."shift_types" add constraint "shift_types_pkey" PRIMARY KEY using index "shift_types_pkey";

alter table "public"."shifts" add constraint "shifts_pkey" PRIMARY KEY using index "shifts_pkey";

alter table "public"."staffing_requirements" add constraint "staffing_requirements_pkey" PRIMARY KEY using index "staffing_requirements_pkey";

alter table "public"."storage_quotas" add constraint "storage_quotas_pkey" PRIMARY KEY using index "storage_quotas_pkey";

alter table "public"."time_off_access_logs" add constraint "time_off_access_logs_pkey" PRIMARY KEY using index "time_off_access_logs_pkey";

alter table "public"."timezone_configs" add constraint "timezone_configs_pkey" PRIMARY KEY using index "timezone_configs_pkey";

alter table "public"."validation_history" add constraint "validation_history_pkey" PRIMARY KEY using index "validation_history_pkey";

alter table "public"."validation_rules" add constraint "validation_rules_pkey" PRIMARY KEY using index "validation_rules_pkey";

alter table "public"."auth_errors" add constraint "auth_errors_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."auth_errors" validate constraint "auth_errors_user_id_fkey";

alter table "public"."auth_event_logs" add constraint "auth_event_logs_error_id_fkey" FOREIGN KEY (error_id) REFERENCES auth_error_logs(id) not valid;

alter table "public"."auth_event_logs" validate constraint "auth_event_logs_error_id_fkey";

alter table "public"."auth_events" add constraint "auth_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."auth_events" validate constraint "auth_events_user_id_fkey";

alter table "public"."cookie_errors" add constraint "cookie_errors_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."cookie_errors" validate constraint "cookie_errors_user_id_fkey";

alter table "public"."cookie_metrics" add constraint "cookie_metrics_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."cookie_metrics" validate constraint "cookie_metrics_user_id_fkey";

alter table "public"."daily_coverage" add constraint "daily_coverage_actual_check" CHECK ((actual_coverage >= 0)) not valid;

alter table "public"."daily_coverage" validate constraint "daily_coverage_actual_check";

alter table "public"."daily_coverage" add constraint "daily_coverage_date_period_key" UNIQUE using index "daily_coverage_date_period_key";

alter table "public"."daily_coverage" add constraint "daily_coverage_period_id_fkey" FOREIGN KEY (period_id) REFERENCES staffing_requirements(id) ON DELETE CASCADE not valid;

alter table "public"."daily_coverage" validate constraint "daily_coverage_period_id_fkey";

alter table "public"."employee_access_logs" add constraint "employee_access_logs_accessed_employee_id_fkey" FOREIGN KEY (accessed_employee_id) REFERENCES employees(id) not valid;

alter table "public"."employee_access_logs" validate constraint "employee_access_logs_accessed_employee_id_fkey";

alter table "public"."employee_access_logs" add constraint "employee_access_logs_accessor_id_fkey" FOREIGN KEY (accessor_id) REFERENCES auth.users(id) not valid;

alter table "public"."employee_access_logs" validate constraint "employee_access_logs_accessor_id_fkey";

alter table "public"."employee_patterns" add constraint "employee_patterns_dates_check" CHECK (((end_date IS NULL) OR (end_date > start_date))) not valid;

alter table "public"."employee_patterns" validate constraint "employee_patterns_dates_check";

alter table "public"."employee_patterns" add constraint "employee_patterns_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE not valid;

alter table "public"."employee_patterns" validate constraint "employee_patterns_employee_id_fkey";

alter table "public"."employee_patterns" add constraint "employee_patterns_pattern_id_fkey" FOREIGN KEY (pattern_id) REFERENCES shift_patterns(id) ON DELETE RESTRICT not valid;

alter table "public"."employee_patterns" validate constraint "employee_patterns_pattern_id_fkey";

alter table "public"."employee_patterns" add constraint "employee_patterns_rotation_date_check" CHECK ((rotation_start_date >= start_date)) not valid;

alter table "public"."employee_patterns" validate constraint "employee_patterns_rotation_date_check";

alter table "public"."employee_role_history" add constraint "employee_role_history_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES auth.users(id) not valid;

alter table "public"."employee_role_history" validate constraint "employee_role_history_changed_by_fkey";

alter table "public"."employee_role_history" add constraint "employee_role_history_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES employees(id) not valid;

alter table "public"."employee_role_history" validate constraint "employee_role_history_employee_id_fkey";

alter table "public"."employee_shift_preferences" add constraint "date_range_valid" CHECK (((expiry_date IS NULL) OR (expiry_date > effective_date))) not valid;

alter table "public"."employee_shift_preferences" validate constraint "date_range_valid";

alter table "public"."employee_shift_preferences" add constraint "employee_shift_preferences_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE not valid;

alter table "public"."employee_shift_preferences" validate constraint "employee_shift_preferences_employee_id_fkey";

alter table "public"."employee_shift_preferences" add constraint "employee_shift_preferences_shift_type_id_fkey" FOREIGN KEY (shift_type_id) REFERENCES shift_types(id) ON DELETE CASCADE not valid;

alter table "public"."employee_shift_preferences" validate constraint "employee_shift_preferences_shift_type_id_fkey";

alter table "public"."employee_shift_preferences" add constraint "preference_level_range" CHECK (((preference_level >= '-3'::integer) AND (preference_level <= 3))) not valid;

alter table "public"."employee_shift_preferences" validate constraint "preference_level_range";

alter table "public"."employees" add constraint "employees_default_shift_type_id_fkey" FOREIGN KEY (default_shift_type_id) REFERENCES shift_types(id) not valid;

alter table "public"."employees" validate constraint "employees_default_shift_type_id_fkey";

alter table "public"."employees" add constraint "employees_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."employees" validate constraint "employees_id_fkey";

alter table "public"."employees" add constraint "fk_profile" FOREIGN KEY (id) REFERENCES profiles(id) not valid;

alter table "public"."employees" validate constraint "fk_profile";

alter table "public"."error_actions" add constraint "error_actions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."error_actions" validate constraint "error_actions_user_id_fkey";

alter table "public"."error_analytics_config" add constraint "error_analytics_config_component_key" UNIQUE using index "error_analytics_config_component_key";

alter table "public"."error_analytics_storage" add constraint "error_analytics_storage_component_storage_key_key" UNIQUE using index "error_analytics_storage_component_storage_key_key";

alter table "public"."password_history" add constraint "password_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."password_history" validate constraint "password_history_user_id_fkey";

alter table "public"."password_history" add constraint "password_history_user_id_password_hash_key" UNIQUE using index "password_history_user_id_password_hash_key";

alter table "public"."password_policies" add constraint "password_policies_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."password_policies" validate constraint "password_policies_created_by_fkey";

alter table "public"."password_policies" add constraint "password_policies_name_key" UNIQUE using index "password_policies_name_key";

alter table "public"."password_policies" add constraint "password_policies_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."password_policies" validate constraint "password_policies_updated_by_fkey";

alter table "public"."pattern_actions" add constraint "pattern_actions_pattern_id_fkey" FOREIGN KEY (pattern_id) REFERENCES shift_patterns(id) not valid;

alter table "public"."pattern_actions" validate constraint "pattern_actions_pattern_id_fkey";

alter table "public"."pattern_actions" add constraint "pattern_actions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."pattern_actions" validate constraint "pattern_actions_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."rate_limit_config" add constraint "rate_limit_config_key_key" UNIQUE using index "rate_limit_config_key_key";

alter table "public"."rate_limit_metrics" add constraint "rate_limit_metrics_key_user_id_window_start_key" UNIQUE using index "rate_limit_metrics_key_user_id_window_start_key";

alter table "public"."scheduler_config" add constraint "scheduler_config_config_key_environment_key" UNIQUE using index "scheduler_config_config_key_environment_key";

alter table "public"."scheduler_config" add constraint "scheduler_config_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."scheduler_config" validate constraint "scheduler_config_created_by_fkey";

alter table "public"."scheduler_config" add constraint "scheduler_config_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."scheduler_config" validate constraint "scheduler_config_updated_by_fkey";

-- Timezone validation moved to 20250128135512_timezone_validation.sql
-- alter table "public"."scheduler_config" add constraint "scheduler_config_valid_timezone" CHECK (is_valid_timezone(timezone)) not valid;
-- alter table "public"."scheduler_config" validate constraint "scheduler_config_valid_timezone";

alter table "public"."scheduler_metrics" add constraint "scheduler_metrics_last_run_status_check" CHECK ((last_run_status = ANY (ARRAY['success'::text, 'error'::text]))) not valid;

alter table "public"."scheduler_metrics" validate constraint "scheduler_metrics_last_run_status_check";

alter table "public"."schedules" add constraint "schedules_last_operation_id_fkey" FOREIGN KEY (last_operation_id) REFERENCES schedule_operations(id) not valid;

alter table "public"."schedules" validate constraint "schedules_last_operation_id_fkey";

alter table "public"."schedules" add constraint "schedules_shift_id_fkey" FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE not valid;

alter table "public"."schedules" validate constraint "schedules_shift_id_fkey";

-- Business hours validation moved to 20250128135513_validation_functions.sql
alter table "public"."schedules" add constraint "valid_business_hours" CHECK (validate_business_hours(shift_start, shift_end)) not valid;

alter table "public"."schedules" validate constraint "valid_business_hours";

alter table "public"."schedules" add constraint "valid_schedule_dates" CHECK (validate_date_range(period_start, period_end, false)) not valid;

alter table "public"."schedules" validate constraint "valid_schedule_dates";

-- Remove timezone validation from schedules table
-- alter table "public"."schedules" add constraint "valid_timezone" CHECK (is_valid_timezone(timezone)) not valid;
-- alter table "public"."schedules" validate constraint "valid_timezone";

alter table "public"."shift_patterns" add constraint "shift_patterns_days_check" CHECK (((days_on > 0) AND (days_off > 0))) not valid;

alter table "public"."shift_patterns" validate constraint "shift_patterns_days_check";

alter table "public"."shift_patterns" add constraint "shift_patterns_duration_check" CHECK ((shift_duration = ANY (ARRAY[4, 10, 12]))) not valid;

alter table "public"."shift_patterns" validate constraint "shift_patterns_duration_check";

alter table "public"."shift_patterns" add constraint "shift_patterns_name_key" UNIQUE using index "shift_patterns_name_key";

alter table "public"."shift_types" add constraint "shift_types_name_key" UNIQUE using index "shift_types_name_key";

alter table "public"."shifts" add constraint "shifts_duration_check" CHECK (((duration_hours > 0) AND (duration_hours <= 24))) not valid;

alter table "public"."shifts" validate constraint "shifts_duration_check";

alter table "public"."shifts" add constraint "shifts_shift_type_id_fkey" FOREIGN KEY (shift_type_id) REFERENCES shift_types(id) not valid;

alter table "public"."shifts" validate constraint "shifts_shift_type_id_fkey";

alter table "public"."staffing_requirements" add constraint "staffing_requirements_minimum_check" CHECK ((minimum_employees > 0)) not valid;

alter table "public"."staffing_requirements" validate constraint "staffing_requirements_minimum_check";

alter table "public"."staffing_requirements" add constraint "staffing_requirements_name_key" UNIQUE using index "staffing_requirements_name_key";

alter table "public"."storage_quotas" add constraint "storage_quotas_component_key" UNIQUE using index "storage_quotas_component_key";

alter table "public"."time_off_access_logs" add constraint "time_off_access_logs_accessed_user_id_fkey" FOREIGN KEY (accessed_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."time_off_access_logs" validate constraint "time_off_access_logs_accessed_user_id_fkey";

alter table "public"."time_off_access_logs" add constraint "time_off_access_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."time_off_access_logs" validate constraint "time_off_access_logs_user_id_fkey";

alter table "public"."time_off_requests" add constraint "time_off_requests_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) not valid;

alter table "public"."time_off_requests" validate constraint "time_off_requests_reviewed_by_fkey";

alter table "public"."time_off_requests" add constraint "valid_time_off_dates" CHECK (validate_date_range(period_start, period_end, false)) not valid;

alter table "public"."time_off_requests" validate constraint "valid_time_off_dates";

alter table "public"."timezone_configs" add constraint "timezone_configs_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."timezone_configs" validate constraint "timezone_configs_created_by_fkey";

alter table "public"."timezone_configs" add constraint "timezone_configs_name_key" UNIQUE using index "timezone_configs_name_key";

alter table "public"."timezone_configs" add constraint "timezone_configs_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."timezone_configs" validate constraint "timezone_configs_updated_by_fkey";

alter table "public"."validation_history" add constraint "validation_history_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."validation_history" validate constraint "validation_history_created_by_fkey";

alter table "public"."validation_history" add constraint "validation_history_schedule_id_fkey" FOREIGN KEY (schedule_id) REFERENCES schedules(id) not valid;

alter table "public"."validation_history" validate constraint "validation_history_schedule_id_fkey";

alter table "public"."validation_rules" add constraint "validation_rules_rule_type_rule_name_key" UNIQUE using index "validation_rules_rule_type_rule_name_key";

alter table "public"."schedules" add constraint "schedules_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE not valid;

alter table "public"."schedules" validate constraint "schedules_employee_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.analyze_auth_patterns(p_time_window interval DEFAULT '24:00:00'::interval)
 RETURNS TABLE(event_type text, total_events bigint, unique_users bigint, avg_events_per_user numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.analyze_error_patterns(p_time_window interval DEFAULT '24:00:00'::interval)
 RETURNS TABLE(component text, total_errors integer, total_recoveries integer, recovery_rate numeric, avg_recovery_attempts numeric, last_error timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.analyze_network_retry_patterns(p_time_window interval DEFAULT '24:00:00'::interval)
 RETURNS TABLE(component text, endpoint text, total_retries integer, success_rate numeric, avg_retry_delay numeric, max_retry_delay numeric, last_retry timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.begin_transaction()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  start transaction;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_period_coverage(p_date date, p_period_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_weekly_hours(p_employee_id uuid, p_date date)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.can_access_user_data(p_accessor_id uuid, p_target_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.can_manage_time_off_requests(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_role text;
begin
  select user_role into v_role
  from public.employees
  where id = p_user_id;
  
  return v_role in ('Admin', 'Manager');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.check_confirmation_rate_limit(p_email text, p_ip_address text, p_window_minutes integer DEFAULT 60, p_max_attempts integer DEFAULT 5)
 RETURNS TABLE(allowed boolean, remaining_attempts integer, next_allowed_attempt timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_employee_dependencies(employee_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_password_history(p_user_id uuid, p_new_password text, p_policy_name text DEFAULT 'default'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key text, p_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(allowed boolean, remaining integer, reset_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_schedule_conflicts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_storage_quota_status(p_component text)
 RETURNS TABLE(current_size_bytes integer, max_size_bytes integer, usage_percentage double precision, needs_cleanup boolean, last_cleanup timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_error_analytics_data(p_component text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_error_analytics_storage(p_component text, p_older_than_days integer DEFAULT 30)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.column_exists(p_table text, p_column text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = p_table
        AND column_name = p_column
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.commit_transaction()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  commit;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.convert_time_between_zones(p_time time without time zone, p_source_timezone text, p_target_timezone text)
 RETURNS time without time zone
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.convert_timezone(p_timestamp timestamp with time zone, p_target_zone text, p_config_name text DEFAULT 'default'::text)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.delete_employee(employee_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.down_20240328000001()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.down_20240328000002()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  drop function if exists public.validate_shift_assignment(uuid, uuid, date);
  drop function if exists public.get_available_shifts(uuid, date);
  drop function down_20240328000002();
end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_schedule(p_start_date date, p_end_date date, p_department_id uuid, p_environment text DEFAULT current_setting('app.environment'::text, true))
 RETURNS TABLE(schedule_id uuid, metrics jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_auth_error_history(p_user_id uuid DEFAULT NULL::uuid, p_action text DEFAULT NULL::text, p_start_time timestamp with time zone DEFAULT (now() - '24:00:00'::interval), p_end_time timestamp with time zone DEFAULT now())
 RETURNS TABLE(error_id uuid, user_id uuid, action_type text, error_code text, error_message text, error_details jsonb, created_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_available_shifts(p_employee_id uuid, p_date date)
 RETURNS TABLE(shift_id uuid, shift_type_id uuid, start_time time without time zone, end_time time without time zone, duration_hours integer, validation jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_component_error_metrics(p_component text, p_time_window interval DEFAULT '24:00:00'::interval)
 RETURNS TABLE(error_count integer, recovery_attempts integer, successful_recoveries integer, recovery_rate numeric, last_error timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_cookie_success_rate(p_cookie_name text, p_operation text DEFAULT NULL::text, p_time_window interval DEFAULT '24:00:00'::interval)
 RETURNS TABLE(total_operations bigint, successful_operations bigint, success_rate numeric, avg_duration_ms numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_employees(p_search_term text DEFAULT NULL::text, p_role employee_role DEFAULT NULL::employee_role, p_team_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(user_id uuid, email text, full_name text, role employee_role, team_id uuid, team_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_error_action_history(p_path text DEFAULT NULL::text, p_start_time timestamp with time zone DEFAULT (now() - '24:00:00'::interval), p_end_time timestamp with time zone DEFAULT now())
 RETURNS TABLE(action text, path text, user_id uuid, action_timestamp timestamp with time zone, metadata jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_error_analytics_data(p_component text, p_storage_key text)
 RETURNS TABLE(data jsonb, size_bytes integer, last_accessed timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.error_analytics_storage
    SET last_accessed = NOW()
    WHERE component = p_component
    AND storage_key = p_storage_key
    RETURNING data, size_bytes, last_accessed;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_pattern_action_history(p_pattern_id uuid DEFAULT NULL::uuid, p_user_id uuid DEFAULT NULL::uuid, p_action_type pattern_action_type DEFAULT NULL::pattern_action_type, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(action_id uuid, action_type pattern_action_type, pattern_id uuid, user_id uuid, pattern_name text, pattern_type text, error_message text, error_code text, metadata jsonb, created_at timestamp with time zone, client_info jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_pattern_violations(start_date date)
 RETURNS TABLE(employee_id uuid, violation_type text, violation_date date, details text)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_rate_limit_metrics(p_key text, p_user_id uuid DEFAULT NULL::uuid, p_window_start timestamp with time zone DEFAULT (now() - '24:00:00'::interval))
 RETURNS TABLE(window_start timestamp with time zone, request_count integer, last_request timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_scheduler_config(p_config_key text, p_environment text DEFAULT current_setting('app.environment'::text, true))
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_scheduler_metrics_history(p_metrics_type text, p_environment text DEFAULT current_setting('app.environment'::text, true), p_start_date timestamp with time zone DEFAULT (now() - '24:00:00'::interval), p_end_date timestamp with time zone DEFAULT now())
 RETURNS TABLE(metrics_type text, metrics_value jsonb, measured_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_time_off_access_level(p_user_id uuid)
 RETURNS time_off_access_level
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_time_off_requests(p_user_id uuid DEFAULT NULL::uuid, p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date)
 RETURNS TABLE(id uuid, employee_id uuid, employee_name text, employee_email text, start_date date, end_date date, request_type text, status text, notes text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_auth_history(p_user_id uuid, p_time_window interval DEFAULT '30 days'::interval)
 RETURNS TABLE(event_type text, event_count bigint, last_occurrence timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_week_number(p_date date, p_timezone text DEFAULT 'UTC'::text)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_deleted_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Delete auth user if exists
  -- This requires proper permissions set up
  delete from auth.users where id = old.id;
  return old;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_valid_cookie_name(p_cookie_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    -- Check if cookie name follows RFC 6265
    RETURN p_cookie_name ~ '^[a-zA-Z0-9!#$%&''*+\-.^_`|~]+$'
        AND length(p_cookie_name) <= 4096;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_valid_cookie_value(p_cookie_value text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    -- Check if cookie value follows RFC 6265
    RETURN p_cookie_value ~ '^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]*$'
        AND length(p_cookie_value) <= 4096;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_valid_timezone(p_timezone text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM pg_timezone_names
        WHERE name = p_timezone
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_auth_error(p_error_type auth_error_type, p_error_code text, p_error_message text, p_error_details jsonb DEFAULT NULL::jsonb, p_user_id uuid DEFAULT NULL::uuid, p_session_id uuid DEFAULT NULL::uuid, p_severity auth_error_severity DEFAULT 'MEDIUM'::auth_error_severity)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_auth_error(p_user_id uuid, p_action text, p_error_code text, p_error_message text, p_error_details jsonb DEFAULT '{}'::jsonb, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_auth_event(p_event_type text, p_user_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT NULL::jsonb, p_client_info jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_auth_event(p_event_type text, p_user_id uuid DEFAULT NULL::uuid, p_metadata jsonb DEFAULT NULL::jsonb, p_success boolean DEFAULT true, p_error_id uuid DEFAULT NULL::uuid, p_session_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_confirmation_attempt(p_email text, p_type text, p_token_hash text, p_ip_address text, p_user_agent text, p_success boolean, p_error_message text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_cookie_error(p_error_type text, p_error_code text, p_error_message text, p_error_details jsonb, p_cookie_name text, p_cookie_operation text, p_user_id uuid DEFAULT NULL::uuid, p_session_id uuid DEFAULT NULL::uuid, p_request_path text DEFAULT NULL::text, p_request_method text DEFAULT NULL::text, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_cookie_metric(p_cookie_name text, p_operation text, p_success boolean, p_duration_ms integer DEFAULT NULL::integer, p_user_id uuid DEFAULT NULL::uuid, p_session_id uuid DEFAULT NULL::uuid, p_request_path text DEFAULT NULL::text, p_request_method text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_employee_access(p_accessed_employee_id uuid, p_action_type text, p_success boolean DEFAULT true, p_error_message text DEFAULT NULL::text, p_client_info jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_error_action(p_action text, p_path text, p_timestamp timestamp with time zone DEFAULT now(), p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_error_metrics(p_component text, p_metrics jsonb, p_error_details jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_network_retry_metrics(p_component text, p_endpoint text, p_metrics jsonb, p_retry_details jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_pattern_action(p_action_type pattern_action_type, p_pattern_id uuid, p_pattern_name text, p_pattern_type text, p_error_message text DEFAULT NULL::text, p_error_code text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb, p_client_info jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_time_off_access(p_user_id uuid, p_accessed_user_id uuid, p_access_type time_off_access_level, p_client_info jsonb DEFAULT NULL::jsonb, p_request_path text DEFAULT NULL::text, p_request_method text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.normalize_period_format(p_period_id text, p_source_format period_format DEFAULT 'HH:MM-HH:MM'::period_format, p_target_format period_format DEFAULT 'HH:MM-HH:MM'::period_format)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
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
$function$
;

-- Password policy type already defined in remote_types.sql
-- create type "public"."password_policy" as ("min_length" integer, "require_uppercase" boolean, "require_lowercase" boolean, "require_numbers" boolean, "require_special_chars" boolean, "max_repeated_chars" integer, "prohibited_patterns" text[], "max_age_days" integer, "history_size" integer);

CREATE OR REPLACE FUNCTION public.period_crosses_midnight(p_start_time text, p_end_time text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN (
        to_timestamp(p_end_time, 'HH24:MI')::time < 
        to_timestamp(p_start_time, 'HH24:MI')::time
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_overlapping_patterns()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_schedule_overlap()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.process_error_analytics_batch(p_batch_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.record_scheduler_metrics(p_metrics_type text, p_metrics_value jsonb, p_environment text DEFAULT current_setting('app.environment'::text, true), p_measured_at timestamp with time zone DEFAULT now())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.resolve_auth_error(p_error_id uuid, p_resolution_details text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.auth_errors
    SET resolved_at = NOW(),
        resolution_details = p_resolution_details
    WHERE id = p_error_id
    AND resolved_at IS NULL;
    
    RETURN FOUND;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rollback_transaction()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  rollback;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.save_error_analytics_data(p_component text, p_storage_key text, p_data jsonb, p_size_bytes integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.shifts_overlap(p_start1 time without time zone, p_end1 time without time zone, p_start2 time without time zone, p_end2 time without time zone)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN (p_start1 < p_end2 AND p_end1 > p_start2);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.standardize_timestamps()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.standardize_timezone(p_timestamp timestamp with time zone, p_source_zone text DEFAULT NULL::text)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    -- If source zone is provided, convert to UTC first
    IF p_source_zone IS NOT NULL THEN
        RETURN p_timestamp AT TIME ZONE p_source_zone AT TIME ZONE 'UTC';
    END IF;

    -- Otherwise, ensure UTC
    RETURN p_timestamp AT TIME ZONE 'UTC';
END;
$function$
;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'timezone_policy') THEN
        create type "public"."timezone_policy" as ("allowed_zones" text[], "default_zone" text, "dst_handling" text);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_coverage_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_employee_and_profile(p_employee_id uuid, p_full_name text, p_username text, p_employee_role employee_role_enum, p_weekly_hours_scheduled integer, p_default_shift_type_id uuid DEFAULT NULL::uuid, p_allow_overtime boolean DEFAULT false, p_max_weekly_hours integer DEFAULT 40)
 RETURNS employees
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_employee_role(p_employee_id uuid, p_new_role employee_role, p_reason text DEFAULT NULL::text, p_client_info jsonb DEFAULT NULL::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_error_analytics_storage_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_error_analytics_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_error_metrics_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_network_retry_metrics_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_rate_limit_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_scheduler_config(p_config_key text, p_config_value jsonb, p_environment text DEFAULT current_setting('app.environment'::text, true), p_description text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_business_hours(p_start_time time without time zone, p_end_time time without time zone, p_timezone text DEFAULT 'UTC'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    -- Convert times to UTC for comparison
    RETURN p_start_time < p_end_time;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_date_range(p_start timestamp with time zone, p_end timestamp with time zone, p_allow_null_end boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    -- Handle null end date
    IF p_end IS NULL THEN
        RETURN p_allow_null_end;
    END IF;

    -- Validate range
    RETURN p_start <= p_end;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_overtime()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_password(p_password text, p_policy_name text DEFAULT 'default'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_period_format(p_period_id text, p_format period_format DEFAULT 'HH:MM-HH:MM'::period_format)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_role_change(p_employee_id uuid, p_new_role employee_role, p_changed_by uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_schedule()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NOT validate_schedule_against_pattern(NEW.employee_id, NEW.date) THEN
        RAISE EXCEPTION 'Schedule violates employee pattern constraints';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_schedule_against_pattern(p_employee_id uuid, p_date date)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_schedule_overlap(p_employee_id uuid, p_period_start timestamp with time zone, p_period_end timestamp with time zone, p_exclude_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1
        FROM public.schedules
        WHERE employee_id = p_employee_id
        AND id != COALESCE(p_exclude_id, id)
        AND tstzrange(period_start, period_end) && tstzrange(p_period_start, p_period_end)
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_shift_assignment(p_employee_id uuid, p_shift_id uuid, p_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_shift_pattern()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_shift_pattern(p_shifts jsonb, p_pattern jsonb, p_timezone text DEFAULT 'UTC'::text)
 RETURNS TABLE(is_valid boolean, error_code text, error_message text, error_details jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_shift_times()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_shift_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_staffing_requirements(p_schedule_id uuid, p_date date, p_timezone text DEFAULT 'UTC'::text)
 RETURNS TABLE(is_valid boolean, error_code text, error_message text, error_details jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_time_off_request(p_user_id uuid, p_start_date date, p_end_date date, p_request_type text, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_shift_overlap(p_shift_id uuid, p_employee_id uuid, p_start_time timestamp with time zone, p_end_time timestamp with time zone)
 RETURNS TABLE(is_valid boolean, overlap_count integer, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

grant delete on table "public"."auth_confirmation_attempts" to "anon";

grant insert on table "public"."auth_confirmation_attempts" to "anon";

grant references on table "public"."auth_confirmation_attempts" to "anon";

grant select on table "public"."auth_confirmation_attempts" to "anon";

grant trigger on table "public"."auth_confirmation_attempts" to "anon";

grant truncate on table "public"."auth_confirmation_attempts" to "anon";

grant update on table "public"."auth_confirmation_attempts" to "anon";

grant delete on table "public"."auth_confirmation_attempts" to "authenticated";

grant insert on table "public"."auth_confirmation_attempts" to "authenticated";

grant references on table "public"."auth_confirmation_attempts" to "authenticated";

grant select on table "public"."auth_confirmation_attempts" to "authenticated";

grant trigger on table "public"."auth_confirmation_attempts" to "authenticated";

grant truncate on table "public"."auth_confirmation_attempts" to "authenticated";

grant update on table "public"."auth_confirmation_attempts" to "authenticated";

grant delete on table "public"."auth_confirmation_attempts" to "service_role";

grant insert on table "public"."auth_confirmation_attempts" to "service_role";

grant references on table "public"."auth_confirmation_attempts" to "service_role";

grant select on table "public"."auth_confirmation_attempts" to "service_role";

grant trigger on table "public"."auth_confirmation_attempts" to "service_role";

grant truncate on table "public"."auth_confirmation_attempts" to "service_role";

grant update on table "public"."auth_confirmation_attempts" to "service_role";

grant delete on table "public"."auth_error_logs" to "anon";

grant insert on table "public"."auth_error_logs" to "anon";

grant references on table "public"."auth_error_logs" to "anon";

grant select on table "public"."auth_error_logs" to "anon";

grant trigger on table "public"."auth_error_logs" to "anon";

grant truncate on table "public"."auth_error_logs" to "anon";

grant update on table "public"."auth_error_logs" to "anon";

grant delete on table "public"."auth_error_logs" to "authenticated";

grant insert on table "public"."auth_error_logs" to "authenticated";

grant references on table "public"."auth_error_logs" to "authenticated";

grant select on table "public"."auth_error_logs" to "authenticated";

grant trigger on table "public"."auth_error_logs" to "authenticated";

grant truncate on table "public"."auth_error_logs" to "authenticated";

grant update on table "public"."auth_error_logs" to "authenticated";

grant delete on table "public"."auth_error_logs" to "service_role";

grant insert on table "public"."auth_error_logs" to "service_role";

grant references on table "public"."auth_error_logs" to "service_role";

grant select on table "public"."auth_error_logs" to "service_role";

grant trigger on table "public"."auth_error_logs" to "service_role";

grant truncate on table "public"."auth_error_logs" to "service_role";

grant update on table "public"."auth_error_logs" to "service_role";

grant delete on table "public"."auth_errors" to "anon";

grant insert on table "public"."auth_errors" to "anon";

grant references on table "public"."auth_errors" to "anon";

grant select on table "public"."auth_errors" to "anon";

grant trigger on table "public"."auth_errors" to "anon";

grant truncate on table "public"."auth_errors" to "anon";

grant update on table "public"."auth_errors" to "anon";

grant delete on table "public"."auth_errors" to "authenticated";

grant insert on table "public"."auth_errors" to "authenticated";

grant references on table "public"."auth_errors" to "authenticated";

grant select on table "public"."auth_errors" to "authenticated";

grant trigger on table "public"."auth_errors" to "authenticated";

grant truncate on table "public"."auth_errors" to "authenticated";

grant update on table "public"."auth_errors" to "authenticated";

grant delete on table "public"."auth_errors" to "service_role";

grant insert on table "public"."auth_errors" to "service_role";

grant references on table "public"."auth_errors" to "service_role";

grant select on table "public"."auth_errors" to "service_role";

grant trigger on table "public"."auth_errors" to "service_role";

grant truncate on table "public"."auth_errors" to "service_role";

grant update on table "public"."auth_errors" to "service_role";

grant delete on table "public"."auth_event_logs" to "anon";

grant insert on table "public"."auth_event_logs" to "anon";

grant references on table "public"."auth_event_logs" to "anon";

grant select on table "public"."auth_event_logs" to "anon";

grant trigger on table "public"."auth_event_logs" to "anon";

grant truncate on table "public"."auth_event_logs" to "anon";

grant update on table "public"."auth_event_logs" to "anon";

grant delete on table "public"."auth_event_logs" to "authenticated";

grant insert on table "public"."auth_event_logs" to "authenticated";

grant references on table "public"."auth_event_logs" to "authenticated";

grant select on table "public"."auth_event_logs" to "authenticated";

grant trigger on table "public"."auth_event_logs" to "authenticated";

grant truncate on table "public"."auth_event_logs" to "authenticated";

grant update on table "public"."auth_event_logs" to "authenticated";

grant delete on table "public"."auth_event_logs" to "service_role";

grant insert on table "public"."auth_event_logs" to "service_role";

grant references on table "public"."auth_event_logs" to "service_role";

grant select on table "public"."auth_event_logs" to "service_role";

grant trigger on table "public"."auth_event_logs" to "service_role";

grant truncate on table "public"."auth_event_logs" to "service_role";

grant update on table "public"."auth_event_logs" to "service_role";

grant delete on table "public"."auth_events" to "anon";

grant insert on table "public"."auth_events" to "anon";

grant references on table "public"."auth_events" to "anon";

grant select on table "public"."auth_events" to "anon";

grant trigger on table "public"."auth_events" to "anon";

grant truncate on table "public"."auth_events" to "anon";

grant update on table "public"."auth_events" to "anon";

grant delete on table "public"."auth_events" to "authenticated";

grant insert on table "public"."auth_events" to "authenticated";

grant references on table "public"."auth_events" to "authenticated";

grant select on table "public"."auth_events" to "authenticated";

grant trigger on table "public"."auth_events" to "authenticated";

grant truncate on table "public"."auth_events" to "authenticated";

grant update on table "public"."auth_events" to "authenticated";

grant delete on table "public"."auth_events" to "service_role";

grant insert on table "public"."auth_events" to "service_role";

grant references on table "public"."auth_events" to "service_role";

grant select on table "public"."auth_events" to "service_role";

grant trigger on table "public"."auth_events" to "service_role";

grant truncate on table "public"."auth_events" to "service_role";

grant update on table "public"."auth_events" to "service_role";

grant delete on table "public"."cookie_errors" to "anon";

grant insert on table "public"."cookie_errors" to "anon";

grant references on table "public"."cookie_errors" to "anon";

grant select on table "public"."cookie_errors" to "anon";

grant trigger on table "public"."cookie_errors" to "anon";

grant truncate on table "public"."cookie_errors" to "anon";

grant update on table "public"."cookie_errors" to "anon";

grant delete on table "public"."cookie_errors" to "authenticated";

grant insert on table "public"."cookie_errors" to "authenticated";

grant references on table "public"."cookie_errors" to "authenticated";

grant select on table "public"."cookie_errors" to "authenticated";

grant trigger on table "public"."cookie_errors" to "authenticated";

grant truncate on table "public"."cookie_errors" to "authenticated";

grant update on table "public"."cookie_errors" to "authenticated";

grant delete on table "public"."cookie_errors" to "service_role";

grant insert on table "public"."cookie_errors" to "service_role";

grant references on table "public"."cookie_errors" to "service_role";

grant select on table "public"."cookie_errors" to "service_role";

grant trigger on table "public"."cookie_errors" to "service_role";

grant truncate on table "public"."cookie_errors" to "service_role";

grant update on table "public"."cookie_errors" to "service_role";

grant delete on table "public"."cookie_metrics" to "anon";

grant insert on table "public"."cookie_metrics" to "anon";

grant references on table "public"."cookie_metrics" to "anon";

grant select on table "public"."cookie_metrics" to "anon";

grant trigger on table "public"."cookie_metrics" to "anon";

grant truncate on table "public"."cookie_metrics" to "anon";

grant update on table "public"."cookie_metrics" to "anon";

grant delete on table "public"."cookie_metrics" to "authenticated";

grant insert on table "public"."cookie_metrics" to "authenticated";

grant references on table "public"."cookie_metrics" to "authenticated";

grant select on table "public"."cookie_metrics" to "authenticated";

grant trigger on table "public"."cookie_metrics" to "authenticated";

grant truncate on table "public"."cookie_metrics" to "authenticated";

grant update on table "public"."cookie_metrics" to "authenticated";

grant delete on table "public"."cookie_metrics" to "service_role";

grant insert on table "public"."cookie_metrics" to "service_role";

grant references on table "public"."cookie_metrics" to "service_role";

grant select on table "public"."cookie_metrics" to "service_role";

grant trigger on table "public"."cookie_metrics" to "service_role";

grant truncate on table "public"."cookie_metrics" to "service_role";

grant update on table "public"."cookie_metrics" to "service_role";

grant delete on table "public"."daily_coverage" to "anon";

grant insert on table "public"."daily_coverage" to "anon";

grant references on table "public"."daily_coverage" to "anon";

grant select on table "public"."daily_coverage" to "anon";

grant trigger on table "public"."daily_coverage" to "anon";

grant truncate on table "public"."daily_coverage" to "anon";

grant update on table "public"."daily_coverage" to "anon";

grant delete on table "public"."daily_coverage" to "authenticated";

grant insert on table "public"."daily_coverage" to "authenticated";

grant references on table "public"."daily_coverage" to "authenticated";

grant select on table "public"."daily_coverage" to "authenticated";

grant trigger on table "public"."daily_coverage" to "authenticated";

grant truncate on table "public"."daily_coverage" to "authenticated";

grant update on table "public"."daily_coverage" to "authenticated";

grant delete on table "public"."daily_coverage" to "service_role";

grant insert on table "public"."daily_coverage" to "service_role";

grant references on table "public"."daily_coverage" to "service_role";

grant select on table "public"."daily_coverage" to "service_role";

grant trigger on table "public"."daily_coverage" to "service_role";

grant truncate on table "public"."daily_coverage" to "service_role";

grant update on table "public"."daily_coverage" to "service_role";

grant delete on table "public"."employee_access_logs" to "anon";

grant insert on table "public"."employee_access_logs" to "anon";

grant references on table "public"."employee_access_logs" to "anon";

grant select on table "public"."employee_access_logs" to "anon";

grant trigger on table "public"."employee_access_logs" to "anon";

grant truncate on table "public"."employee_access_logs" to "anon";

grant update on table "public"."employee_access_logs" to "anon";

grant delete on table "public"."employee_access_logs" to "authenticated";

grant insert on table "public"."employee_access_logs" to "authenticated";

grant references on table "public"."employee_access_logs" to "authenticated";

grant select on table "public"."employee_access_logs" to "authenticated";

grant trigger on table "public"."employee_access_logs" to "authenticated";

grant truncate on table "public"."employee_access_logs" to "authenticated";

grant update on table "public"."employee_access_logs" to "authenticated";

grant delete on table "public"."employee_access_logs" to "service_role";

grant insert on table "public"."employee_access_logs" to "service_role";

grant references on table "public"."employee_access_logs" to "service_role";

grant select on table "public"."employee_access_logs" to "service_role";

grant trigger on table "public"."employee_access_logs" to "service_role";

grant truncate on table "public"."employee_access_logs" to "service_role";

grant update on table "public"."employee_access_logs" to "service_role";

grant delete on table "public"."employee_patterns" to "anon";

grant insert on table "public"."employee_patterns" to "anon";

grant references on table "public"."employee_patterns" to "anon";

grant select on table "public"."employee_patterns" to "anon";

grant trigger on table "public"."employee_patterns" to "anon";

grant truncate on table "public"."employee_patterns" to "anon";

grant update on table "public"."employee_patterns" to "anon";

grant delete on table "public"."employee_patterns" to "authenticated";

grant insert on table "public"."employee_patterns" to "authenticated";

grant references on table "public"."employee_patterns" to "authenticated";

grant select on table "public"."employee_patterns" to "authenticated";

grant trigger on table "public"."employee_patterns" to "authenticated";

grant truncate on table "public"."employee_patterns" to "authenticated";

grant update on table "public"."employee_patterns" to "authenticated";

grant delete on table "public"."employee_patterns" to "service_role";

grant insert on table "public"."employee_patterns" to "service_role";

grant references on table "public"."employee_patterns" to "service_role";

grant select on table "public"."employee_patterns" to "service_role";

grant trigger on table "public"."employee_patterns" to "service_role";

grant truncate on table "public"."employee_patterns" to "service_role";

grant update on table "public"."employee_patterns" to "service_role";

grant delete on table "public"."employee_role_history" to "anon";

grant insert on table "public"."employee_role_history" to "anon";

grant references on table "public"."employee_role_history" to "anon";

grant select on table "public"."employee_role_history" to "anon";

grant trigger on table "public"."employee_role_history" to "anon";

grant truncate on table "public"."employee_role_history" to "anon";

grant update on table "public"."employee_role_history" to "anon";

grant delete on table "public"."employee_role_history" to "authenticated";

grant insert on table "public"."employee_role_history" to "authenticated";

grant references on table "public"."employee_role_history" to "authenticated";

grant select on table "public"."employee_role_history" to "authenticated";

grant trigger on table "public"."employee_role_history" to "authenticated";

grant truncate on table "public"."employee_role_history" to "authenticated";

grant update on table "public"."employee_role_history" to "authenticated";

grant delete on table "public"."employee_role_history" to "service_role";

grant insert on table "public"."employee_role_history" to "service_role";

grant references on table "public"."employee_role_history" to "service_role";

grant select on table "public"."employee_role_history" to "service_role";

grant trigger on table "public"."employee_role_history" to "service_role";

grant truncate on table "public"."employee_role_history" to "service_role";

grant update on table "public"."employee_role_history" to "service_role";

grant delete on table "public"."employee_shift_preferences" to "anon";

grant insert on table "public"."employee_shift_preferences" to "anon";

grant references on table "public"."employee_shift_preferences" to "anon";
