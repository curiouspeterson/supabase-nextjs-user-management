import { MidnightShiftHandler } from '@/services/scheduler/midnight-shift-handler';
import { createClient } from '@/utils/supabase/server';
import { addDays } from 'date-fns';
import type { 
  Shift,
  Schedule,
  StaffingRequirement,
  CoverageReport
} from '@/services/scheduler/types';

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: [],
        error: null
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }))
}));

describe('MidnightShiftHandler', () => {
  let handler: MidnightShiftHandler;
  const mockSupabase = createClient();
  let mockShifts: Shift[];
  let mockSchedules: Schedule[];
  let mockRequirements: StaffingRequirement[];

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new MidnightShiftHandler();

    // Mock shifts
    mockShifts = [
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

    // Mock schedules
    mockSchedules = [
      {
        id: '1',
        employee_id: '1',
        shift_id: '2', // night shift
        date: '2025-01-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'Draft'
      }
    ];

    // Mock staffing requirements
    mockRequirements = [
      {
        id: '1',
        period_name: 'Morning',
        start_time: '08:00',
        end_time: '16:00',
        minimum_employees: 2,
        shift_supervisor_required: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        period_name: 'Night',
        start_time: '20:00',
        end_time: '04:00',
        minimum_employees: 2,
        shift_supervisor_required: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Mock Supabase responses
    (mockSupabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn(() => ({
        data: [
          ...mockShifts,
          ...mockRequirements
        ],
        error: null
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }));
  });

  describe('splitShiftAcrossDays', () => {
    it('should split a midnight crossing shift into two segments', () => {
      const shift = mockShifts[1]; // night shift
      const date = '2024-03-01';

      const segments = handler.splitShiftAcrossDays(shift, date);

      expect(segments).toHaveLength(2);
      expect(segments[0].date).toBe('2024-03-01');
      expect(segments[1].date).toBe('2024-03-02');
      expect(segments[0].hours + segments[1].hours).toBe(shift.duration_hours);
    });

    it('should not split a non-midnight crossing shift', () => {
      const shift = mockShifts[0]; // day shift
      const date = '2024-03-01';

      const segments = handler.splitShiftAcrossDays(shift, date);

      expect(segments).toHaveLength(1);
      expect(segments[0].date).toBe(date);
      expect(segments[0].hours).toBe(shift.duration_hours);
    });

    it('should handle shifts starting at midnight', () => {
      const midnightShift: Shift = {
        ...mockShifts[0],
        start_time: '00:00',
        end_time: '08:00'
      };
      const date = '2024-03-01';

      const segments = handler.splitShiftAcrossDays(midnightShift, date);

      expect(segments).toHaveLength(1);
      expect(segments[0].date).toBe(date);
      expect(segments[0].hours).toBe(midnightShift.duration_hours);
    });
  });

  describe('calculateCoverage', () => {
    it('should calculate coverage for non-midnight shifts', async () => {
      const schedules: Schedule[] = [
        {
          id: '1',
          employee_id: '1',
          shift_id: '1', // day shift
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      const coverage = await handler.calculateCoverage(schedules);

      expect(coverage.has('2024-03-01')).toBe(true);
      const dailyCoverage = coverage.get('2024-03-01')!;
      expect(dailyCoverage.periods.size).toBeGreaterThan(0);
    });

    it('should calculate coverage for midnight crossing shifts', async () => {
      const schedules: Schedule[] = [
        {
          id: '1',
          employee_id: '1',
          shift_id: '2', // night shift
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      const coverage = await handler.calculateCoverage(schedules);

      expect(coverage.has('2024-03-01')).toBe(true);
      expect(coverage.has('2024-03-02')).toBe(true);
    });

    it('should handle multiple overlapping shifts', async () => {
      const schedules: Schedule[] = [
        {
          id: '1',
          employee_id: '1',
          shift_id: '2', // night shift
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        },
        {
          id: '2',
          employee_id: '2',
          shift_id: '2', // night shift
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      const coverage = await handler.calculateCoverage(schedules);

      const dailyCoverage = coverage.get('2024-03-01')!;
      const nightPeriod = Array.from(dailyCoverage.periods.values()).find(
        p => p.start_time === '20:00'
      );
      expect(nightPeriod?.actual).toBe(2);
    });

    it('should handle database errors gracefully', async () => {
      (mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          data: null,
          error: new Error('Database error')
        }))
      }));

      const schedules: Schedule[] = [
        {
          id: '1',
          employee_id: '1',
          shift_id: '1',
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      await expect(handler.calculateCoverage(schedules)).rejects.toThrow(
        'Failed to fetch shifts or staffing requirements'
      );
    });
  });

  describe('updateDailyCoverage', () => {
    it('should update coverage records successfully', async () => {
      const schedules: Schedule[] = [
        {
          id: '1',
          employee_id: '1',
          shift_id: '1',
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      await expect(handler.updateDailyCoverage(schedules)).resolves.not.toThrow();
    });

    it('should handle database errors during update', async () => {
      (mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          data: mockShifts,
          error: null
        })),
        upsert: jest.fn(() => ({
          select: jest.fn(() => ({
            data: null,
            error: new Error('Update failed')
          }))
        }))
      }));

      const schedules: Schedule[] = [
        {
          id: '1',
          employee_id: '1',
          shift_id: '1',
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      await expect(handler.updateDailyCoverage(schedules)).rejects.toThrow(
        'Failed to update daily coverage records'
      );
    });
  });
}); 