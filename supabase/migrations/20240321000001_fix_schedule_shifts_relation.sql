-- Add foreign key relationship between schedules and shifts
ALTER TABLE shifts
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_shifts_schedule_id ON shifts(schedule_id);

-- Add organization_id to schedules if it doesn't exist
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add RLS policies for the relationship
CREATE POLICY "Users can view shifts for their organization's schedules"
ON shifts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM schedules s
    JOIN user_organizations uo ON s.organization_id = uo.org_id
    WHERE s.id = shifts.schedule_id
    AND uo.user_id = auth.uid()
  )
);

-- Update RLS policies for schedules
CREATE POLICY "Users can view their organization's schedules"
ON schedules FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM user_organizations uo
    WHERE uo.user_id = auth.uid()
    AND uo.org_id = schedules.organization_id
  )
); 