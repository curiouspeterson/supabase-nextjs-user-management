-- Create assigned_shifts table
CREATE TABLE IF NOT EXISTS public.assigned_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for common queries
CREATE INDEX idx_assigned_shifts_employee_date ON public.assigned_shifts(employee_id, date);
CREATE INDEX idx_assigned_shifts_schedule ON public.assigned_shifts(schedule_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_assigned_shifts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_assigned_shifts_updated_at
    BEFORE UPDATE ON public.assigned_shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_assigned_shifts_updated_at();

-- Enable Row Level Security
ALTER TABLE public.assigned_shifts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Everyone can view all assignments (needed for schedule visibility)
CREATE POLICY "Anyone can view assigned shifts"
    ON public.assigned_shifts
    FOR SELECT
    USING (true);

-- Employees can view their own assignments
CREATE POLICY "Employees can view own assignments"
    ON public.assigned_shifts
    FOR SELECT
    USING (auth.uid() = employee_id);

-- Only managers can create/update/delete assignments
CREATE POLICY "Managers can manage assigned shifts"
    ON public.assigned_shifts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Add constraint to ensure end_time is after start_time
ALTER TABLE public.assigned_shifts
ADD CONSTRAINT assigned_shifts_time_check 
CHECK (end_time > start_time);

-- Grant necessary permissions
GRANT SELECT ON public.assigned_shifts TO authenticated;
GRANT ALL ON public.assigned_shifts TO service_role; 