-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    week_start_date DATE NOT NULL,
    day_of_week day_of_week_enum NOT NULL,
    shift_id uuid REFERENCES shifts(id) NOT NULL,
    employee_id uuid REFERENCES employees(id) NOT NULL,
    schedule_status schedule_status_enum DEFAULT 'Draft' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT valid_week_start CHECK (EXTRACT(DOW FROM week_start_date) = 0) -- Ensure week starts on Sunday
);

-- Create assigned shifts table
CREATE TABLE IF NOT EXISTS public.assigned_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT assigned_shifts_time_check CHECK (end_time > start_time)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assigned_shifts_employee_date ON public.assigned_shifts(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_assigned_shifts_schedule ON public.assigned_shifts(schedule_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assigned_shifts_updated_at
    BEFORE UPDATE ON public.assigned_shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_shifts ENABLE ROW LEVEL SECURITY;

-- Create schedule-related policies
CREATE POLICY "Employees can view their own schedules" ON public.schedules
    FOR SELECT
    USING (auth.uid() = employee_id);

CREATE POLICY "Managers can manage all schedules" ON public.schedules
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

CREATE POLICY "Anyone can view shift types" ON public.shift_types
    FOR SELECT
    USING (true);

CREATE POLICY "Managers can manage shift types" ON public.shift_types
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

CREATE POLICY "Anyone can view shifts" ON public.shifts
    FOR SELECT
    USING (true);

CREATE POLICY "Managers can manage shifts" ON public.shifts
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

CREATE POLICY "Anyone can view assigned shifts" ON public.assigned_shifts
    FOR SELECT
    USING (true);

CREATE POLICY "Managers can manage assigned shifts" ON public.assigned_shifts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Grant permissions
GRANT ALL ON public.schedules TO authenticated;
GRANT ALL ON public.assigned_shifts TO authenticated;
GRANT ALL ON public.schedules TO service_role;
GRANT ALL ON public.assigned_shifts TO service_role; 