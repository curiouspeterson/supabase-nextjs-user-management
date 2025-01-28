-- Core Schema Migration
-- This migration sets up the core schema including all base types, tables, and policies
BEGIN;

------ ENUMS ------
-- User role enum
CREATE TYPE public.user_role AS ENUM (
    'ADMIN',
    'MANAGER',
    'EMPLOYEE'
);

-- Profile status enum
CREATE TYPE public.profile_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'PENDING'
);

-- Alert severity enum
CREATE TYPE public.alert_severity AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

-- Alert category enum
CREATE TYPE public.alert_category AS ENUM (
    'SCHEDULE',
    'COVERAGE',
    'EMPLOYEE',
    'SYSTEM',
    'PERFORMANCE'
);

-- System status enum
CREATE TYPE public.system_status AS ENUM (
    'HEALTHY',
    'DEGRADED',
    'CRITICAL',
    'MAINTENANCE'
);

-- Time off type enum
CREATE TYPE public.time_off_type AS ENUM (
    'VACATION',
    'SICK',
    'PERSONAL',
    'BEREAVEMENT',
    'JURY_DUTY',
    'UNPAID'
);

------ FUNCTIONS ------
-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------ CORE TABLES ------
-- Organizations table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'EMPLOYEE',
    status public.profile_status NOT NULL DEFAULT 'ACTIVE',
    full_name TEXT,
    avatar_url TEXT,
    last_active TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_metadata_schema CHECK (
        jsonb_typeof(metadata) = 'object' AND
        (metadata ? 'department' OR NOT metadata ? 'department') AND
        (metadata ? 'title' OR NOT metadata ? 'title') AND
        (metadata ? 'skills' OR NOT metadata ? 'skills')
    ),
    CONSTRAINT valid_preferences_schema CHECK (
        jsonb_typeof(preferences) = 'object' AND
        (preferences ? 'theme' OR NOT preferences ? 'theme') AND
        (preferences ? 'notifications' OR NOT preferences ? 'notifications') AND
        (preferences ? 'timezone' OR NOT preferences ? 'timezone')
    )
);

-- Organization users junction table
CREATE TABLE public.organization_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

------ INDEXES ------
CREATE INDEX idx_organization_users_user ON public.organization_users(user_id);
CREATE INDEX idx_organization_users_org ON public.organization_users(organization_id);
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);

------ TRIGGERS ------
-- Organizations updated_at trigger
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Profiles updated_at trigger
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Organization users updated_at trigger
CREATE TRIGGER update_organization_users_updated_at
    BEFORE UPDATE ON public.organization_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

------ RLS POLICIES ------
-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Users can view their organizations"
    ON public.organizations
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = organizations.id
        )
    );

-- Profile policies
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        role IS NOT DISTINCT FROM OLD.role AND
        status IS NOT DISTINCT FROM OLD.status
    );

CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Organization users policies
CREATE POLICY "Users can view their organization memberships"
    ON public.organization_users
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id 
            FROM public.organization_users 
            WHERE organization_id = organization_users.organization_id
            AND role = 'admin'
        )
    );

------ FUNCTIONS ------
-- Get full user profile function
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    role public.user_role,
    status public.profile_status,
    full_name TEXT,
    avatar_url TEXT,
    metadata JSONB,
    preferences JSONB,
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        u.email,
        p.role,
        p.status,
        p.full_name,
        p.avatar_url,
        p.metadata,
        p.preferences,
        p.last_active,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.id = p_user_id;
END;
$$;

------ GRANTS ------
-- Grant appropriate permissions
GRANT SELECT ON public.organizations TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.organization_users TO authenticated;
GRANT UPDATE (full_name, avatar_url, metadata, preferences) ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile TO authenticated;

COMMIT; 