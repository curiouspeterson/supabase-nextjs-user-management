import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/logger';
import { AppError, DatabaseError } from '@/lib/errors';
import type { 
  SchedulerMetrics, 
  HealthCheckResult,
  CoverageReport 
} from './types';

interface MonitoringThresholds {
  critical: {
    coverage_deficit: number;
    overtime_violations: number;
    pattern_errors: number;
    schedule_generation_time: number;
  };
  warning: {
    coverage_deficit: number;
    overtime_violations: number;
    pattern_errors: number;
    schedule_generation_time: number;
  };
}

interface MetricsError {
  type: string;
  message: string;
  details?: unknown;
}

export class SchedulerMonitor {
  private supabase = createClient();
  private thresholds: MonitoringThresholds | null = null;
  private readonly environment: string;

  constructor(environment: string = process.env.NODE_ENV || 'development') {
    this.environment = environment;
  }

  /**
   * Initialize monitoring thresholds from database
   */
  private async initializeThresholds(): Promise<void> {
    try {
      const { data: config, error } = await this.supabase.rpc(
        'get_scheduler_config',
        { 
          p_config_key: 'monitoring_thresholds',
          p_environment: this.environment
        }
      );

      if (error) {
        throw new DatabaseError(`Failed to get monitoring thresholds: ${error.message}`);
      }

      this.thresholds = config as MonitoringThresholds;
    } catch (error) {
      logger.error('Failed to initialize monitoring thresholds', {
        error,
        context: 'SchedulerMonitor.initializeThresholds'
      });
      throw new AppError('Failed to initialize monitoring system', 'MONITOR_INIT_ERROR');
    }
  }

  /**
   * Check the overall health of the scheduling system
   */
  public async checkHealth(): Promise<HealthCheckResult> {
    try {
      // Initialize thresholds if not already done
      if (!this.thresholds) {
        await this.initializeThresholds();
      }

      // Get current metrics and coverage
      const [metrics, coverage] = await Promise.all([
        this.getMetrics(),
        this.getCoverageReport()
      ]);

      // Generate alerts based on thresholds
      const alerts: string[] = [];
      const thresholds = this.thresholds!;

      if (metrics.coverage_deficit >= thresholds.critical.coverage_deficit) {
        alerts.push(`CRITICAL: Coverage deficit (${metrics.coverage_deficit}) exceeds critical threshold`);
      } else if (metrics.coverage_deficit >= thresholds.warning.coverage_deficit) {
        alerts.push(`WARNING: Coverage deficit (${metrics.coverage_deficit}) exceeds warning threshold`);
      }

      if (metrics.overtime_violations >= thresholds.critical.overtime_violations) {
        alerts.push(`CRITICAL: Overtime violations (${metrics.overtime_violations}) exceed critical threshold`);
      } else if (metrics.overtime_violations >= thresholds.warning.overtime_violations) {
        alerts.push(`WARNING: Overtime violations (${metrics.overtime_violations}) exceed warning threshold`);
      }

      if (metrics.pattern_errors >= thresholds.critical.pattern_errors) {
        alerts.push(`CRITICAL: Pattern errors (${metrics.pattern_errors}) exceed critical threshold`);
      } else if (metrics.pattern_errors >= thresholds.warning.pattern_errors) {
        alerts.push(`WARNING: Pattern errors (${metrics.pattern_errors}) exceed warning threshold`);
      }

      if (metrics.schedule_generation_time >= thresholds.critical.schedule_generation_time) {
        alerts.push(`CRITICAL: Schedule generation time (${metrics.schedule_generation_time}ms) exceeds critical threshold`);
      } else if (metrics.schedule_generation_time >= thresholds.warning.schedule_generation_time) {
        alerts.push(`WARNING: Schedule generation time (${metrics.schedule_generation_time}ms) exceeds warning threshold`);
      }

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (alerts.some(alert => alert.startsWith('CRITICAL'))) {
        status = 'critical';
      } else if (alerts.some(alert => alert.startsWith('WARNING'))) {
        status = 'degraded';
      }

      const result: HealthCheckResult = {
        status,
        metrics,
        coverage,
        alerts
      };

      // Record health check result
      await this.supabase.rpc('record_scheduler_metrics', {
        p_metrics_type: 'health_check',
        p_metrics_value: result,
        p_environment: this.environment
      });

      return result;
    } catch (error) {
      logger.error('Health check failed', {
        error,
        context: 'SchedulerMonitor.checkHealth'
      });

      throw new AppError(
        'Failed to complete health check',
        'HEALTH_CHECK_ERROR',
        {
          originalError: error instanceof Error ? error.message : 'Unknown error'
        }
      );
    }
  }

  /**
   * Record metrics from a schedule generation run
   */
  public async recordMetrics(metrics: Partial<SchedulerMetrics>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('scheduler_metrics')
        .insert({
          ...metrics,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to record scheduler metrics:', error);
      throw new Error('Failed to record metrics');
    }
  }

  /**
   * Get the most recent metrics
   */
  private async getMetrics(): Promise<SchedulerMetrics> {
    try {
      const { data, error } = await this.supabase
        .from('scheduler_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        throw new DatabaseError(`Failed to get scheduler metrics: ${error.message}`);
      }

      // Record metrics history
      await this.supabase.rpc('record_scheduler_metrics', {
        p_metrics_type: 'scheduler_health',
        p_metrics_value: data,
        p_environment: this.environment
      });

      return data as SchedulerMetrics;
    } catch (error) {
      const metricsError: MetricsError = {
        type: 'METRICS_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };

      logger.error('Failed to get scheduler metrics', {
        error: metricsError,
        context: 'SchedulerMonitor.getMetrics'
      });

      throw new AppError('Failed to get scheduler metrics', 'METRICS_ERROR');
    }
  }

  /**
   * Get the current coverage report
   */
  private async getCoverageReport(): Promise<CoverageReport[]> {
    try {
      const { data, error } = await this.supabase
        .from('daily_coverage')
        .select(`
          date,
          period_id,
          actual_coverage,
          required_coverage,
          supervisor_count,
          overtime_hours
        `)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        throw new DatabaseError(`Failed to get coverage report: ${error.message}`);
      }

      // Transform data into coverage report format
      const reports: CoverageReport[] = [];
      const dateMap = new Map<string, CoverageReport>();

      for (const row of data) {
        if (!dateMap.has(row.date)) {
          dateMap.set(row.date, {
            date: row.date,
            periods: {}
          });
        }

        const report = dateMap.get(row.date)!;
        report.periods[row.period_id] = {
          required: row.required_coverage,
          actual: row.actual_coverage,
          supervisors: row.supervisor_count,
          overtime: row.overtime_hours
        };
      }

      return Array.from(dateMap.values());
    } catch (error) {
      const coverageError: MetricsError = {
        type: 'COVERAGE_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };

      logger.error('Failed to get coverage report', {
        error: coverageError,
        context: 'SchedulerMonitor.getCoverageReport'
      });

      throw new AppError('Failed to get coverage report', 'COVERAGE_ERROR');
    }
  }
} 