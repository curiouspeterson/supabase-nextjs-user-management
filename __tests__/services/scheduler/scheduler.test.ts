import { ScheduleGenerator } from '@/services/scheduler/scheduler';
import { MidnightShiftHandler } from '@/services/scheduler/midnight-shift-handler';
import { createClient } from '@/utils/supabase/server';
import { mockClient } from '@/lib/test-utils';

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn()
}));

describe('ScheduleGenerator', () => {
  let scheduler: ScheduleGenerator;
  let mockSupabase: ReturnType<typeof mockClient>;

  beforeEach(() => {
    mockSupabase = mockClient();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    scheduler = new ScheduleGenerator();
  });

  describe('generateSchedule', () => {
    it('should generate a valid schedule for a given date range', async () => {
      // Mock data
      const employees = [
        {
          id: '1',
          employee_role: 'Dispatcher',
          user_role: 'Employee',
          weekly_hours_scheduled: 0,
          allow_overtime: false,
          max_weekly_hours: 40
        },
        {
          id: '2',
          employee_role: 'Shift Supervisor',
          user_role: 'Employee',
          weekly_hours_scheduled: 0,
          allow_overtime: false,
          max_weekly_hours: 40
        }
      ];

      const shifts = [
        {
          id: '1',
          shift_type_id: 'day',
          start_time: '07:00:00',
          end_time: '17:00:00',
          duration_hours: 10
        },
        {
          id: '2',
          shift_type_id: 'night',
          start_time: '19:00:00',
          end_time: '07:00:00',
          duration_hours: 12
        }
      ];

      const requirements = [
        {
          id: '1',
          period_name: 'Day',
          start_time: '07:00:00',
          end_time: '19:00:00',
          minimum_employees: 2,
          shift_supervisor_required: true
        },
        {
          id: '2',
          period_name: 'Night',
          start_time: '19:00:00',
          end_time: '07:00:00',
          minimum_employees: 2,
          shift_supervisor_required: true
        }
      ];

      // Mock Supabase responses
      mockSupabase.from.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          data: table === 'staffing_requirements' ? requirements : null,
          error: null
        }),
        insert: jest.fn().mockReturnValue({
          data: { id: 'new-schedule' },
          error: null
        }),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({
          data: null,
          error: null
        })
      }));

      // Generate schedule
      const schedule = await scheduler.generateSchedule({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-07'),
        employees,
        shifts
      });

      // Verify schedule
      expect(schedule).toBeDefined();
      expect(Array.isArray(schedule)).toBe(true);
      expect(schedule.length).toBeGreaterThan(0);
    });

    it('should handle overtime restrictions correctly', async () => {
      // Mock data with one employee near overtime limit
      const employees = [
        {
          id: '1',
          employee_role: 'Dispatcher',
          user_role: 'Employee',
          weekly_hours_scheduled: 38,
          allow_overtime: false,
          max_weekly_hours: 40
        }
      ];

      const shifts = [
        {
          id: '1',
          shift_type_id: 'day',
          start_time: '07:00:00',
          end_time: '17:00:00',
          duration_hours: 10
        }
      ];

      const requirements = [
        {
          id: '1',
          period_name: 'Day',
          start_time: '07:00:00',
          end_time: '19:00:00',
          minimum_employees: 1,
          shift_supervisor_required: false
        }
      ];

      // Mock Supabase responses
      mockSupabase.from.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          data: table === 'staffing_requirements' ? requirements : null,
          error: null
        }),
        insert: jest.fn().mockReturnValue({
          data: null,
          error: { message: 'Overtime not allowed' }
        }),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({
          data: null,
          error: null
        })
      }));

      // Generate schedule
      const schedule = await scheduler.generateSchedule({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-01'),
        employees,
        shifts
      });

      // Verify no assignments were made due to overtime restriction
      expect(schedule).toHaveLength(0);
    });
  });
});

describe('MidnightShiftHandler', () => {
  let handler: MidnightShiftHandler;
  let mockSupabase: ReturnType<typeof mockClient>;

  beforeEach(() => {
    mockSupabase = mockClient();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    handler = new MidnightShiftHandler();
  });

  describe('splitShiftAcrossDays', () => {
    it('should split a midnight shift correctly', () => {
      const shift = {
        id: '1',
        shift_type_id: 'night',
        start_time: '19:00:00',
        end_time: '07:00:00',
        duration_hours: 12
      };

      const date = new Date('2025-01-01');
      const segments = handler.splitShiftAcrossDays(shift, date);

      expect(segments).toHaveLength(2);
      expect(segments[0].date.toISOString().split('T')[0]).toBe('2025-01-01');
      expect(segments[1].date.toISOString().split('T')[0]).toBe('2025-01-02');
      expect(segments[0].hours + segments[1].hours).toBe(12);
    });

    it('should handle non-midnight shifts correctly', () => {
      const shift = {
        id: '1',
        shift_type_id: 'day',
        start_time: '07:00:00',
        end_time: '17:00:00',
        duration_hours: 10
      };

      const date = new Date('2025-01-01');
      const segments = handler.splitShiftAcrossDays(shift, date);

      expect(segments).toHaveLength(1);
      expect(segments[0].date.toISOString().split('T')[0]).toBe('2025-01-01');
      expect(segments[0].hours).toBe(10);
    });
  });

  describe('calculateCoverage', () => {
    it('should calculate coverage correctly for midnight shifts', async () => {
      const schedules = [
        {
          id: '1',
          employee_id: '1',
          shift_id: '1',
          date: '2025-01-01',
          status: 'Draft'
        }
      ];

      const shifts = [
        {
          id: '1',
          shift_type_id: 'night',
          start_time: '19:00:00',
          end_time: '07:00:00',
          duration_hours: 12
        }
      ];

      const requirements = [
        {
          id: '1',
          period_name: 'Night',
          start_time: '19:00:00',
          end_time: '07:00:00',
          minimum_employees: 2,
          shift_supervisor_required: true
        }
      ];

      // Mock Supabase responses
      mockSupabase.from.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          data: table === 'shifts' ? shifts :
                table === 'staffing_requirements' ? requirements :
                table === 'employees' ? [{ employee_role: 'Dispatcher' }] : null,
          error: null
        }),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({
          data: { employee_role: 'Dispatcher' },
          error: null
        })
      }));

      const coverage = await handler.calculateCoverage(schedules);

      // Verify coverage for both days
      expect(coverage.has('2025-01-01')).toBe(true);
      expect(coverage.has('2025-01-02')).toBe(true);

      const day1 = coverage.get('2025-01-01')!;
      const day2 = coverage.get('2025-01-02')!;

      expect(day1.periods['19:00:00-07:00:00'].actual).toBe(1);
      expect(day2.periods['19:00:00-07:00:00'].actual).toBe(1);
    });
  });
}); 