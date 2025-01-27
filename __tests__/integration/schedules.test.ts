import { createClient } from '@supabase/supabase-js'
import { scheduleService } from '@/services/scheduleService'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

describe('Schedule Management Integration Tests', () => {
  let testEmployee: any
  let testShift: any
  let testSchedule: any

  beforeAll(async () => {
    // Create test data
    const { data: employee } = await supabase
      .from('employees')
      .insert({
        full_name: 'Test Employee',
        employee_pattern: '4x10',
        weekly_hours_scheduled: 40,
        role: 'employee'
      })
      .select()
      .single()

    const { data: shiftType } = await supabase
      .from('shift_types')
      .insert({
        name: 'Test Shift Type',
        description: 'Test shift type for integration tests'
      })
      .select()
      .single()

    const { data: shift } = await supabase
      .from('shifts')
      .insert({
        shift_type_id: shiftType.id,
        start_time: '09:00',
        end_time: '17:00',
        duration_hours: 8,
        duration_category: '10 hours'
      })
      .select()
      .single()

    testEmployee = employee
    testShift = shift
  })

  afterAll(async () => {
    // Clean up test data
    if (testSchedule?.id) {
      await supabase
        .from('schedules')
        .delete()
        .eq('id', testSchedule.id)
    }

    if (testShift?.id) {
      await supabase
        .from('shifts')
        .delete()
        .eq('id', testShift.id)
    }

    if (testEmployee?.id) {
      await supabase
        .from('employees')
        .delete()
        .eq('id', testEmployee.id)
    }
  })

  describe('Schedule Creation', () => {
    it('should create a new schedule', async () => {
      const date = new Date()
      const weekStart = startOfWeek(date)
      
      const scheduleData = {
        employee_id: testEmployee.id,
        shift_id: testShift.id,
        date: format(date, 'yyyy-MM-dd'),
        schedule_status: 'Draft' as const,
        week_start_date: format(weekStart, 'yyyy-MM-dd'),
        day_of_week: format(date, 'EEEE') as any
      }

      const result = await scheduleService.createSchedules(scheduleData)
      testSchedule = Array.isArray(result) ? result[0] : result

      expect(testSchedule).toBeDefined()
      expect(testSchedule.employee_id).toBe(testEmployee.id)
      expect(testSchedule.shift_id).toBe(testShift.id)
    })

    it('should handle bulk schedule creation', async () => {
      const date = new Date()
      const schedules = Array.from({ length: 3 }).map((_, i) => ({
        employee_id: testEmployee.id,
        shift_id: testShift.id,
        date: format(addDays(date, i), 'yyyy-MM-dd'),
        schedule_status: 'Draft' as const,
        week_start_date: format(startOfWeek(date), 'yyyy-MM-dd'),
        day_of_week: format(addDays(date, i), 'EEEE') as any
      }))

      const result = await scheduleService.createSchedules(schedules)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(3)
    })
  })

  describe('Schedule Retrieval', () => {
    it('should fetch schedules with date range filter', async () => {
      const date = new Date()
      const weekStart = format(startOfWeek(date), 'yyyy-MM-dd')
      const weekEnd = format(endOfWeek(date), 'yyyy-MM-dd')

      const schedules = await scheduleService.getSchedules({
        startDate: weekStart,
        endDate: weekEnd
      })

      expect(Array.isArray(schedules)).toBe(true)
      schedules.forEach(schedule => {
        expect(schedule.employees).toBeDefined()
        expect(schedule.shifts).toBeDefined()
      })
    })

    it('should fetch schedule statistics', async () => {
      const date = new Date()
      const monthStart = format(startOfWeek(date), 'yyyy-MM-dd')
      const monthEnd = format(endOfWeek(date), 'yyyy-MM-dd')

      const stats = await scheduleService.getScheduleStats(monthStart, monthEnd)

      expect(stats.totalShifts).toBeDefined()
      expect(stats.totalHours).toBeDefined()
      expect(stats.employeeStats).toBeDefined()
    })
  })

  describe('Schedule Generation', () => {
    it('should generate schedules for a date range', async () => {
      const date = new Date()
      const options = {
        startDate: format(date, 'yyyy-MM-dd'),
        endDate: format(addDays(date, 7), 'yyyy-MM-dd'),
        minimumRestHours: 10,
        maximumConsecutiveDays: 6
      }

      const result = await scheduleService.generateSchedule(options)

      expect(result.success).toBe(true)
      expect(result.assignments).toBeDefined()
      if (result.assignments) {
        expect(Array.isArray(result.assignments)).toBe(true)
      }
    })

    it('should handle schedule generation with employee filters', async () => {
      const date = new Date()
      const options = {
        startDate: format(date, 'yyyy-MM-dd'),
        endDate: format(addDays(date, 7), 'yyyy-MM-dd'),
        includeEmployeeIds: [testEmployee.id],
        minimumRestHours: 10,
        maximumConsecutiveDays: 6
      }

      const result = await scheduleService.generateSchedule(options)

      expect(result.success).toBe(true)
      if (result.assignments) {
        result.assignments.forEach(assignment => {
          expect(assignment.employeeId).toBe(testEmployee.id)
        })
      }
    })
  })

  describe('Schedule Updates', () => {
    it('should update a schedule', async () => {
      const updateData = {
        schedule_status: 'Published' as const
      }

      const updated = await scheduleService.updateSchedule(
        testSchedule.id,
        updateData
      )

      expect(updated.schedule_status).toBe('Published')
    })

    it('should handle bulk schedule updates', async () => {
      const updateData = {
        ids: [testSchedule.id],
        data: {
          schedule_status: 'Draft' as const
        }
      }

      const result = await scheduleService.bulkUpdateSchedules(updateData)
      expect(Array.isArray(result)).toBe(true)
      expect(result[0].schedule_status).toBe('Draft')
    })
  })

  describe('Schedule Deletion', () => {
    it('should delete a schedule', async () => {
      await expect(
        scheduleService.deleteSchedules(testSchedule.id)
      ).resolves.not.toThrow()

      // Verify deletion
      const { data } = await supabase
        .from('schedules')
        .select()
        .eq('id', testSchedule.id)
        .single()

      expect(data).toBeNull()
    })

    it('should handle bulk schedule deletion', async () => {
      // Create test schedules
      const date = new Date()
      const schedules = await scheduleService.createSchedules([
        {
          employee_id: testEmployee.id,
          shift_id: testShift.id,
          date: format(date, 'yyyy-MM-dd'),
          schedule_status: 'Draft',
          week_start_date: format(startOfWeek(date), 'yyyy-MM-dd'),
          day_of_week: format(date, 'EEEE') as any
        },
        {
          employee_id: testEmployee.id,
          shift_id: testShift.id,
          date: format(addDays(date, 1), 'yyyy-MM-dd'),
          schedule_status: 'Draft',
          week_start_date: format(startOfWeek(date), 'yyyy-MM-dd'),
          day_of_week: format(addDays(date, 1), 'EEEE') as any
        }
      ])

      const ids = (schedules as any[]).map(s => s.id)

      await expect(
        scheduleService.deleteSchedules(ids)
      ).resolves.not.toThrow()

      // Verify deletion
      const { data } = await supabase
        .from('schedules')
        .select()
        .in('id', ids)

      expect(data).toHaveLength(0)
    })
  })
}) 