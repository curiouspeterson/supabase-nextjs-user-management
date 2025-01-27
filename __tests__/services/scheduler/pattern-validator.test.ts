import { PatternValidator, ValidationError } from '@/services/scheduler/pattern-validator';
import type { Schedule, ShiftPattern, Employee, Shift } from '@/services/scheduler/types';

describe('PatternValidator', () => {
  let validator: PatternValidator;
  
  const mockEmployees: Employee[] = [
    {
      id: '1',
      employee_role: 'Staff',
      weekly_hours_scheduled: 0,
      allow_overtime: false,
      max_weekly_hours: 40,
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
    },
    {
      id: '2',
      name: 'Night-Day',
      pattern: 'night,day',
      is_forbidden: true,
      length: 2,
      pattern_type: 'forbidden',
      shift_duration: 8,
      days_on: 2,
      days_off: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    validator = new PatternValidator();
  });

  describe('validateAssignments', () => {
    it('should detect consecutive days violation', async () => {
      const schedules: Schedule[] = Array.from({ length: 7 }, (_, i) => ({
        id: `s${i + 1}`,
        employee_id: '1',
        shift_id: '1',
        date: new Date(2024, 2, i + 1).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'Draft'
      }));

      const errors = await validator.validateAssignments(
        schedules,
        mockPatterns,
        mockEmployees,
        mockShifts
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('consecutive_days');
      expect(errors[0].employeeId).toBe('1');
    });

    it('should detect forbidden shift patterns', async () => {
      const schedules: Schedule[] = [
        {
          id: 's1',
          employee_id: '1',
          shift_id: '2', // night shift
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        },
        {
          id: 's2',
          employee_id: '1',
          shift_id: '1', // day shift
          date: '2024-03-02',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      const errors = await validator.validateAssignments(
        schedules,
        mockPatterns,
        mockEmployees,
        mockShifts
      );

      expect(errors.some(e => e.type === 'pattern_violation')).toBe(true);
    });

    it('should detect insufficient rest periods', async () => {
      const schedules: Schedule[] = [
        {
          id: 's1',
          employee_id: '1',
          shift_id: '2', // night shift ending at 04:00
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        },
        {
          id: 's2',
          employee_id: '1',
          shift_id: '1', // day shift starting at 08:00
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      const errors = await validator.validateAssignments(
        schedules,
        mockPatterns,
        mockEmployees,
        mockShifts
      );

      expect(errors.some(e => e.type === 'insufficient_rest')).toBe(true);
    });

    it('should handle midnight crossing shifts correctly', async () => {
      const schedules: Schedule[] = [
        {
          id: 's1',
          employee_id: '1',
          shift_id: '2', // night shift ending at 04:00
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        },
        {
          id: 's2',
          employee_id: '1',
          shift_id: '2', // night shift starting at 20:00
          date: '2024-03-02',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      const errors = await validator.validateAssignments(
        schedules,
        mockPatterns,
        mockEmployees,
        mockShifts
      );

      expect(errors.some(e => e.type === 'insufficient_rest')).toBe(true);
    });

    it('should return no errors for valid schedules', async () => {
      const schedules: Schedule[] = [
        {
          id: 's1',
          employee_id: '1',
          shift_id: '1', // day shift
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        },
        {
          id: 's2',
          employee_id: '1',
          shift_id: '1', // day shift
          date: '2024-03-03',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      const errors = await validator.validateAssignments(
        schedules,
        mockPatterns,
        mockEmployees,
        mockShifts
      );

      expect(errors).toHaveLength(0);
    });

    it('should validate multiple employees independently', async () => {
      const multipleEmployees = [
        ...mockEmployees,
        {
          id: '2',
          employee_role: 'Staff',
          weekly_hours_scheduled: 0,
          allow_overtime: false,
          max_weekly_hours: 40,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_role: 'employee',
          default_shift_type_id: null
        }
      ];

      const schedules: Schedule[] = [
        // Valid schedule for employee 1
        {
          id: 's1',
          employee_id: '1',
          shift_id: '1',
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        },
        // Invalid schedule for employee 2 (insufficient rest)
        {
          id: 's2',
          employee_id: '2',
          shift_id: '2',
          date: '2024-03-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        },
        {
          id: 's3',
          employee_id: '2',
          shift_id: '1',
          date: '2024-03-02',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'Draft'
        }
      ];

      const errors = await validator.validateAssignments(
        schedules,
        mockPatterns,
        multipleEmployees,
        mockShifts
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every(e => e.employeeId === '2')).toBe(true);
    });
  });
}); 