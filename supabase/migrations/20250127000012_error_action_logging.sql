-- Error Action Logging Migration
BEGIN;

-- Add error actions table
CREATE TABLE IF NOT EXISTS public.error_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    path TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    action_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_error_actions_user 
ON public.error_actions(user_id);

CREATE INDEX IF NOT EXISTS idx_error_actions_timestamp 
ON public.error_actions(action_timestamp);

-- Function to log error actions
CREATE OR REPLACE FUNCTION public.log_error_action(
    p_action TEXT,
    p_path TEXT,
    p_timestamp TIMESTAMPTZ DEFAULT NOW(),
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to get error action history
CREATE OR REPLACE FUNCTION public.get_error_action_history(
    p_path TEXT DEFAULT NULL,
    p_start_time TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '24 hours'),
    p_end_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    action TEXT,
    path TEXT,
    user_id UUID,
    action_timestamp TIMESTAMPTZ,
    metadata JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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

-- Add RLS policies
ALTER TABLE public.error_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert error actions"
ON public.error_actions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view error actions"
ON public.error_actions
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

-- Grant permissions
GRANT SELECT ON public.error_actions TO authenticated;
GRANT INSERT ON public.error_actions TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_error_action TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_error_action_history TO authenticated;

COMMIT; 