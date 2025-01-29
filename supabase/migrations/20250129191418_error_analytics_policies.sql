-- Enable RLS
ALTER TABLE error_analytics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_analytics_trends ENABLE ROW LEVEL SECURITY;

-- Config table policies
CREATE POLICY "Allow authenticated users to read config"
ON error_analytics_config
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow service role to manage config"
ON error_analytics_config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Data table policies
CREATE POLICY "Allow authenticated users to insert and read error data"
ON error_analytics_data
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert error data"
ON error_analytics_data
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their error data"
ON error_analytics_data
FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Trends table policies
CREATE POLICY "Allow authenticated users to read trends"
ON error_analytics_trends
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow service role to manage trends"
ON error_analytics_trends
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
