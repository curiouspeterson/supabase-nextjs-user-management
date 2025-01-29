-- Migration version: 20240129000013
-- Description: Create error analytics tables and setup monitoring

-- Drop existing tables if they exist
DROP TABLE IF EXISTS error_analytics_trends CASCADE;
DROP TABLE IF EXISTS error_analytics_data CASCADE;
DROP TABLE IF EXISTS error_analytics_config CASCADE;

-- Create error analytics config table
CREATE TABLE error_analytics_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL UNIQUE,
  max_contexts INTEGER NOT NULL DEFAULT 100,
  max_user_agents INTEGER NOT NULL DEFAULT 50,
  max_urls INTEGER NOT NULL DEFAULT 100,
  max_trends INTEGER NOT NULL DEFAULT 1000,
  trend_period_ms BIGINT NOT NULL DEFAULT 3600000,
  retention_days INTEGER NOT NULL DEFAULT 30,
  batch_size INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create error analytics data table
CREATE TABLE error_analytics_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  user_agent TEXT,
  url TEXT,
  batch_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create error analytics trends table
CREATE TABLE error_analytics_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL,
  error_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  first_seen TIMESTAMPTZ NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL,
  contexts JSONB[] DEFAULT ARRAY[]::JSONB[],
  user_agents TEXT[] DEFAULT ARRAY[]::TEXT[],
  urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(component, error_type)
);

-- Add RLS policies
ALTER TABLE error_analytics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_analytics_trends ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users"
  ON error_analytics_config
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert/update for authenticated users"
  ON error_analytics_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users"
  ON error_analytics_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON error_analytics_data
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users"
  ON error_analytics_trends
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert/update for authenticated users"
  ON error_analytics_trends
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_error_analytics_data_component ON error_analytics_data(component);
CREATE INDEX idx_error_analytics_data_error_type ON error_analytics_data(error_type);
CREATE INDEX idx_error_analytics_data_timestamp ON error_analytics_data(timestamp);
CREATE INDEX idx_error_analytics_trends_component ON error_analytics_trends(component);
CREATE INDEX idx_error_analytics_trends_error_type ON error_analytics_trends(error_type);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON error_analytics_config
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON error_analytics_trends
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp(); 