-- Insert default error analytics configuration
INSERT INTO error_analytics_config (
  component,
  max_contexts,
  max_user_agents,
  max_urls,
  max_trends,
  trend_period_ms,
  retention_days,
  batch_size
) VALUES (
  'default',
  100,
  50,
  100,
  1000,
  3600000,
  30,
  50
) ON CONFLICT (component) DO UPDATE SET
  max_contexts = EXCLUDED.max_contexts,
  max_user_agents = EXCLUDED.max_user_agents,
  max_urls = EXCLUDED.max_urls,
  max_trends = EXCLUDED.max_trends,
  trend_period_ms = EXCLUDED.trend_period_ms,
  retention_days = EXCLUDED.retention_days,
  batch_size = EXCLUDED.batch_size; 