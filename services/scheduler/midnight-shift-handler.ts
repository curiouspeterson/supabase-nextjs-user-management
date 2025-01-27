'use client';

import { addDays, differenceInHours, parseISO, format, zonedTimeToUtc, utcToZonedTime } from 'date-fns';
import type { Shift, Schedule, CoverageReport } from './types';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/logger';
import { AppError, DatabaseError } from '@/lib/errors';

export interface ShiftSegment {
  date: string;
  hours: number;
}

interface ErrorDetails {
  shift_id?: string;
  schedule_id?: string;
  date?: string;
  error?: string;
}

export class MidnightShiftHandler {
  private supabase = createClient();
  private readonly timezone: string;

  constructor(timezone: string = 'UTC') {
    this.timezone = timezone;
  }

  /**
   * Split a shift that crosses midnight into segments for each day
   * @param shift The shift to split
   * @param date The date of the shift
   * @returns Array of shift segments
   */
  async splitShiftAcrossDays(shift: Shift, date: string): Promise<ShiftSegment[]> {
    try {
      // Convert the shift times to UTC, considering the timezone
      const shiftDate = parseISO(date);
      const startTime = zonedTimeToUtc(`${date}T${shift.start_time}`, this.timezone);
      const endTime = zonedTimeToUtc(`${date}T${shift.end_time}`, this.timezone);

      // Use the database function to split the shift
      const { data: segments, error } = await this.supabase.rpc('split_midnight_shift', {
        p_start_time: startTime.toISOString(),
        p_end_time: endTime.toISOString(),
        p_timezone: this.timezone
      });

      if (error) {
        throw new DatabaseError(`Failed to split midnight shift: ${error.message}`, {
          shift_id: shift.id,
          date,
          error: error.message
        });
      }

      return segments.map(segment => ({
        date: format(utcToZonedTime(parseISO(segment.segment_date), this.timezone), 'yyyy-MM-dd'),
        hours: Number(segment.hours)
      }));
    } catch (error) {
      const errorDetails: ErrorDetails = {
        shift_id: shift.id,
        date,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      // Log the error
      logger.error('Error splitting midnight shift', {
        error: errorDetails,
        context: 'MidnightShiftHandler.splitShiftAcrossDays'
      });

      // Log to database
      await this.supabase.rpc('log_scheduler_error', {
        p_error_type: 'MIDNIGHT_SHIFT_SPLIT_ERROR',
        p_error_message: 'Failed to split midnight shift',
        p_error_details: errorDetails
      });

      throw new AppError('Failed to process midnight shift', 'MIDNIGHT_SHIFT_ERROR');
    }
  }

  /**
   * Calculate coverage for a set of schedules
   * @param schedules Array of schedules to calculate coverage for
   * @returns Map of dates to coverage reports
   */
  async calculateCoverage(schedules: Schedule[]): Promise<Map<string, CoverageReport>> {
    try {
      const coverage = new Map<string, CoverageReport>();
      
      // Start a database transaction
      const { error: txError } = await this.supabase.rpc('begin_transaction');
      if (txError) throw new DatabaseError('Failed to start transaction');

      try {
        for (const schedule of schedules) {
          const { data: shift, error: shiftError } = await this.supabase
            .from('shifts')
            .select('*')
            .eq('id', schedule.shift_id)
            .single();

          if (shiftError) throw new DatabaseError('Failed to fetch shift');

          const segments = await this.splitShiftAcrossDays(shift, schedule.date);

          for (const segment of segments) {
            if (!coverage.has(segment.date)) {
              coverage.set(segment.date, {
                date: segment.date,
                periods: {}
              });
            }

            const report = coverage.get(segment.date)!;
            const periodKey = `${shift.start_time}-${shift.end_time}`;

            if (!report.periods[periodKey]) {
              report.periods[periodKey] = {
                required: 0,
                actual: 0,
                supervisors: 0,
                overtime: 0
              };
            }

            report.periods[periodKey].actual += segment.hours;
          }
        }

        // Commit transaction
        await this.supabase.rpc('commit_transaction');
        
        return coverage;
      } catch (error) {
        // Rollback transaction on error
        await this.supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      const errorDetails: ErrorDetails = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      logger.error('Error calculating coverage', {
        error: errorDetails,
        context: 'MidnightShiftHandler.calculateCoverage'
      });

      await this.supabase.rpc('log_scheduler_error', {
        p_error_type: 'COVERAGE_CALCULATION_ERROR',
        p_error_message: 'Failed to calculate coverage',
        p_error_details: errorDetails
      });

      throw new AppError('Failed to calculate coverage', 'COVERAGE_ERROR');
    }
  }

  /**
   * Update daily coverage based on schedules
   * @param schedules Array of schedules to update coverage for
   */
  async updateDailyCoverage(schedules: Schedule[]): Promise<void> {
    try {
      const coverage = await this.calculateCoverage(schedules);

      // Start a database transaction
      const { error: txError } = await this.supabase.rpc('begin_transaction');
      if (txError) throw new DatabaseError('Failed to start transaction');

      try {
        for (const [date, report] of coverage) {
          for (const [periodId, data] of Object.entries(report.periods)) {
            const { error: upsertError } = await this.supabase
              .from('daily_coverage')
              .upsert({
                date,
                period_id: periodId,
                actual_coverage: data.actual,
                required_coverage: data.required,
                supervisor_count: data.supervisors,
                overtime_hours: data.overtime,
                coverage_status: this.determineCoverageStatus(data.required, data.actual),
                timezone: this.timezone,
                updated_at: new Date().toISOString()
              });

            if (upsertError) {
              throw new DatabaseError(`Failed to upsert daily coverage: ${upsertError.message}`);
            }
          }
        }

        // Commit transaction
        await this.supabase.rpc('commit_transaction');
      } catch (error) {
        // Rollback transaction on error
        await this.supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      const errorDetails: ErrorDetails = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      logger.error('Error updating daily coverage', {
        error: errorDetails,
        context: 'MidnightShiftHandler.updateDailyCoverage'
      });

      await this.supabase.rpc('log_scheduler_error', {
        p_error_type: 'COVERAGE_UPDATE_ERROR',
        p_error_message: 'Failed to update daily coverage',
        p_error_details: errorDetails
      });

      throw new AppError('Failed to update daily coverage', 'COVERAGE_UPDATE_ERROR');
    }
  }

  private determineCoverageStatus(required: number, actual: number): 'Under' | 'Met' | 'Over' {
    if (actual < required) return 'Under';
    if (actual === required) return 'Met';
    return 'Over';
  }
}