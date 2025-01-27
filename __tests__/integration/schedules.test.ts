import { createClient } from '@supabase/supabase-js'
import { scheduleService } from '@/services/scheduleService'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { mockSupabase } from '../utils/test-utils'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

describe('Schedule Management Integration Tests', () => {
  let testEmployee: any
  let testShift: any
  let testSchedule: any

  const mockShiftType = {
    id: '1',
    name: 'Day Shift',
    start_time: '09:00',
    end_time: '17:00',
    duration_hours: 8,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase.from().select().mockResolvedValueOnce({
      data: [mockShiftType],
      error: null,
    })
  })

  beforeAll(() => {
    // Setup mock responses
    mockSupabase.from().insert.mockResolvedValueOnce({ 
      data: [testEmployee], 
      error: null 
    })
  })

  beforeAll(async () => {
    // Create test data
    const { data: employee } = await mockSupabase
      .from('employees')
      .insert({
        full_name: 'Test Employee',
        employee_pattern: '4x10',
        weekly_hours_scheduled: 40,
        role: 'employee'
      })
      .select()
      .single()

    const { data: shiftType } = await mockSupabase
      .from('shift_types')
      .insert({
        name: 'Test Shift Type',
        description: 'Test shift type for integration tests'
      })
      .select()
      .single()

    const { data: shift } = await mockSupabase
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
      await mockSupabase
        .from('schedules')
        .delete()
        .eq('id', testSchedule.id)
    }

    if (testShift?.id) {
      await mockSupabase
        .from('shifts')
        .delete()
        .eq('id', testShift.id)
    }

    if (testEmployee?.id) {
      await mockSupabase
        .from('employees')
        .delete()
        .eq('id', testEmployee.id)
    }
  })

  describe('Schedule Creation', () => {
    it('should create a new schedule', async () => {
      const newSchedule = {
        employee_id: 'emp1',
        shift_type_id: mockShiftType.id,
        date: '2024-01-01',
        status: 'pending',
      }

      mockSupabase.from().insert().mockResolvedValueOnce({
        data: [{ id: '1', ...newSchedule }],
        error: null,
      })

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.id).toBe('1')
    })

    it('should handle bulk schedule creation', async () => {
      const schedules = [
        {
          employee_id: 'emp1',
          shift_type_id: mockShiftType.id,
          date: '2024-01-01',
          status: 'pending',
        },
        {
          employee_id: 'emp2',
          shift_type_id: mockShiftType.id,
          date: '2024-01-01',
          status: 'pending',
        },
      ]

      mockSupabase.from().insert().mockResolvedValueOnce({
        data: schedules.map((schedule, index) => ({ id: String(index + 1), ...schedule })),
        error: null,
      })

      const response = await fetch('/api/schedules/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules }),
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.length).toBe(2)
    })
  })

  describe('Schedule Retrieval', () => {
    it('should fetch schedules with date range filter', async () => {
      const mockSchedules = [
        {
          id: '1',
          employee_id: 'emp1',
          shift_type_id: mockShiftType.id,
          date: '2024-01-01',
          status: 'approved',
        },
      ]

      mockSupabase.from().select().mockResolvedValueOnce({
        data: mockSchedules,
        error: null,
      })

      const response = await fetch('/api/schedules?start=2024-01-01&end=2024-01-07')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockSchedules)
    })

    it('should fetch schedule statistics', async () => {
      const mockStats = {
        total_hours: 160,
        total_shifts: 20,
        average_hours_per_shift: 8,
      }

      mockSupabase.from().select().mockResolvedValueOnce({
        data: [mockStats],
        error: null,
      })

      const response = await fetch('/api/schedules/stats?month=2024-01')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockStats)
    })
  })

  describe('Schedule Generation', () => {
    it('should generate schedules for a date range', async () => {
      const generatedSchedules = [
        {
          id: '1',
          employee_id: 'emp1',
          shift_type_id: mockShiftType.id,
          date: '2024-01-01',
          status: 'pending',
        },
      ]

      mockSupabase.from().insert().mockResolvedValueOnce({
        data: generatedSchedules,
        error: null,
      })

      const response = await fetch('/api/schedules/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: '2024-01-01',
          end_date: '2024-01-07',
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data).toEqual(generatedSchedules)
    })

    it('should handle schedule generation with employee filters', async () => {
      const generatedSchedules = [
        {
          id: '1',
          employee_id: 'emp1',
          shift_type_id: mockShiftType.id,
          date: '2024-01-01',
          status: 'pending',
        },
      ]

      mockSupabase.from().insert().mockResolvedValueOnce({
        data: generatedSchedules,
        error: null,
      })

      const response = await fetch('/api/schedules/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          employee_ids: ['emp1'],
        }),
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data).toEqual(generatedSchedules)
    })
  })

  describe('Schedule Updates', () => {
    it('should update a schedule', async () => {
      const scheduleId = '1'
      const updates = {
        status: 'approved',
      }

      mockSupabase.from().update().mockResolvedValueOnce({
        data: [{ id: scheduleId, ...updates }],
        error: null,
      })

      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.id).toBe(scheduleId)
      expect(data.status).toBe('approved')
    })

    it('should handle bulk schedule updates', async () => {
      const updates = [
        { id: '1', status: 'approved' },
        { id: '2', status: 'approved' },
      ]

      mockSupabase.from().update().mockResolvedValueOnce({
        data: updates,
        error: null,
      })

      const response = await fetch('/api/schedules/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data).toEqual(updates)
    })
  })

  describe('Schedule Deletion', () => {
    it('should delete a schedule', async () => {
      const scheduleId = '1'

      mockSupabase.from().delete().mockResolvedValueOnce({
        data: [{ id: scheduleId }],
        error: null,
      })

      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.id).toBe(scheduleId)
    })

    it('should handle bulk schedule deletion', async () => {
      const scheduleIds = ['1', '2']

      mockSupabase.from().delete().mockResolvedValueOnce({
        data: scheduleIds.map(id => ({ id })),
        error: null,
      })

      const response = await fetch('/api/schedules/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: scheduleIds }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveLength(2)
    })
  })
}) 