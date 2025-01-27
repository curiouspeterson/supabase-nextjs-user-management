import { createClient } from '@/utils/supabase/server';
import type { 
  SchedulerMetrics, 
  HealthCheckResult,
  CoverageReport 
} from './types';

export class SchedulerMonitor {
  private supabase = createClient();
  private static readonly CRITICAL_THRESHOLDS = {
    coverage_deficit: 3,
    overtime_violations: 5,
    pattern_errors: 2
  };

  private static readonly WARNING_THRESHOLDS = {
    coverage_deficit: 1,
    overtime_violations: 2,
    pattern_errors: 1
  };

  /**
   * Check the overall health of the scheduling system
   */
  public async checkHealth(): Promise<HealthCheckResult> {
    const metrics = await this.getMetrics();
    const coverage = await this.getCoverageReport();
    const alerts = this.generateAlerts(metrics, coverage);
    
    return {
      status: this.determineStatus(metrics, alerts),
      metrics,
      coverage,
      alerts
    };
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

      if (error) throw error;

      return data as SchedulerMetrics;
    } catch (error) {
      console.error('Failed to fetch scheduler metrics:', error);
      return {
        coverage_deficit: 0,
        overtime_violations: 0,
        pattern_errors: 0,
        schedule_generation_time: 0,
        last_run_status: 'error',
        error_message: 'Failed to fetch metrics'
      };
    }
  }

  /**
   * Get the current coverage report
   */
  private async getCoverageReport(): Promise<CoverageReport[]> {
    try {
      const { data, error } = await this.supabase
        .from('daily_coverage')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(7);

      if (error) throw error;

      return data.reduce((acc: CoverageReport[], row) => {
        const existingReport = acc.find(r => r.date === row.date);
        if (existingReport) {
          existingReport.periods[row.period_id] = {
            required: row.required_coverage,
            actual: row.actual_coverage,
            supervisors: row.supervisor_count,
            overtime: row.overtime_hours
          };
        } else {
          acc.push({
            date: row.date,
            periods: {
              [row.period_id]: {
                required: row.required_coverage,
                actual: row.actual_coverage,
                supervisors: row.supervisor_count,
                overtime: row.overtime_hours
              }
            }
          });
        }
        return acc;
      }, []);
    } catch (error) {
      console.error('Failed to fetch coverage report:', error);
      return [];
    }
  }

  /**
   * Generate alerts based on metrics and coverage
   */
  private generateAlerts(
    metrics: SchedulerMetrics,
    coverage: CoverageReport[]
  ): string[] {
    const alerts: string[] = [];

    // Check metrics against thresholds
    if (metrics.coverage_deficit >= SchedulerMonitor.CRITICAL_THRESHOLDS.coverage_deficit) {
      alerts.push(`Critical: ${metrics.coverage_deficit} periods are understaffed`);
    }

    if (metrics.overtime_violations >= SchedulerMonitor.CRITICAL_THRESHOLDS.overtime_violations) {
      alerts.push(`Critical: ${metrics.overtime_violations} overtime violations detected`);
    }

    if (metrics.pattern_errors >= SchedulerMonitor.CRITICAL_THRESHOLDS.pattern_errors) {
      alerts.push(`Critical: ${metrics.pattern_errors} pattern violations detected`);
    }

    // Check coverage for supervisor requirements
    coverage.forEach(report => {
      Object.entries(report.periods).forEach(([periodId, data]) => {
        if (data.supervisors === 0) {
          alerts.push(`Warning: No supervisor assigned for period ${periodId} on ${report.date}`);
        }
      });
    });

    return alerts;
  }

  /**
   * Determine overall system status
   */
  private determineStatus(
    metrics: SchedulerMetrics,
    alerts: string[]
  ): 'healthy' | 'degraded' | 'critical' {
    // Check for critical conditions
    if (
      metrics.coverage_deficit >= SchedulerMonitor.CRITICAL_THRESHOLDS.coverage_deficit ||
      metrics.overtime_violations >= SchedulerMonitor.CRITICAL_THRESHOLDS.overtime_violations ||
      metrics.pattern_errors >= SchedulerMonitor.CRITICAL_THRESHOLDS.pattern_errors ||
      metrics.last_run_status === 'error'
    ) {
      return 'critical';
    }

    // Check for warning conditions
    if (
      metrics.coverage_deficit >= SchedulerMonitor.WARNING_THRESHOLDS.coverage_deficit ||
      metrics.overtime_violations >= SchedulerMonitor.WARNING_THRESHOLDS.overtime_violations ||
      metrics.pattern_errors >= SchedulerMonitor.WARNING_THRESHOLDS.pattern_errors ||
      alerts.length > 0
    ) {
      return 'degraded';
    }

    return 'healthy';
  }
} 