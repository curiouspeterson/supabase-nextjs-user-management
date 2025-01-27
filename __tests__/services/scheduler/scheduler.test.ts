import { ScheduleGenerator } from '@/services/scheduler/scheduler';
import { MidnightShiftHandler } from '@/services/scheduler/midnight-shift-handler';
import { createClient } from '@/utils/supabase/server';
import { mockClient } from '@/lib/test-utils';
import { addDays } from 'date-fns';
import type { 
  Employee, 
  Shift, 
  StaffingRequirement,
  ShiftPattern,
  Schedule,
  ShiftPreference
} from '@/services/scheduler/types';

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: mockStaffingRequirements,
          error: null
        })),
        lt: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: [],
              error: null
            }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: mockSchedule,
            error: null
          }))
        }))
      }))
    }))
  }))
}));

// Mock data
const mockEmployees: Employee[] = [
  {
    id: '1',
    employee_role: 'Shift Supervisor',
    weekly_hours_scheduled: 0,
    allow_overtime: false,
    max_weekly_hours: 40,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_role: 'employee',
    default_shift_type_id: null
  },
  {
    id: '2',
    employee_role: 'Staff',
    weekly_hours_scheduled: 0,
    allow_overtime: true,
    max_weekly_hours: 48,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_role: 'employee',
    default_shift_type_id: null
  }
];

const mockShifts: Shift[] = [
  {
    id: '1',
    shift_type_id: 'day',
    start_time: '08:00',
    end_time: '16:00',
    duration_hours: 8,
    duration_category: '8 hours',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    shift_type_id: 'night',
    start_time: '20:00',
    end_time: '04:00',
    duration_hours: 8,
    duration_category: '8 hours',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockStaffingRequirements: StaffingRequirement[] = [
  {
    id: '1',
    period_name: 'Morning',
    start_time: '08:00',
    end_time: '16:00',
    minimum_employees: 2,
    shift_supervisor_required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockPatterns: ShiftPattern[] = [
  {
    id: '1',
    name: '4x10',
    pattern: '4-3',
    is_forbidden: false,
    length: 7,
    pattern_type: '4x10',
    shift_duration: 10,
    days_on: 4,
    days_off: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockPreferences: ShiftPreference[] = [
  {
    id: '1',
    employee_id: '1',
    shift_type_id: 'day',
    preference_level: 'Preferred',
    effective_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockSchedule: Schedule = {
  id: '1',
  employee_id: '1',
  shift_id: '1',
  date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'Draft'
};

describe('ScheduleGenerator', () => {
  let scheduler: ScheduleGenerator;
  const mockSupabase = createClient();

  beforeEach(() => {
    jest.clearAllMocks();
    scheduler = new ScheduleGenerator();
  });

  describe('generateSchedule', () => {
    it('should generate a valid schedule for a date range', async () => {
      const startDate = new Date('2024-03-20');
      const endDate = new Date('2024-03-21');

      const result = await scheduler.generateSchedule({
        startDate,
        endDate,
        employees: mockEmployees,
        shifts: mockShifts,
        patterns: mockPatterns,
        preferences: mockPreferences
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should respect weekly hour limits', async () => {
      const startDate = new Date('2024-03-20');
      const endDate = new Date('2024-03-26');

      const result = await scheduler.generateSchedule({
        startDate,
        endDate,
        employees: mockEmployees,
        shifts: mockShifts,
        patterns: mockPatterns
      });

      // Group schedules by employee
      const employeeSchedules = result.reduce((acc, schedule) => {
        const shift = mockShifts.find(s => s.id === schedule.shift_id)!;
        acc[schedule.employee_id] = (acc[schedule.employee_id] || 0) + shift.duration_hours;
        return acc;
      }, {} as Record<string, number>);

      // Check that no employee exceeds their maximum hours
      Object.entries(employeeSchedules).forEach(([employeeId, hours]) => {
        const employee = mockEmployees.find(e => e.id === employeeId)!;
        expect(hours).toBeLessThanOrEqual(
          employee.allow_overtime ? employee.max_weekly_hours : 40
        );
      });
    });

    it('should ensure supervisor coverage when required', async () => {
      const startDate = new Date('2024-03-20');
      const endDate = new Date('2024-03-20');

      const result = await scheduler.generateSchedule({
        startDate,
        endDate,
        employees: mockEmployees,
        shifts: mockShifts,
        patterns: mockPatterns
      });

      // Group schedules by date and period
      const periodCoverage = result.reduce((acc, schedule) => {
        const shift = mockShifts.find(s => s.id === schedule.shift_id)!;
        const employee = mockEmployees.find(e => e.id === schedule.employee_id)!;
        
        if (!acc[schedule.date]) {
          acc[schedule.date] = {};
        }
        
        if (!acc[schedule.date][shift.start_time]) {
          acc[schedule.date][shift.start_time] = {
            total: 0,
            supervisors: 0
          };
        }
        
        acc[schedule.date][shift.start_time].total++;
        if (employee.employee_role === 'Shift Supervisor') {
          acc[schedule.date][shift.start_time].supervisors++;
        }
        
        return acc;
      }, {} as Record<string, Record<string, { total: number; supervisors: number }>>);

      // Check that each period with supervisor requirement has at least one supervisor
      Object.values(periodCoverage).forEach(datePeriods => {
        Object.entries(datePeriods).forEach(([startTime, coverage]) => {
          const requirement = mockStaffingRequirements.find(
            r => r.start_time === startTime
          );
          
          if (requirement?.shift_supervisor_required) {
            expect(coverage.supervisors).toBeGreaterThan(0);
          }
        });
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: new Error('Database error')
          }))
        }))
      }));

      const startDate = new Date('2024-03-20');
      const endDate = new Date('2024-03-20');

      await expect(scheduler.generateSchedule({
        startDate,
        endDate,
        employees: mockEmployees,
        shifts: mockShifts,
        patterns: mockPatterns
      })).rejects.toThrow('Schedule generation failed');
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
      const shift: Shift = {
        id: '1',
        shift_type_id: 'night',
        start_time: '19:00',
        end_time: '07:00',
        duration_hours: 12,
        duration_category: '12 hours',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const date = new Date('2025-01-01');
      const segments = handler.splitShiftAcrossDays(shift, date);

      expect(segments).toHaveLength(2);
      expect(segments[0].date.toISOString().split('T')[0]).toBe('2025-01-01');
      expect(segments[1].date.toISOString().split('T')[0]).toBe('2025-01-02');
      expect(segments[0].hours + segments[1].hours).toBe(12);
    });

    it('should handle non-midnight shifts correctly', () => {
      const shift: Shift = {
        id: '1',
        shift_type_id: 'day',
        start_time: '07:00',
        end_time: '17:00',
        duration_hours: 10,
        duration_category: '10 hours',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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