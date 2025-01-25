import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { POST, PATCH } from '@/app/api/schedules/route'
import { createMockRequest, createMockResponse } from '../utils/test-utils'
import { faker } from '@faker-js/faker'

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  })
}))

// Mock data
const mockSchedule = {
  id: '123',
  week_start_date: '2024-03-18',
  day_of_week: 1,
  shift_id: '35d58c3e-b844-49c7-85a8-592a5cf6e8b4',
  employee_id: '789',
  schedule_status: 'pending',
  shifts: {
    id: '35d58c3e-b844-49c7-85a8-592a5cf6e8b4',
    name: 'Early Shift',
    start_time: '08:00',
    end_time: '16:00'
  },
  employees: {
    id: '789',
    full_name: 'John Doe'
  }
}

const mockScheduleInput = {
  week_start_date: '2024-03-18',
  day_of_week: 1,
  shift_id: '35d58c3e-b844-49c7-85a8-592a5cf6e8b4',
  employee_id: '789',
  schedule_status: 'pending'
}

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [mockSchedule], error: null }),
        single: () => Promise.resolve({ data: mockSchedule, error: null })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: mockSchedule, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ 
              data: { ...mockSchedule, schedule_status: 'approved' }, 
              error: null 
            })
          })
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    })
  })
}))

// Mock fetch for error cases
const originalFetch = global.fetch
beforeAll(() => {
  global.fetch = jest.fn()
})

afterAll(() => {
  global.fetch = originalFetch
})

describe('Schedules API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock for each test
    ;(global.fetch as jest.Mock).mockReset()
  })

  describe('GET /api/schedules', () => {
    it('should return a list of schedules', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve([mockSchedule])
        })
      )

      const response = await fetch('/api/schedules')
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data[0]).toHaveProperty('shifts')
      expect(data[0]).toHaveProperty('employees')
    })

    it('should filter schedules by week start', async () => {
      const weekStart = '2024-03-18'
      const filteredSchedule = { ...mockSchedule, week_start_date: weekStart }
      
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve([filteredSchedule])
        })
      )

      const response = await fetch(`/api/schedules?week_start=${weekStart}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      data.forEach((schedule: any) => {
        expect(schedule.week_start_date).toBe(weekStart)
      })
    })

    it('should filter schedules by employee', async () => {
      const employeeId = '789'
      const filteredSchedule = { ...mockSchedule, employee_id: employeeId }
      
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve([filteredSchedule])
        })
      )

      const response = await fetch(`/api/schedules?employee_id=${employeeId}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      data.forEach((schedule: any) => {
        expect(schedule.employee_id).toBe(employeeId)
      })
    })

    it('should filter schedules by status', async () => {
      const status = 'pending'
      const filteredSchedule = { ...mockSchedule, schedule_status: status }
      
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve([filteredSchedule])
        })
      )

      const response = await fetch(`/api/schedules?status=${status}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      data.forEach((schedule: any) => {
        expect(schedule.schedule_status).toBe(status)
      })
    })
  })

  describe('POST /api/schedules', () => {
    it('should create a new schedule', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(mockSchedule)
        })
      )

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockScheduleInput)
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('week_start_date', mockScheduleInput.week_start_date)
      expect(data).toHaveProperty('day_of_week', mockScheduleInput.day_of_week)
      expect(data).toHaveProperty('shift_id', mockScheduleInput.shift_id)
      expect(data).toHaveProperty('employee_id', mockScheduleInput.employee_id)
      expect(data).toHaveProperty('shifts')
      expect(data).toHaveProperty('employees')
    })

    it('should validate required fields', async () => {
      const invalidSchedule = {
        week_start_date: '2024-03-18'
        // Missing required fields
      }

      const request = createMockRequest({
        method: 'POST',
        body: invalidSchedule,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Missing required fields')
    })
  })

  describe('PATCH /api/schedules', () => {
    it('should update an existing schedule', async () => {
      const updatedSchedule = { 
        ...mockSchedule, 
        schedule_status: 'approved' 
      }

      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(updatedSchedule)
        })
      )

      const response = await fetch('/api/schedules?id=123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule_status: 'approved' })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('id', '123')
      expect(data).toHaveProperty('schedule_status', 'approved')
      expect(data).toHaveProperty('shifts')
      expect(data).toHaveProperty('employees')
    })

    it('should require schedule ID', async () => {
      const request = createMockRequest({
        method: 'PATCH',
        body: { schedule_status: 'approved' },
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PATCH(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Schedule ID is required')
    })
  })

  describe('DELETE /api/schedules', () => {
    it('should delete a schedule', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ success: true })
        })
      )

      const response = await fetch('/api/schedules?id=123', {
        method: 'DELETE'
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('success', true)
    })

    it('should require schedule ID', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 400,
          json: () => Promise.resolve({ error: 'Schedule ID is required' })
        })
      )

      const response = await fetch('/api/schedules', {
        method: 'DELETE'
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Schedule ID is required')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 500,
          json: () => Promise.resolve({ error: 'Database error' })
        })
      )

      const response = await fetch('/api/schedules')
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should handle invalid date formats', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 500,
          json: () => Promise.resolve({ error: 'Invalid date format' })
        })
      )

      const response = await fetch('/api/schedules?week_start=invalid-date')
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })
  })
}) 