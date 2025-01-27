import type { HealthCheckResult, CoverageReport } from '@/services/scheduler/types';
import type { HealthStatus } from './types';

/**
 * Convert a period ID to start and end time
 * Period IDs are in the format "HH:MM-HH:MM"
 */
function periodIdToTimes(periodId: string): { start_time: string; end_time: string } {
  const [start, end] = periodId.split('-');
  return { start_time: start, end_time: end };
}

/**
 * Transform CoverageReport to the format expected by the UI
 */
function transformCoverageReport(report: CoverageReport): HealthStatus['coverage'][0] {
  const periods = Object.entries(report.periods).map(([periodId, data]) => ({
    ...periodIdToTimes(periodId),
    required: data.required,
    actual: data.actual,
    supervisors: data.supervisors
  }));

  return {
    date: report.date,
    periods
  };
}

/**
 * Transform HealthCheckResult to HealthStatus
 */
export function transformHealthData(data: HealthCheckResult): HealthStatus {
  return {
    status: data.status,
    metrics: {
      coverage_deficit: data.metrics.coverage_deficit,
      overtime_violations: data.metrics.overtime_violations,
      pattern_errors: data.metrics.pattern_errors,
      schedule_generation_time: data.metrics.schedule_generation_time,
      last_run_status: data.metrics.last_run_status,
      error_message: data.metrics.error_message
    },
    coverage: data.coverage.map(transformCoverageReport),
    alerts: data.alerts
  };
} 