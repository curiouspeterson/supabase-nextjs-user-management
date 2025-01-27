import { createClient } from '@/utils/supabase/server';
import { CoverageReport } from './types';

export interface SchedulerMetrics {
  coverage_deficit: number;
  overtime_violations: number;
  pattern_errors: number;
  schedule_generation_time: number;
  last_run_status: 'success' | 'failure';
  error_message?: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'critical';
  metrics: SchedulerMetrics;
  coverage: {
    [date: string]: CoverageReport;
  };
  alerts: string[];
}

export class SchedulerMonitor {
  private supabase = createClient();
  private static readonly CRITICAL_THRESHOLDS = {
    coverage_deficit: 3,
    overtime_violations: 2,
    pattern_errors: 1,
    schedule_generation_time: 300 // 5 minutes
  };

  private static readonly WARNING_THRESHOLDS = {
    coverage_deficit: 1,
    overtime_violations: 1,
    pattern_errors: 0,
    schedule_generation_time: 180 // 3 minutes
  };

  /**
   * Check the overall health of the scheduling system
   */
  public async checkHealth(startDate?: Date, endDate?: Date): Promise<HealthCheckResult> {
    const metrics = await this.getMetrics();
    const coverage = await this.getCoverageReport(startDate, endDate);
    const alerts = this.generateAlerts(metrics, coverage);

    return {
      status: this.determineStatus(metrics, alerts),
      metrics,
      coverage,
      alerts
    };
  }

  /**
   * Get current scheduler metrics
   */
  private async getMetrics(): Promise<SchedulerMetrics> {
    // Get coverage deficits
    const { data: deficits } = await this.supabase
      .from('daily_coverage')
      .select('*')
      .eq('coverage_status', 'Under')
      .gte('date', new Date().toISOString().split('T')[0]);

    // Get overtime violations
    const { data: overtime } = await this.supabase
      .from('schedules')
      .select(`
        *,
        employees!inner(
          weekly_hours_scheduled,
          allow_overtime
        )
      `)
      .gte('date', new Date().toISOString().split('T')[0])
      .filter('employees.weekly_hours_scheduled', 'gt', 40)
      .filter('employees.allow_overtime', 'eq', false);

    // Get pattern violations
    const { data: patterns } = await this.supabase.rpc('get_pattern_violations', {
      start_date: new Date().toISOString().split('T')[0]
    });

    // Get last run metrics
    const { data: lastRun } = await this.supabase
      .from('scheduler_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      coverage_deficit: deficits?.length || 0,
      overtime_violations: overtime?.length || 0,
      pattern_errors: patterns?.length || 0,
      schedule_generation_time: lastRun?.generation_time || 0,
      last_run_status: lastRun?.status || 'success',
      error_message: lastRun?.error_message
    };
  }

  /**
   * Get coverage report for a date range
   */
  private async getCoverageReport(
    startDate: Date = new Date(),
    endDate: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ): Promise<{ [date: string]: CoverageReport }> {
    const { data: coverage } = await this.supabase
      .from('daily_coverage')
      .select(`
        *,
        staffing_requirements!inner(*)
      `)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (!coverage) return {};

    // Group by date
    return coverage.reduce((acc, record) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          periods: {}
        };
      }

      const requirement = record.staffing_requirements;
      const periodKey = `${requirement.start_time}-${requirement.end_time}`;
      
      acc[date].periods[periodKey] = {
        required: requirement.minimum_employees,
        actual: record.actual_coverage,
        supervisors: record.supervisor_count,
        overtime: 0 // TODO: Calculate overtime hours
      };

      return acc;
    }, {} as { [date: string]: CoverageReport });
  }

  /**
   * Generate alerts based on metrics and coverage
   */
  private generateAlerts(
    metrics: SchedulerMetrics,
    coverage: { [date: string]: CoverageReport }
  ): string[] {
    const alerts: string[] = [];

    // Check metrics against thresholds
    if (metrics.coverage_deficit >= SchedulerMonitor.CRITICAL_THRESHOLDS.coverage_deficit) {
      alerts.push(`CRITICAL: ${metrics.coverage_deficit} coverage deficits found`);
    }

    if (metrics.overtime_violations >= SchedulerMonitor.CRITICAL_THRESHOLDS.overtime_violations) {
      alerts.push(`CRITICAL: ${metrics.overtime_violations} overtime violations found`);
    }

    if (metrics.pattern_errors >= SchedulerMonitor.CRITICAL_THRESHOLDS.pattern_errors) {
      alerts.push(`CRITICAL: ${metrics.pattern_errors} pattern violations found`);
    }

    if (metrics.schedule_generation_time >= SchedulerMonitor.CRITICAL_THRESHOLDS.schedule_generation_time) {
      alerts.push(`CRITICAL: Schedule generation taking too long (${metrics.schedule_generation_time}s)`);
    }

    // Check coverage for next 7 days
    Object.entries(coverage).forEach(([date, report]) => {
      Object.entries(report.periods).forEach(([period, stats]) => {
        if (stats.actual < stats.required) {
          alerts.push(`WARNING: Coverage deficit on ${date} during ${period}`);
        }
        if (stats.supervisors === 0) {
          alerts.push(`WARNING: No supervisor coverage on ${date} during ${period}`);
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
  ): HealthCheckResult['status'] {
    // Check for critical conditions
    if (
      metrics.coverage_deficit >= SchedulerMonitor.CRITICAL_THRESHOLDS.coverage_deficit ||
      metrics.overtime_violations >= SchedulerMonitor.CRITICAL_THRESHOLDS.overtime_violations ||
      metrics.pattern_errors >= SchedulerMonitor.CRITICAL_THRESHOLDS.pattern_errors ||
      metrics.schedule_generation_time >= SchedulerMonitor.CRITICAL_THRESHOLDS.schedule_generation_time ||
      metrics.last_run_status === 'failure'
    ) {
      return 'critical';
    }

    // Check for warning conditions
    if (
      metrics.coverage_deficit >= SchedulerMonitor.WARNING_THRESHOLDS.coverage_deficit ||
      metrics.overtime_violations >= SchedulerMonitor.WARNING_THRESHOLDS.overtime_violations ||
      metrics.pattern_errors >= SchedulerMonitor.WARNING_THRESHOLDS.pattern_errors ||
      metrics.schedule_generation_time >= SchedulerMonitor.WARNING_THRESHOLDS.schedule_generation_time ||
      alerts.length > 0
    ) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Record metrics from a schedule generation run
   */
  public async recordMetrics(
    startTime: number,
    endTime: number,
    status: 'success' | 'failure',
    error?: Error
  ): Promise<void> {
    const generationTime = (endTime - startTime) / 1000; // Convert to seconds

    const { error: dbError } = await this.supabase
      .from('scheduler_metrics')
      .insert({
        generation_time: generationTime,
        status,
        error_message: error?.message,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Failed to record scheduler metrics:', dbError);
    }
  }
} 