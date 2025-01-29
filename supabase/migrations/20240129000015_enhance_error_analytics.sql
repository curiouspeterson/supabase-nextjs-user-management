-- Create error analytics tables
CREATE TABLE IF NOT EXISTS error_analytics_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_type TEXT,
  component TEXT,
  severity TEXT DEFAULT 'error',
  status TEXT DEFAULT 'open',
  browser_info JSONB,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE error_analytics_data ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to insert errors
CREATE POLICY "Users can insert errors"
ON error_analytics_data FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view errors from their organization
CREATE POLICY "Organization members can view their org's errors"
ON error_analytics_data
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT org_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

-- Allow managers to update errors from their organization
CREATE POLICY "Managers can update org errors"
ON error_analytics_data
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT org_id
    FROM user_organizations
    WHERE user_id = auth.uid()
    AND role IN ('manager', 'admin')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT org_id
    FROM user_organizations
    WHERE user_id = auth.uid()
    AND role IN ('manager', 'admin')
  )
);

-- Allow service role to manage all errors
CREATE POLICY "Service role can manage errors"
ON error_analytics_data FOR ALL
TO service_role
USING (true)
WITH CHECK (true); 