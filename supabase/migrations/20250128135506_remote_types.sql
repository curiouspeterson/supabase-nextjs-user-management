-- Create all required types for the remote schema
BEGIN;

-- Password policy enum
CREATE TYPE public.password_policy AS ENUM (
    'BASIC',
    'STANDARD',
    'STRONG',
    'CUSTOM'
);

-- Timezone policy composite type
CREATE TYPE public.timezone_policy AS (
    allowed_zones text[],
    default_zone text,
    dst_handling text
);

-- Auth error severity enum
CREATE TYPE public.auth_error_severity AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

-- Auth error type enum
CREATE TYPE public.auth_error_type AS ENUM (
    'USER_HOOK',
    'AUTH_STATE',
    'SESSION',
    'TOKEN',
    'NETWORK',
    'RATE_LIMIT',
    'UNKNOWN'
);

-- Coverage status enum
CREATE TYPE public.coverage_status_enum AS ENUM (
    'Under',
    'Met',
    'Over'
);

-- Day of week enum
CREATE TYPE public.day_of_week_enum AS ENUM (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);

-- Duration category enum
CREATE TYPE public.duration_category_enum AS ENUM (
    '4 hours',
    '10 hours',
    '12 hours'
);

-- Employee role enum
CREATE TYPE public.employee_role AS ENUM (
    'STAFF',
    'SUPERVISOR',
    'MANAGER',
    'ADMIN'
);

-- Employee role enum (legacy)
CREATE TYPE public.employee_role_enum AS ENUM (
    'Dispatcher',
    'Shift Supervisor',
    'Management'
);

-- Pattern action type enum
CREATE TYPE public.pattern_action_type AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'VALIDATE',
    'ERROR'
);

-- Period format enum
CREATE TYPE public.period_format AS ENUM (
    'HH:MM-HH:MM',
    'HH:MM:SS-HH:MM:SS',
    'HHMM-HHMM'
);

-- Schedule status enum (old version that will be renamed)
-- CREATE TYPE public.schedule_status AS ENUM (
--     'draft',
--     'published',
--     'archived'
-- );

-- Shift duration category enum
CREATE TYPE public.shift_duration_category AS ENUM (
    'SHORT',
    'REGULAR',
    'EXTENDED',
    'LONG'
);

-- Shift pattern type enum
CREATE TYPE public.shift_pattern_type_enum AS ENUM (
    '4x10',
    '3x12_1x4',
    'Custom'
);

-- Time off access level enum
CREATE TYPE public.time_off_access_level AS ENUM (
    'SELF',
    'TEAM',
    'ALL'
);

-- Time off status enum
CREATE TYPE public.time_off_status_enum AS ENUM (
    'Pending',
    'Approved',
    'Declined'
);

-- Time off type enum
CREATE TYPE public.time_off_type_enum AS ENUM (
    'Vacation',
    'Sick',
    'Personal',
    'Training'
);

-- User role enum
CREATE TYPE public.user_role_enum AS ENUM (
    'Employee',
    'Manager',
    'Admin'
);

COMMIT; 