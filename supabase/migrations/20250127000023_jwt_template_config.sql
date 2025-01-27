-- JWT Template Configuration Migration
BEGIN;

-- Create JWT algorithm type
CREATE TYPE public.jwt_algorithm AS ENUM (
    'HS256', 'HS384', 'HS512',
    'RS256', 'RS384', 'RS512',
    'ES256', 'ES384', 'ES512'
);

-- Create JWT template configuration table
CREATE TABLE public.jwt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    algorithm jwt_algorithm NOT NULL DEFAULT 'RS256',
    template JSONB NOT NULL,
    max_age_seconds INTEGER NOT NULL DEFAULT 3600,
    allowed_issuers TEXT[] DEFAULT ARRAY['supabase'],
    required_claims TEXT[] DEFAULT ARRAY['sub', 'exp', 'iat'],
    custom_claims JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    version INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT valid_template_json CHECK (jsonb_typeof(template) = 'object'),
    CONSTRAINT valid_custom_claims CHECK (jsonb_typeof(custom_claims) = 'object')
);

-- Create JWT generation audit log
CREATE TABLE public.jwt_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.jwt_templates(id),
    template_version INTEGER NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    operation TEXT NOT NULL,
    jwt_id TEXT, -- jti claim
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    client_info JSONB,
    error_details TEXT,
    CONSTRAINT valid_operation CHECK (operation IN ('generate', 'verify', 'revoke'))
);

-- Function to validate JWT template
CREATE OR REPLACE FUNCTION public.validate_jwt_template(template JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to get active JWT template
CREATE OR REPLACE FUNCTION public.get_jwt_template(template_name TEXT)
RETURNS public.jwt_templates
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Insert default JWT template
INSERT INTO public.jwt_templates (
    name,
    description,
    algorithm,
    template,
    required_claims,
    custom_claims
) VALUES (
    'default',
    'Default JWT template with standard claims',
    'RS256',
    '{
        "header": {
            "typ": "JWT",
            "alg": "RS256"
        },
        "payload": {
            "iss": "supabase",
            "aud": "authenticated",
            "role": "authenticated"
        }
    }'::jsonb,
    ARRAY['sub', 'exp', 'iat', 'jti'],
    '{
        "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": ["authenticated"],
            "x-hasura-default-role": "authenticated"
        }
    }'::jsonb
) ON CONFLICT (name) DO UPDATE
SET template = EXCLUDED.template,
    updated_at = NOW(),
    version = jwt_templates.version + 1;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jwt_audit_logs_template 
ON public.jwt_audit_logs(template_id, template_version);

CREATE INDEX IF NOT EXISTS idx_jwt_audit_logs_user 
ON public.jwt_audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_jwt_audit_logs_issued 
ON public.jwt_audit_logs(issued_at DESC);

-- Enable RLS
ALTER TABLE public.jwt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jwt_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage JWT templates"
ON public.jwt_templates
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Admins can view all JWT audit logs"
ON public.jwt_audit_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Users can view their own JWT audit logs"
ON public.jwt_audit_logs
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Grant permissions
GRANT SELECT ON public.jwt_templates TO authenticated;
GRANT SELECT ON public.jwt_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_jwt_template TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_jwt_template TO authenticated;

COMMIT; 