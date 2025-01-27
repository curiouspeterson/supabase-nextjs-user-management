import { ScheduleGenerator } from '../../../utils/scheduling/scheduler';
import {
  Employee,
  ShiftPattern,
  EmployeePattern,
  Shift,
  StaffingRequirement,
  SchedulingOptions
} from '../../../utils/scheduling/types';

describe('ScheduleGenerator', () => {
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
    },
    {
      id: 'pattern2',
      name: '3x12 + 1x4',
      patternType: '3x12_1x4',
      daysOn: 4,
      daysOff: 3,
      shiftDuration: 12
    }
  ];

  const employeePatterns: EmployeePattern[] = [
    {
      id: 'ep1',
      employeeId: '1',
      patternId: 'pattern1',
      startDate: new Date('2024-01-01'),
      rotationStartDate: new Date('2024-01-01')
    },
    {
      id: 'ep2',
      employeeId: '2',
      patternId: 'pattern2',
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
      startTime: '09:00',
      endTime: '21:00',
      durationHours: 12
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

  const options: SchedulingOptions = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-07'),
    minimumRestHours: 10,
    maximumConsecutiveDays: 6
  };

  let scheduler: ScheduleGenerator;

  beforeEach(() => {
    scheduler = new ScheduleGenerator(
      employees,
      patterns,
      employeePatterns,
      shifts,
      staffingRequirements,
      options
    );
  });

  describe('generateSchedule', () => {
    it('should generate a valid schedule', async () => {
      const result = await scheduler.generateSchedule();
      expect(result.success).toBe(true);
      expect(result.assignments.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    });

    it('should respect employee patterns', async () => {
      const result = await scheduler.generateSchedule();
      const employee1Assignments = result.assignments.filter(
        a => a.employeeId === '1'
      );
      
      // 4x10 pattern should have 4 assignments in a week
      expect(employee1Assignments.length).toBe(4);
    });

    it('should ensure minimum staffing requirements', async () => {
      const result = await scheduler.generateSchedule();
      
      // Group assignments by date
      const assignmentsByDate = result.assignments.reduce((acc, curr) => {
        const date = curr.date.toISOString().split('T')[0];
        acc[date] = acc[date] || [];
        acc[date].push(curr);
        return acc;
      }, {} as Record<string, typeof result.assignments>);

      // Check each date meets minimum staffing
      Object.values(assignmentsByDate).forEach(dateAssignments => {
        expect(dateAssignments.length).toBeGreaterThanOrEqual(
          staffingRequirements[0].minimumEmployees
        );
      });
    });

    it('should ensure supervisor coverage', async () => {
      const result = await scheduler.generateSchedule();
      
      // Group assignments by date
      const assignmentsByDate = result.assignments.reduce((acc, curr) => {
        const date = curr.date.toISOString().split('T')[0];
        acc[date] = acc[date] || [];
        acc[date].push(curr);
        return acc;
      }, {} as Record<string, typeof result.assignments>);

      // Check each date has at least one supervisor
      Object.values(assignmentsByDate).forEach(dateAssignments => {
        const hasSupervisor = dateAssignments.some(assignment => {
          const employee = employees.find(e => e.id === assignment.employeeId);
          return employee?.employeeRole === 'Shift Supervisor';
        });
        expect(hasSupervisor).toBe(true);
      });
    });

    it('should respect minimum rest hours', async () => {
      const result = await scheduler.generateSchedule();
      
      // Group assignments by employee
      const assignmentsByEmployee = result.assignments.reduce((acc, curr) => {
        acc[curr.employeeId] = acc[curr.employeeId] || [];
        acc[curr.employeeId].push(curr);
        return acc;
      }, {} as Record<string, typeof result.assignments>);

      // Check rest hours between shifts
      Object.values(assignmentsByEmployee).forEach(employeeAssignments => {
        const sortedAssignments = employeeAssignments.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );

        for (let i = 1; i < sortedAssignments.length; i++) {
          const prevShift = shifts.find(
            s => s.id === sortedAssignments[i - 1].shiftId
          );
          const currShift = shifts.find(
            s => s.id === sortedAssignments[i].shiftId
          );

          if (prevShift && currShift) {
            const prevEnd = new Date(
              sortedAssignments[i - 1].date.getTime() +
                this.parseTime(prevShift.endTime)
            );
            const currStart = new Date(
              sortedAssignments[i].date.getTime() +
                this.parseTime(currShift.startTime)
            );

            const restHours =
              (currStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60);
            expect(restHours).toBeGreaterThanOrEqual(options.minimumRestHours!);
          }
        }
      });
    });
  });

  // Helper function to parse time string to milliseconds
  function parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60 + minutes) * 60 * 1000;
  }
}); 