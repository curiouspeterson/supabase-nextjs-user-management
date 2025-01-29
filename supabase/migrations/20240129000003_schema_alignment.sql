-- Migration: Align Schema with Remote Database
BEGIN;

-- Drop existing constraints and indexes that might conflict
DROP INDEX IF EXISTS public.idx_employees_active;
DROP INDEX IF EXISTS public.idx_employees_organization;
DROP INDEX IF EXISTS public.idx_employees_role;

-- Drop dependent objects first
ALTER TABLE IF EXISTS public.employees
    DROP CONSTRAINT IF EXISTS employees_organization_id_fkey CASCADE,
    DROP CONSTRAINT IF EXISTS employees_id_fkey CASCADE;

-- Drop and recreate user_role_enum
DROP TYPE IF EXISTS public.user_role_enum CASCADE;
CREATE TYPE public.user_role_enum AS ENUM (
    'Employee',
    'Manager',
    'Admin'
);

-- Create shift_duration_category enum
DROP TYPE IF EXISTS public.shift_duration_category CASCADE;
CREATE TYPE public.shift_duration_category AS ENUM (
    'REGULAR'
);

-- Drop and recreate shift_types table
DROP TABLE IF EXISTS public.shift_types CASCADE;
CREATE TABLE public.shift_types (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT shift_types_pkey PRIMARY KEY (id),
    CONSTRAINT shift_types_name_key UNIQUE (name)
);

-- Create profiles table if it doesn't exist
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    updated_at timestamptz DEFAULT now(),
    username text,
    full_name text,
    avatar_url text,
    website text,
    role text NOT NULL DEFAULT 'Employee',
    CONSTRAINT profiles_username_key UNIQUE (username),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create a function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'Employee')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Drop and recreate shifts table
DROP TABLE IF EXISTS public.shifts CASCADE;
CREATE TABLE public.shifts (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    shift_type_id uuid NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    duration_hours integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    duration_category shift_duration_category NOT NULL,
    CONSTRAINT shifts_pkey PRIMARY KEY (id),
    CONSTRAINT shifts_duration_check CHECK (duration_hours > 0 AND duration_hours <= 24),
    CONSTRAINT shifts_shift_type_id_fkey FOREIGN KEY (shift_type_id) REFERENCES shift_types(id)
);

-- Drop and recreate employees table to match remote schema
DROP TABLE IF EXISTS public.employees CASCADE;
CREATE TABLE public.employees (
    id uuid NOT NULL PRIMARY KEY,
    user_role user_role_enum NOT NULL,
    weekly_hours_scheduled integer DEFAULT 0,
    default_shift_type_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    allow_overtime boolean NOT NULL DEFAULT false,
    max_weekly_hours integer NOT NULL DEFAULT 40,
    employee_role employee_role NOT NULL
);

-- Add foreign key constraints
ALTER TABLE public.employees
    ADD CONSTRAINT employees_default_shift_type_id_fkey 
    FOREIGN KEY (default_shift_type_id) 
    REFERENCES public.shift_types(id),
    
    ADD CONSTRAINT employees_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
    
    ADD CONSTRAINT fk_profile 
    FOREIGN KEY (id) 
    REFERENCES public.profiles(id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own employee record" ON public.employees;
DROP POLICY IF EXISTS "Admins can view all employee records" ON public.employees;
DROP POLICY IF EXISTS employees_read_all_managers ON public.employees;
DROP POLICY IF EXISTS employees_read_self ON public.employees;
DROP POLICY IF EXISTS employees_update_managers ON public.employees;
DROP POLICY IF EXISTS employees_update_self ON public.employees;

-- Create new policies using user metadata
CREATE POLICY "employees_read_self" ON public.employees
    FOR SELECT TO authenticated
    USING (id = auth.uid());

CREATE POLICY "employees_read_all_admins" ON public.employees
    FOR SELECT TO authenticated
    USING (
        COALESCE(
            (current_setting('request.jwt.claims', true)::json->>'user_role')::text,
            ''
        ) = 'ADMIN'
    );

CREATE POLICY "employees_read_all_managers" ON public.employees
    FOR SELECT TO authenticated
    USING (
        COALESCE(
            (current_setting('request.jwt.claims', true)::json->>'user_role')::text,
            ''
        ) IN ('MANAGER', 'ADMIN')
    );

CREATE POLICY "employees_update_self" ON public.employees
    FOR UPDATE TO authenticated
    USING (id = auth.uid());

CREATE POLICY "employees_update_admins" ON public.employees
    FOR UPDATE TO authenticated
    USING (
        COALESCE(
            (current_setting('request.jwt.claims', true)::json->>'user_role')::text,
            ''
        ) = 'ADMIN'
    );

-- Update other policies that depend on employee role
CREATE POLICY "profiles_read_managers" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        COALESCE(
            (current_setting('request.jwt.claims', true)::json->>'user_role')::text,
            ''
        ) IN ('MANAGER', 'ADMIN')
    );

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Shift Types policies
CREATE POLICY "Anyone can view shift types"
    ON public.shift_types FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can modify shift types"
    ON public.shift_types FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees AS e
            WHERE e.id = auth.uid()
            AND e.employee_role = 'ADMIN'
        )
    );

-- Shifts policies
CREATE POLICY "Anyone can view shifts"
    ON public.shifts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can modify shifts"
    ON public.shifts FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees AS e
            WHERE e.id = auth.uid()
            AND e.employee_role = 'ADMIN'
        )
    );

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Update profiles policies
CREATE POLICY "profiles_read_all" ON public.profiles
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "profiles_update_self" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

COMMIT; 