-- Add timestamp columns to staffing_requirements
ALTER TABLE staffing_requirements 
ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_staffing_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_staffing_requirements_updated_at ON staffing_requirements;
CREATE TRIGGER update_staffing_requirements_updated_at
    BEFORE UPDATE ON staffing_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_staffing_requirements_updated_at(); 