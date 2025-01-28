import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/logger';
import { AppError, DatabaseError } from '@/lib/errors';
import type { Json } from '@/types/supabase';
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

  private isValidThresholds(value: unknown): value is MonitoringThresholds {
    if (!value || typeof value !== 'object') return false;
    const obj = value as any;
    
    return (
      obj.critical &&
      typeof obj.critical.coverage_deficit === 'number' &&
      typeof obj.critical.overtime_violations === 'number' &&
      typeof obj.critical.pattern_errors === 'number' &&
      typeof obj.critical.schedule_generation_time === 'number' &&
      obj.warning &&
      typeof obj.warning.coverage_deficit === 'number' &&
      typeof obj.warning.overtime_violations === 'number' &&
      typeof obj.warning.pattern_errors === 'number' &&
      typeof obj.warning.schedule_generation_time === 'number'
    );
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

      if (!config || !config.config_value) {
        throw new DatabaseError('Monitoring thresholds configuration not found');
      }

      if (!this.isValidThresholds(config.config_value)) {
        throw new DatabaseError('Invalid monitoring thresholds configuration format');
      }

      this.thresholds = config.config_value;
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
      const metrics = await this.getMetrics();
      const coverage = await this.getCoverageReport();
      const alerts: string[] = [];

      // Check thresholds
      if (!this.thresholds) {
        throw new AppError('Monitoring thresholds not initialized', 'MONITOR_CONFIG_ERROR');
      }

      // Evaluate metrics against thresholds
      if (metrics.coverage_deficit >= this.thresholds.critical.coverage_deficit) {
        alerts.push(`Critical: Coverage deficit ${metrics.coverage_deficit} exceeds threshold ${this.thresholds.critical.coverage_deficit}`);
      } else if (metrics.coverage_deficit >= this.thresholds.warning.coverage_deficit) {
        alerts.push(`Warning: Coverage deficit ${metrics.coverage_deficit} exceeds threshold ${this.thresholds.warning.coverage_deficit}`);
      }

      if (metrics.overtime_violations >= this.thresholds.critical.overtime_violations) {
        alerts.push(`Critical: ${metrics.overtime_violations} overtime violations exceed threshold ${this.thresholds.critical.overtime_violations}`);
      } else if (metrics.overtime_violations >= this.thresholds.warning.overtime_violations) {
        alerts.push(`Warning: ${metrics.overtime_violations} overtime violations exceed threshold ${this.thresholds.warning.overtime_violations}`);
      }

      if (metrics.pattern_errors >= this.thresholds.critical.pattern_errors) {
        alerts.push(`Critical: ${metrics.pattern_errors} pattern errors exceed threshold ${this.thresholds.critical.pattern_errors}`);
      } else if (metrics.pattern_errors >= this.thresholds.warning.pattern_errors) {
        alerts.push(`Warning: ${metrics.pattern_errors} pattern errors exceed threshold ${this.thresholds.warning.pattern_errors}`);
      }

      if (metrics.schedule_generation_time >= this.thresholds.critical.schedule_generation_time) {
        alerts.push(`Critical: Schedule generation time ${metrics.schedule_generation_time}ms exceeds threshold ${this.thresholds.critical.schedule_generation_time}ms`);
      } else if (metrics.schedule_generation_time >= this.thresholds.warning.schedule_generation_time) {
        alerts.push(`Warning: Schedule generation time ${metrics.schedule_generation_time}ms exceeds threshold ${this.thresholds.warning.schedule_generation_time}ms`);
      }

      const result: HealthCheckResult = {
        status: alerts.some(a => a.startsWith('Critical')) ? 'critical' : 
                alerts.some(a => a.startsWith('Warning')) ? 'degraded' : 
                'healthy',
        metrics,
        coverage,
        alerts
      };

      // Record health check result
      await this.supabase.rpc('record_scheduler_metrics', {
        p_metrics_type: 'health_check',
        p_metrics_value: this.toJson(result),
        p_environment: this.environment
      });

      return result;
    } catch (error) {
      logger.error('Health check failed', {
        error,
        context: 'SchedulerMonitor.checkHealth'
      });
      throw new AppError('Health check failed', 'HEALTH_CHECK_ERROR');
    }
  }

  /**
   * Record metrics from a schedule generation run
   */
  public async recordMetrics(metrics: Partial<SchedulerMetrics>): Promise<void> {
    try {
      const result = await this.checkHealth();
      
      // Record health check result
      await this.supabase.rpc('record_scheduler_metrics', {
        p_metrics_type: 'health_check',
        p_metrics_value: this.toJson(result),
        p_environment: this.environment
      });
    } catch (error) {
      logger.error('Failed to record scheduler metrics', {
        error,
        context: 'SchedulerMonitor.recordMetrics'
      });
      throw new AppError('Failed to record metrics', 'METRICS_RECORD_ERROR');
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

  private toJson(result: HealthCheckResult): Json {
    const jsonResult = {
      status: result.status,
      metrics: {
        coverage_deficit: result.metrics.coverage_deficit,
        overtime_violations: result.metrics.overtime_violations,
        pattern_errors: result.metrics.pattern_errors,
        schedule_generation_time: result.metrics.schedule_generation_time,
        last_run_status: result.metrics.last_run_status,
        error_message: result.metrics.error_message
      },
      coverage: result.coverage.map(c => ({
        date: c.date,
        periods: Object.fromEntries(
          Object.entries(c.periods).map(([key, value]) => [
            key,
            {
              required: value.required,
              actual: value.actual,
              supervisors: value.supervisors,
              overtime: value.overtime
            }
          ])
        )
      })),
      alerts: result.alerts
    };
    return jsonResult as Json;
  }
} 