-- Pattern Action Tracking Migration
BEGIN;

-- Create enum for pattern action types
CREATE TYPE public.pattern_action_type AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'VALIDATE',
    'ERROR'
);

-- Create table for pattern action tracking
CREATE TABLE IF NOT EXISTS public.pattern_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type pattern_action_type NOT NULL,
    pattern_id UUID REFERENCES public.shift_patterns(id),
    user_id UUID REFERENCES auth.users(id),
    pattern_name TEXT,
    pattern_type TEXT,
    error_message TEXT,
    error_code TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_info JSONB
);

-- Create indexes
CREATE INDEX idx_pattern_actions_user ON public.pattern_actions(user_id);
CREATE INDEX idx_pattern_actions_pattern ON public.pattern_actions(pattern_id);
CREATE INDEX idx_pattern_actions_created ON public.pattern_actions(created_at);

-- Function to log pattern actions
CREATE OR REPLACE FUNCTION public.log_pattern_action(
    p_action_type pattern_action_type,
    p_pattern_id UUID,
    p_pattern_name TEXT,
    p_pattern_type TEXT,
    p_error_message TEXT DEFAULT NULL,
    p_error_code TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_client_info JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to get pattern action history
CREATE OR REPLACE FUNCTION public.get_pattern_action_history(
    p_pattern_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_action_type pattern_action_type DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    action_id UUID,
    action_type pattern_action_type,
    pattern_id UUID,
    user_id UUID,
    pattern_name TEXT,
    pattern_type TEXT,
    error_message TEXT,
    error_code TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    client_info JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add RLS policies
ALTER TABLE public.pattern_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pattern actions"
ON public.pattern_actions
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
);

CREATE POLICY "Admins can view all pattern actions"
ON public.pattern_actions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'ADMIN'
    )
);

-- Grant permissions
GRANT SELECT ON public.pattern_actions TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_pattern_action TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pattern_action_history TO authenticated;

COMMIT; 