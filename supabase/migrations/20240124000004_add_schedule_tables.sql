-- Add duration category enum and column
DO $$ BEGIN
    CREATE TYPE duration_category_enum AS ENUM ('4 hours', '10 hours', '12 hours');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add duration_category if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE shifts
    ADD COLUMN duration_category duration_category_enum GENERATED ALWAYS AS (
      CASE 
        WHEN duration_hours = 4 THEN '4 hours'::duration_category_enum
        WHEN duration_hours = 10 THEN '10 hours'::duration_category_enum
        WHEN duration_hours = 12 THEN '12 hours'::duration_category_enum
        ELSE NULL
      END
    ) STORED;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create schedules table if it doesn't exist
DO $$ 
BEGIN
    CREATE TABLE schedules (
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
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Enable RLS on schedules if it exists
DO $$ 
BEGIN
    ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

-- Add trigger for updating timestamps
DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Add policies for schedules
DO $$ 
BEGIN
    CREATE POLICY "Employees can view their own schedules"
        ON schedules
        FOR SELECT
        USING (auth.uid() = employee_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    CREATE POLICY "Managers can manage all schedules"
        ON schedules
        FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM employees
                WHERE id = auth.uid()
                AND user_role IN ('Manager', 'Admin')
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Grant permissions
GRANT ALL ON schedules TO authenticated;
GRANT ALL ON schedules TO service_role; 