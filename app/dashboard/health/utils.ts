import type { HealthCheckResult, CoverageReport } from '@/services/scheduler/types';
import type { HealthStatus } from './types';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/client';
import { TimeFormatError } from '@/utils/scheduling/date-utils';

// Period format validation schema
const periodFormatSchema = z.object({
  periodId: z.string().regex(
    /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    'Invalid period format. Expected HH:MM-HH:MM'
  )
});

// Error class for period-related errors
export class PeriodError extends Error {
  constructor(
    message: string,
    public readonly periodId: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PeriodError';
  }
}

/**
 * Convert a period ID to start and end time with validation
 * Period IDs are in the format "HH:MM-HH:MM"
 * 
 * @throws {PeriodError} If period ID format is invalid
 * @throws {TimeFormatError} If time format is invalid
 */
export async function periodIdToTimes(periodId: string): Promise<{ start_time: string; end_time: string }> {
  const supabase = createClient();
  
  try {
    // Validate period format
    const { periodId: validatedId } = periodFormatSchema.parse({ periodId });
    
    // Split into start and end times
    const [start, end] = validatedId.split('-');
    
    // Check if period crosses midnight
    const { data: crossesMidnight } = await supabase.rpc('period_crosses_midnight', {
      p_start_time: start,
      p_end_time: end
    });

    // Log period format check
    await supabase.from('period_format_issues').insert({
      period_id: periodId,
      source_format: 'HH:MM-HH:MM',
      error_message: crossesMidnight ? 'Period crosses midnight' : 'Valid period format',
      component: 'health-dashboard',
      resolved_at: new Date().toISOString(),
      resolution: 'Automatically validated'
    });

    return { 
      start_time: start, 
      end_time: end 
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const periodError = new PeriodError(
        'Invalid period format',
        periodId,
        { zodError: error.errors }
      );

      // Log validation error
      await supabase.from('period_format_issues').insert({
        period_id: periodId,
        source_format: 'HH:MM-HH:MM',
        error_message: error.errors[0]?.message || 'Unknown validation error',
        component: 'health-dashboard'
      });

      throw periodError;
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Transform CoverageReport to the format expected by the UI
 * Includes validation and error handling for period formats
 */
export async function transformCoverageReport(report: CoverageReport): Promise<HealthStatus['coverage'][0]> {
  const periods = await Promise.all(
    Object.entries(report.periods).map(async ([periodId, data]) => {
      try {
        const times = await periodIdToTimes(periodId);
        return {
          ...times,
          required: data.required,
          actual: data.actual,
          supervisors: data.supervisors
        };
      } catch (error) {
        console.error(`Error processing period ${periodId}:`, error);
        // Return a safe fallback for UI
        return {
          start_time: 'Invalid',
          end_time: 'Invalid',
          required: data.required,
          actual: data.actual,
          supervisors: data.supervisors
        };
      }
    })
  );

  return {
    date: report.date,
    periods
  };
}

/**
 * Transform HealthCheckResult to HealthStatus
 * Includes error handling for coverage report transformation
 */
export async function transformHealthData(data: HealthCheckResult): Promise<HealthStatus> {
  const coverage = await Promise.all(
    data.coverage.map(transformCoverageReport)
  );

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
    coverage,
    alerts: data.alerts
  };
}