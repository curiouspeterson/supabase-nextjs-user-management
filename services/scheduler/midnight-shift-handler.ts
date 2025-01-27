'use client';

import { addDays, differenceInHours, parseISO } from 'date-fns';
import type { Shift, Schedule, CoverageReport } from './types';
import { createClient } from '@/utils/supabase/server';

export interface ShiftSegment {
  date: string;
  hours: number;
}

export class MidnightShiftHandler {
  private supabase = createClient();

  constructor() {}

  /**
   * Splits a shift that crosses midnight into segments for each day
   */
  splitShiftAcrossDays(shift: Shift, date: string): ShiftSegment[] {
    const segments: ShiftSegment[] = [];
    const startDate = new Date(`${date}T${shift.start_time}`);
    let endDate = new Date(`${date}T${shift.end_time}`);

    // If end time is before start time, the shift crosses midnight
    if (shift.end_time < shift.start_time) {
      endDate = addDays(endDate, 1);
    }

    // Calculate hours for first day
    const midnightFirstDay = new Date(startDate);
    midnightFirstDay.setHours(24, 0, 0, 0);
    
    if (endDate > midnightFirstDay) {
      // Shift crosses midnight
      const firstDayHours = differenceInHours(midnightFirstDay, startDate);
      segments.push({
        date: date,
        hours: firstDayHours
      });

      // Add hours for second day
      const secondDayHours = differenceInHours(endDate, midnightFirstDay);
      segments.push({
        date: addDays(new Date(date), 1).toISOString().split('T')[0],
        hours: secondDayHours
      });
    } else {
      // Shift doesn't cross midnight
      segments.push({
        date: date,
        hours: shift.duration_hours
      });
    }

    return segments;
  }

  /**
   * Calculates coverage for shifts that may cross midnight
   */
  async calculateCoverage(schedules: Schedule[]): Promise<Map<string, CoverageReport>> {
    const coverage = new Map<string, CoverageReport>();
    
    // Get all shifts and staffing requirements
    const { data: shifts } = await this.supabase
      .from('shifts')
      .select('*');
    
    const { data: requirements } = await this.supabase
      .from('staffing_requirements')
      .select('*');

    if (!shifts || !requirements) {
      throw new Error('Failed to fetch shifts or staffing requirements');
    }

    // Process each schedule
    for (const schedule of schedules) {
      const shift = shifts.find(s => s.id === schedule.shift_id);
      if (!shift) continue;

      // Split shift if it crosses midnight
      const segments = this.splitShiftAcrossDays(shift, schedule.date);
      
      // Update coverage for each segment
      for (const segment of segments) {
        if (!coverage.has(segment.date)) {
          coverage.set(segment.date, {
            date: segment.date,
            periods: new Map()
          });
        }

        const dailyCoverage = coverage.get(segment.date)!;
        
        // Find overlapping requirements
        requirements.forEach(req => {
          const reqStart = parseISO(`${segment.date}T${req.start_time}`);
          let reqEnd = parseISO(`${segment.date}T${req.end_time}`);
          
          // Handle requirements that cross midnight
          if (req.end_time < req.start_time) {
            reqEnd = addDays(reqEnd, 1);
          }

          // Check if shift segment overlaps with requirement period
          const shiftStart = parseISO(`${segment.date}T${shift.start_time}`);
          let shiftEnd = parseISO(`${segment.date}T${shift.end_time}`);
          
          if (shift.end_time < shift.start_time) {
            shiftEnd = addDays(shiftEnd, 1);
          }

          if (shiftStart < reqEnd && shiftEnd > reqStart) {
            // Periods overlap, update coverage
            const periodKey = `${req.start_time}-${req.end_time}`;
            if (!dailyCoverage.periods.has(periodKey)) {
              dailyCoverage.periods.set(periodKey, {
                start_time: req.start_time,
                end_time: req.end_time,
                required: req.minimum_employees,
                actual: 0,
                supervisors: 0
              });
            }

            const periodCoverage = dailyCoverage.periods.get(periodKey)!;
            periodCoverage.actual++;
          }
        });
      }
    }

    return coverage;
  }

  /**
   * Updates daily coverage records for midnight shifts
   */
  async updateDailyCoverage(schedules: Schedule[]): Promise<void> {
    try {
      const coverage = await this.calculateCoverage(schedules);

      // Update coverage records in database
      for (const [date, dailyCoverage] of coverage.entries()) {
        for (const [periodKey, periodCoverage] of dailyCoverage.periods.entries()) {
          await this.supabase
            .from('daily_coverage')
            .upsert({
              date,
              period_start: periodCoverage.start_time,
              period_end: periodCoverage.end_time,
              actual_coverage: periodCoverage.actual,
              supervisor_count: periodCoverage.supervisors,
              updated_at: new Date().toISOString()
            })
            .select();
        }
      }
    } catch (error) {
      console.error('Failed to update daily coverage:', error);
      throw new Error('Failed to update daily coverage records');
    }
  }
}