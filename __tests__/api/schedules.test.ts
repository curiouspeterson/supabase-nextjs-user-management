import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { POST, PATCH } from '@/app/api/schedules/route'
import { createMockRequest, createMockResponse } from '../utils/test-utils'
import { faker } from '@faker-js/faker'

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({
          data: {
            id: '123',
            week_start_date: '2024-03-18',
            day_of_week: 'Monday',
            shift_id: '456',
            employee_id: '789',
            shifts: {
              start_time: '05:00',
              end_time: '09:00'
            },
            employees: {
              id: '789',
              full_name: 'Test Employee'
            }
          },
          error: null
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({
            data: {
              id: '123',
              week_start_date: '2024-03-18',
              day_of_week: 'Monday',
              shift_id: '456',
              employee_id: '789',
              shifts: {
                start_time: '05:00',
                end_time: '09:00'
              },
              employees: {
                id: '789',
                full_name: 'Test Employee'
              }
            },
            error: null
          }))
        }))
      }))
    }))
  }))
}))

describe('Schedules API', () => {
  const mockSchedule = {
    id: faker.string.uuid(),
    week_start_date: '2024-03-18',
    day_of_week: 1,
    shift_id: faker.string.uuid(),
    employee_id: faker.string.uuid(),
    schedule_status: 'pending'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/schedules', () => {
    it('should return a list of schedules', async () => {
      const response = await fetch('/api/schedules')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data[0]).toHaveProperty('shifts')
      expect(data[0]).toHaveProperty('employees')
    })

    it('should filter schedules by week start', async () => {
      const weekStart = '2024-03-18'
      const response = await fetch(`/api/schedules?week_start=${weekStart}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      data.forEach((schedule: any) => {
        expect(schedule.week_start_date).toBe(weekStart)
      })
    })

    it('should filter schedules by employee', async () => {
      const employeeId = faker.string.uuid()
      const response = await fetch(`/api/schedules?employee_id=${employeeId}`)
      const data = await response.json()

      expect(response.status).toBe(200)
      data.forEach((schedule: any) => {
        expect(schedule.employee_id).toBe(employeeId)
      })
    })

    it('should filter schedules by status', async () => {
      const status = 'pending'
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
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSchedule),
      })
      
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('week_start_date', mockSchedule.week_start_date)
      expect(data).toHaveProperty('day_of_week', mockSchedule.day_of_week)
      expect(data).toHaveProperty('shift_id', mockSchedule.shift_id)
      expect(data).toHaveProperty('employee_id', mockSchedule.employee_id)
      expect(data).toHaveProperty('shifts')
      expect(data).toHaveProperty('employees')
    })

    it('should validate required fields', async () => {
      const invalidSchedule = {
        week_start_date: '2024-03-18',
        // Missing required fields
      }

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidSchedule),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Missing required fields')
    })
  })

  describe('PATCH /api/schedules', () => {
    it('should update an existing schedule', async () => {
      const updateData = {
        schedule_status: 'approved'
      }

      const response = await fetch(`/api/schedules?id=${mockSchedule.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('id', mockSchedule.id)
      expect(data).toHaveProperty('schedule_status', 'approved')
    })

    it('should require schedule ID', async () => {
      const response = await fetch('/api/schedules', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule_status: 'approved' }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Schedule ID is required')
    })
  })

  describe('DELETE /api/schedules', () => {
    it('should delete a schedule', async () => {
      const response = await fetch(`/api/schedules?id=${mockSchedule.id}`, {
        method: 'DELETE',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('success', true)
    })

    it('should require schedule ID', async () => {
      const response = await fetch('/api/schedules', {
        method: 'DELETE',
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error', 'Schedule ID is required')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error by using an invalid UUID
      const response = await fetch('/api/schedules?id=invalid-uuid', {
        method: 'DELETE',
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    it('should handle invalid date formats', async () => {
      const response = await fetch('/api/schedules?week_start=invalid-date')
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })
  })
}) 