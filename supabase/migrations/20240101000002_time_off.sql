-- Create time off tables
CREATE TABLE IF NOT EXISTS "public"."time_off_requests" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "employee_id" uuid NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "type" time_off_type_enum NOT NULL,
    "status" time_off_status_enum DEFAULT 'Pending' NOT NULL,
    "notes" text,
    "reviewed_by" uuid,
    "reviewed_at" timestamptz,
    "submitted_at" timestamptz DEFAULT now() NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "time_off_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "time_off_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "auth"."users"("id"),
    CONSTRAINT "time_off_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id")
);

-- Enable RLS
ALTER TABLE "public"."time_off_requests" ENABLE ROW LEVEL SECURITY;

-- Create time off request function
CREATE OR REPLACE FUNCTION public.request_time_off(
    p_start_date date,
    p_end_date date,
    p_type time_off_type_enum,
    p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_request_id uuid;
BEGIN
    INSERT INTO time_off_requests (
        employee_id,
        start_date,
        end_date,
        type,
        notes
    ) VALUES (
        auth.uid(),
        p_start_date,
        p_end_date,
        p_type,
        p_notes
    )
    RETURNING id INTO v_request_id;
    
    RETURN v_request_id;
END;
$$;

-- Create time off review function
CREATE OR REPLACE FUNCTION public.review_time_off_request(
    p_request_id uuid,
    p_status time_off_status_enum,
    p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Check if user has permission to review
    IF NOT EXISTS (
        SELECT 1 FROM employees
        WHERE id = auth.uid()
        AND user_role IN ('Manager', 'Admin')
    ) THEN
        RAISE EXCEPTION 'Unauthorized to review time off requests';
    END IF;

    -- Update the request
    UPDATE time_off_requests
    SET status = p_status,
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        notes = COALESCE(p_notes, notes),
        updated_at = now()
    WHERE id = p_request_id
    RETURNING jsonb_build_object(
        'id', id,
        'status', status,
        'reviewed_by', reviewed_by,
        'reviewed_at', reviewed_at,
        'notes', notes
    ) INTO v_result;

    IF v_result IS NULL THEN
        RAISE EXCEPTION 'Time off request not found';
    END IF;

    RETURN v_result;
END;
$$;

-- Create time off policies
CREATE POLICY "Users can request time off" ON public.time_off_requests
    FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can view own time off requests" ON public.time_off_requests
    FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Managers can view all time off requests" ON public.time_off_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

CREATE POLICY "Managers can review time off requests" ON public.time_off_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON public.time_off_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.request_time_off(date, date, time_off_type_enum, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_time_off_request(uuid, time_off_status_enum, text) TO authenticated; 