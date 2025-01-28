-- Security and Authentication Migration
-- This migration sets up JWT templates, error handling, and security configurations
BEGIN;

------ ENUMS ------
-- JWT algorithm type
CREATE TYPE public.jwt_algorithm AS ENUM (
    'HS256', 'HS384', 'HS512',
    'RS256', 'RS384', 'RS512',
    'ES256', 'ES384', 'ES512'
);

-- Error status codes
CREATE TYPE public.error_status_code AS ENUM (
    'BAD_REQUEST',           -- 400
    'UNAUTHORIZED',          -- 401
    'FORBIDDEN',            -- 403
    'NOT_FOUND',            -- 404
    'METHOD_NOT_ALLOWED',   -- 405
    'CONFLICT',             -- 409
    'UNPROCESSABLE_ENTITY', -- 422
    'TOO_MANY_REQUESTS',    -- 429
    'INTERNAL_ERROR',       -- 500
    'NOT_IMPLEMENTED',      -- 501
    'SERVICE_UNAVAILABLE'   -- 503
);

------ TABLES ------
-- JWT templates table
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

-- JWT audit logs table
CREATE TABLE public.jwt_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.jwt_templates(id),
    template_version INTEGER NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    operation TEXT NOT NULL,
    jwt_id TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    client_info JSONB,
    error_details TEXT,
    CONSTRAINT valid_operation CHECK (operation IN ('generate', 'verify', 'revoke'))
);

-- Error status codes table
CREATE TABLE public.error_status_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_code TEXT NOT NULL UNIQUE,
    status_code error_status_code NOT NULL,
    http_code INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

------ INDEXES ------
CREATE INDEX idx_jwt_audit_logs_template ON public.jwt_audit_logs(template_id, template_version);
CREATE INDEX idx_jwt_audit_logs_user ON public.jwt_audit_logs(user_id);
CREATE INDEX idx_jwt_audit_logs_issued ON public.jwt_audit_logs(issued_at DESC);
CREATE INDEX idx_error_codes_status ON public.error_status_codes(status_code);

------ FUNCTIONS ------
-- Validate JWT template
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

-- Get JWT template
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

-- Get HTTP code from error code
CREATE OR REPLACE FUNCTION public.get_error_http_code(p_error_code TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT http_code
        FROM public.error_status_codes
        WHERE error_code = p_error_code
    );
END;
$$;

------ TRIGGERS ------
-- Add updated_at triggers
CREATE TRIGGER update_jwt_templates_updated_at
    BEFORE UPDATE ON public.jwt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_error_status_codes_updated_at
    BEFORE UPDATE ON public.error_status_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

------ DEFAULT DATA ------
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

-- Insert default error status codes
INSERT INTO public.error_status_codes (error_code, status_code, http_code, description)
VALUES
    ('APP_ERROR', 'INTERNAL_ERROR', 500, 'Generic application error'),
    ('VALIDATION_ERROR', 'UNPROCESSABLE_ENTITY', 422, 'Data validation error'),
    ('AUTH_ERROR', 'UNAUTHORIZED', 401, 'Authentication error'),
    ('SECURITY_ERROR', 'FORBIDDEN', 403, 'Security violation error'),
    ('NETWORK_ERROR', 'SERVICE_UNAVAILABLE', 503, 'Network communication error'),
    ('RATE_LIMIT_ERROR', 'TOO_MANY_REQUESTS', 429, 'Rate limit exceeded'),
    ('NOT_FOUND_ERROR', 'NOT_FOUND', 404, 'Resource not found'),
    ('CONFLICT_ERROR', 'CONFLICT', 409, 'Resource conflict error'),
    ('METHOD_ERROR', 'METHOD_NOT_ALLOWED', 405, 'Method not allowed'),
    ('STORAGE_ERROR', 'INTERNAL_ERROR', 500, 'Storage operation error'),
    ('STORAGE_QUOTA_ERROR', 'UNPROCESSABLE_ENTITY', 422, 'Storage quota exceeded'),
    ('ERROR_ANALYTICS_ERROR', 'INTERNAL_ERROR', 500, 'Error analytics operation failed')
ON CONFLICT (error_code) DO UPDATE
SET
    status_code = EXCLUDED.status_code,
    http_code = EXCLUDED.http_code,
    description = EXCLUDED.description;

------ RLS POLICIES ------
-- Enable RLS
ALTER TABLE public.jwt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jwt_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_status_codes ENABLE ROW LEVEL SECURITY;

-- JWT template policies
CREATE POLICY "Admins can manage JWT templates"
    ON public.jwt_templates
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'ADMIN'
        )
    );

-- JWT audit log policies
CREATE POLICY "Admins can view all JWT audit logs"
    ON public.jwt_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Users can view their own JWT audit logs"
    ON public.jwt_audit_logs
    FOR SELECT
    USING (
        user_id = auth.uid()
    );

-- Error status code policies
CREATE POLICY "Everyone can read error status codes"
    ON public.error_status_codes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can modify error status codes"
    ON public.error_status_codes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'ADMIN'
        )
    );

------ GRANTS ------
GRANT SELECT ON public.jwt_templates TO authenticated;
GRANT SELECT ON public.jwt_audit_logs TO authenticated;
GRANT SELECT ON public.error_status_codes TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_jwt_template TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_jwt_template TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_error_http_code TO authenticated;

COMMIT; 