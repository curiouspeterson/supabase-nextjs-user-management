-- Auth Events Tracking Migration
BEGIN;

-- Add auth events table for tracking auth state changes
CREATE TABLE IF NOT EXISTS public.auth_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    metadata JSONB,
    client_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_auth_events_type 
ON public.auth_events(event_type);

CREATE INDEX IF NOT EXISTS idx_auth_events_user 
ON public.auth_events(user_id);

CREATE INDEX IF NOT EXISTS idx_auth_events_created 
ON public.auth_events(created_at);

-- Function to log auth events
CREATE OR REPLACE FUNCTION public.log_auth_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_client_info JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to get user auth history
CREATE OR REPLACE FUNCTION public.get_user_auth_history(
    p_user_id UUID,
    p_time_window INTERVAL DEFAULT INTERVAL '30 days'
)
RETURNS TABLE (
    event_type TEXT,
    event_count BIGINT,
    last_occurrence TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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

-- Function to analyze auth patterns
CREATE OR REPLACE FUNCTION public.analyze_auth_patterns(
    p_time_window INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE (
    event_type TEXT,
    total_events BIGINT,
    unique_users BIGINT,
    avg_events_per_user NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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

-- Add RLS policies
ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all auth events"
ON public.auth_events
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = auth.uid()
        AND employee_role = 'ADMIN'
    )
);

CREATE POLICY "Users can view their own auth events"
ON public.auth_events
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Grant necessary permissions
GRANT SELECT ON public.auth_events TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_auth_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_auth_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_auth_patterns TO authenticated;

COMMIT; 
