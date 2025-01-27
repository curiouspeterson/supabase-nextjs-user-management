import { createClient } from '@/utils/supabase/server';
import { Shift, Schedule, CoverageReport } from './types';

export class MidnightShiftHandler {
  private supabase = createClient();

  /**
   * Split a shift that crosses midnight into daily segments
   */
  public splitShiftAcrossDays(shift: Shift, date: Date): { date: Date; hours: number }[] {
    const segments: { date: Date; hours: number }[] = [];
    
    const shiftStart = new Date(`${date.toISOString().split('T')[0]}T${shift.start_time}`);
    const shiftEnd = new Date(`${date.toISOString().split('T')[0]}T${shift.end_time}`);
    
    // If end time is before start time, it crosses midnight
    if (shiftEnd < shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }
    
    // Calculate hours in first day
    const midnight = new Date(shiftStart);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    
    if (midnight < shiftEnd) {
      // Split across days
      const firstDayHours = (midnight.getTime() - shiftStart.getTime()) / (1000 * 60 * 60);
      const secondDayHours = (shiftEnd.getTime() - midnight.getTime()) / (1000 * 60 * 60);
      
      segments.push(
        { date: new Date(date), hours: firstDayHours },
        { date: new Date(midnight), hours: secondDayHours }
      );
    } else {
      // All hours in same day
      segments.push({
        date: new Date(date),
        hours: (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60)
      });
    }
    
    return segments;
  }

  /**
   * Calculate coverage for shifts that may cross midnight
   */
  public async calculateCoverage(schedules: Schedule[]): Promise<Map<string, CoverageReport>> {
    const coverage = new Map<string, CoverageReport>();
    
    // Get all shifts
    const { data: shifts } = await this.supabase
      .from('shifts')
      .select('*');
      
    if (!shifts) {
      throw new Error('Failed to fetch shifts');
    }
    
    // Get staffing requirements
    const { data: requirements } = await this.supabase
      .from('staffing_requirements')
      .select('*');
      
    if (!requirements) {
      throw new Error('Failed to fetch staffing requirements');
    }
    
    // Process each schedule
    for (const schedule of schedules) {
      const shift = shifts.find(s => s.id === schedule.shift_id);
      if (!shift) continue;
      
      const segments = this.splitShiftAcrossDays(shift, new Date(schedule.date));
      
      // Update coverage for each day segment
      for (const segment of segments) {
        const dateKey = segment.date.toISOString().split('T')[0];
        
        if (!coverage.has(dateKey)) {
          coverage.set(dateKey, {
            date: dateKey,
            periods: {}
          });
        }
        
        const dayReport = coverage.get(dateKey)!;
        
        // Check coverage for each requirement period
        for (const req of requirements) {
          const periodKey = `${req.start_time}-${req.end_time}`;
          
          if (!dayReport.periods[periodKey]) {
            dayReport.periods[periodKey] = {
              required: req.minimum_employees,
              actual: 0,
              supervisors: 0,
              overtime: 0
            };
          }
          
          // Update coverage if shift overlaps with requirement period
          const shiftStart = new Date(`1970-01-01T${shift.start_time}`);
          const shiftEnd = new Date(`1970-01-01T${shift.end_time}`);
          const reqStart = new Date(`1970-01-01T${req.start_time}`);
          const reqEnd = new Date(`1970-01-01T${req.end_time}`);
          
          if (shiftStart <= reqEnd && shiftEnd >= reqStart) {
            dayReport.periods[periodKey].actual++;
            
            // Get employee details for supervisor count
            const { data: employee } = await this.supabase
              .from('employees')
              .select('employee_role')
              .eq('id', schedule.employee_id)
              .single();
              
            if (employee?.employee_role === 'Shift Supervisor') {
              dayReport.periods[periodKey].supervisors++;
            }
          }
        }
      }
    }
    
    return coverage;
  }

  /**
   * Update daily coverage records for midnight shifts
   */
  public async updateDailyCoverage(schedules: Schedule[]): Promise<void> {
    const coverage = await this.calculateCoverage(schedules);
    
    // Update database records
    for (const [date, report] of coverage.entries()) {
      for (const [periodKey, stats] of Object.entries(report.periods)) {
        const [startTime, endTime] = periodKey.split('-');
        
        // Get or create daily coverage record
        const { data: requirement } = await this.supabase
          .from('staffing_requirements')
          .select('id')
          .eq('start_time', startTime)
          .eq('end_time', endTime)
          .single();
          
        if (!requirement) continue;
        
        const { error } = await this.supabase
          .from('daily_coverage')
          .upsert({
            date,
            period_id: requirement.id,
            actual_coverage: stats.actual,
            supervisor_count: stats.supervisors,
            coverage_status: stats.actual < stats.required ? 'Under' :
                           stats.actual === stats.required ? 'Met' : 'Over'
          });
          
        if (error) {
          console.error(`Failed to update coverage for ${date}:`, error);
        }
      }
    }
  }
} 