-- Migration version: 20240129000014
-- Description: Enhance error analytics with additional features

-- Add organization support to error analytics config
ALTER TABLE error_analytics_config
ADD COLUMN organization_id UUID REFERENCES organizations(id),
ADD COLUMN environment VARCHAR(50) DEFAULT 'production',
ADD COLUMN alert_threshold INTEGER DEFAULT 10,
ADD COLUMN notification_emails TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD UNIQUE(organization_id, component, environment);

-- Add severity levels to error analytics data
ALTER TABLE error_analytics_data
ADD COLUMN severity VARCHAR(20) DEFAULT 'error'
  CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN organization_id UUID REFERENCES organizations(id),
ADD COLUMN environment VARCHAR(50) DEFAULT 'production',
ADD COLUMN resolved BOOLEAN DEFAULT false,
ADD COLUMN resolved_at TIMESTAMPTZ,
ADD COLUMN resolved_by UUID REFERENCES auth.users(id),
ADD COLUMN resolution_notes TEXT;

-- Add indexes for common queries
CREATE INDEX idx_error_analytics_data_severity ON error_analytics_data(severity);
CREATE INDEX idx_error_analytics_data_resolved ON error_analytics_data(resolved);
CREATE INDEX idx_error_analytics_data_org_env ON error_analytics_data(organization_id, environment);

-- Add aggregation support to trends
ALTER TABLE error_analytics_trends
ADD COLUMN severity_counts JSONB DEFAULT '{}'::JSONB,
ADD COLUMN organization_id UUID REFERENCES organizations(id),
ADD COLUMN environment VARCHAR(50) DEFAULT 'production',
ADD COLUMN resolution_time_avg INTERVAL,
ADD COLUMN impact_score INTEGER GENERATED ALWAYS AS (
  CASE severity_counts->>'critical'
    WHEN NULL THEN 0
    ELSE CAST(severity_counts->>'critical' AS INTEGER) * 100 +
         CAST(COALESCE(severity_counts->>'error', '0') AS INTEGER) * 10 +
         CAST(COALESCE(severity_counts->>'warning', '0') AS INTEGER)
  END
) STORED;

-- Create a view for error analytics reporting
CREATE OR REPLACE VIEW error_analytics_summary AS
SELECT 
  organization_id,
  environment,
  component,
  error_type,
  severity,
  COUNT(*) as error_count,
  COUNT(CASE WHEN resolved THEN 1 END) as resolved_count,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)))::INTEGER as avg_resolution_time_seconds,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM error_analytics_data
GROUP BY organization_id, environment, component, error_type, severity;

-- Add function to mark errors as resolved
CREATE OR REPLACE FUNCTION resolve_error(
  p_error_id UUID,
  p_user_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE error_analytics_data
  SET 
    resolved = true,
    resolved_at = NOW(),
    resolved_by = p_user_id,
    resolution_notes = p_notes
  WHERE id = p_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for new columns
ALTER TABLE error_analytics_data ENABLE ROW LEVEL SECURITY;

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

-- Update error analytics config RLS
DROP POLICY IF EXISTS "Enable read for authenticated users" ON error_analytics_config;
CREATE POLICY "Organization members can view their org's config"
  ON error_analytics_config
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT org_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Add function to get error analytics summary
CREATE OR REPLACE FUNCTION get_error_analytics_summary(
  p_organization_id UUID,
  p_environment VARCHAR DEFAULT 'production',
  p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '7 days'),
  p_end_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS TABLE (
  component TEXT,
  error_type TEXT,
  severity VARCHAR,
  error_count BIGINT,
  resolved_count BIGINT,
  avg_resolution_time_seconds INTEGER,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eas.component,
    eas.error_type,
    eas.severity,
    eas.error_count,
    eas.resolved_count,
    eas.avg_resolution_time_seconds,
    eas.first_seen,
    eas.last_seen
  FROM error_analytics_summary eas
  WHERE 
    eas.organization_id = p_organization_id
    AND eas.environment = p_environment
    AND eas.first_seen >= p_start_date
    AND eas.last_seen <= p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 