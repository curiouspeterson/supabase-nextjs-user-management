import {
  validateRestHours,
  validateConsecutiveDays,
  validateStaffingRequirements,
  validateWeeklyHours,
  validatePatternCompliance,
  validateSchedule
} from '../../../utils/scheduling/validation';
import {
  Employee,
  ShiftPattern,
  EmployeePattern,
  Shift,
  StaffingRequirement,
  ScheduleAssignment
} from '../../../utils/scheduling/types';

describe('Schedule Validation', () => {
  // Test data
  const employees: Employee[] = [
    {
      id: '1',
      employeeRole: 'Dispatcher',
      weeklyHoursScheduled: 40,
      defaultShiftTypeId: 'shift1'
    },
    {
      id: '2',
      employeeRole: 'Shift Supervisor',
      weeklyHoursScheduled: 40,
      defaultShiftTypeId: 'shift2'
    }
  ];

  const patterns: ShiftPattern[] = [
    {
      id: 'pattern1',
      name: '4x10 Standard',
      patternType: '4x10',
      daysOn: 4,
      daysOff: 3,
      shiftDuration: 10
    }
  ];

  const employeePatterns: EmployeePattern[] = [
    {
      id: 'ep1',
      employeeId: '1',
      patternId: 'pattern1',
      startDate: new Date('2024-01-01'),
      rotationStartDate: new Date('2024-01-01')
    }
  ];

  const shifts: Shift[] = [
    {
      id: 'shift1',
      shiftTypeId: 'type1',
      startTime: '09:00',
      endTime: '19:00',
      durationHours: 10
    },
    {
      id: 'shift2',
      shiftTypeId: 'type2',
      startTime: '19:00',
      endTime: '05:00',
      durationHours: 10
    }
  ];

  const staffingRequirements: StaffingRequirement[] = [
    {
      id: 'req1',
      periodName: 'Day',
      startTime: '09:00',
      endTime: '17:00',
      minimumEmployees: 4,
      shiftSupervisorRequired: true
    }
  ];

  describe('validateRestHours', () => {
    it('should validate sufficient rest hours between shifts', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-02'),
          status: 'Draft'
        }
      ];

      const result = validateRestHours(assignments, shifts, 10);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect insufficient rest hours', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift2',
          date: new Date('2024-01-01'),
          status: 'Draft'
        }
      ];

      const result = validateRestHours(assignments, shifts, 10);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateConsecutiveDays', () => {
    it('should validate acceptable consecutive days', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-02'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-03'),
          status: 'Draft'
        }
      ];

      const result = validateConsecutiveDays(assignments, 4);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect too many consecutive days', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-02'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-03'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-04'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-05'),
          status: 'Draft'
        }
      ];

      const result = validateConsecutiveDays(assignments, 4);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateStaffingRequirements', () => {
    it('should validate sufficient staffing', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '2',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        }
      ];

      const result = validateStaffingRequirements(
        assignments,
        employees,
        shifts,
        [{ ...staffingRequirements[0], minimumEmployees: 2 }]
      );
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect insufficient staffing', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        }
      ];

      const result = validateStaffingRequirements(
        assignments,
        employees,
        shifts,
        staffingRequirements
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateWeeklyHours', () => {
    it('should validate acceptable weekly hours', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-02'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-03'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-04'),
          status: 'Draft'
        }
      ];

      const result = validateWeeklyHours(assignments, employees, shifts);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect excessive weekly hours', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-02'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-03'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-04'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-05'),
          status: 'Draft'
        }
      ];

      const result = validateWeeklyHours(assignments, employees, shifts);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validatePatternCompliance', () => {
    it('should validate pattern compliance', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-02'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-03'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-04'),
          status: 'Draft'
        }
      ];

      const result = validatePatternCompliance(
        assignments,
        employeePatterns,
        patterns,
        shifts
      );
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect pattern violations', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-02'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-03'),
          status: 'Draft'
        }
      ];

      const result = validatePatternCompliance(
        assignments,
        employeePatterns,
        patterns,
        shifts
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateSchedule', () => {
    it('should validate a completely valid schedule', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-02'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-03'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-04'),
          status: 'Draft'
        },
        {
          employeeId: '2',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '2',
          shiftId: 'shift1',
          date: new Date('2024-01-02'),
          status: 'Draft'
        },
        {
          employeeId: '2',
          shiftId: 'shift1',
          date: new Date('2024-01-03'),
          status: 'Draft'
        },
        {
          employeeId: '2',
          shiftId: 'shift1',
          date: new Date('2024-01-04'),
          status: 'Draft'
        }
      ];

      const result = validateSchedule(
        assignments,
        employees,
        employeePatterns,
        patterns,
        shifts,
        [{ ...staffingRequirements[0], minimumEmployees: 2 }],
        { minimumRestHours: 10, maximumConsecutiveDays: 4 }
      );
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect multiple violations', () => {
      const assignments: ScheduleAssignment[] = [
        {
          employeeId: '1',
          shiftId: 'shift1',
          date: new Date('2024-01-01'),
          status: 'Draft'
        },
        {
          employeeId: '1',
          shiftId: 'shift2',
          date: new Date('2024-01-01'),
          status: 'Draft'
        }
      ];

      const result = validateSchedule(
        assignments,
        employees,
        employeePatterns,
        patterns,
        shifts,
        staffingRequirements,
        { minimumRestHours: 10, maximumConsecutiveDays: 4 }
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
}); 