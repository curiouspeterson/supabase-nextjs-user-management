-- Add RPC function to update employee and profile
CREATE OR REPLACE FUNCTION update_employee_and_profile(
    p_employee_id UUID,
    p_full_name TEXT,
    p_username TEXT,
    p_employee_role employee_role_enum,
    p_weekly_hours_scheduled INTEGER,
    p_default_shift_type_id UUID DEFAULT NULL,
    p_allow_overtime BOOLEAN DEFAULT false,
    p_max_weekly_hours INTEGER DEFAULT 40
)
RETURNS public.employees AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_employee_and_profile(
    UUID,
    TEXT,
    TEXT,
    employee_role_enum,
    INTEGER,
    UUID,
    BOOLEAN,
    INTEGER
) TO authenticated; 