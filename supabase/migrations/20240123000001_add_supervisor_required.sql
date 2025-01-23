-- Add shift_supervisor_required column to staffing_requirements
ALTER TABLE staffing_requirements 
ADD COLUMN shift_supervisor_required BOOLEAN NOT NULL DEFAULT false;

-- Update the RLS policies to include the new column
DROP POLICY IF EXISTS "Anyone can view staffing requirements" ON staffing_requirements;
CREATE POLICY "Anyone can view staffing requirements"
ON staffing_requirements FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Managers can manage staffing requirements" ON staffing_requirements;
CREATE POLICY "Managers can manage staffing requirements"
ON staffing_requirements FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE id = auth.uid()
    AND user_role IN ('Manager', 'Admin')
  )
); 