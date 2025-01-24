import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { POST, PATCH } from '@/app/api/schedules/route'

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

describe('Schedule API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/schedules', () => {
    it('creates a new schedule', async () => {
      const request = new Request('http://localhost:3000/api/schedules', {
        method: 'POST',
        body: JSON.stringify({
          week_start_date: '2024-03-18',
          day_of_week: 'Monday',
          shift_id: '456',
          employee_id: '789'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
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
      })
    })

    it('validates required fields', async () => {
      const request = new Request('http://localhost:3000/api/schedules', {
        method: 'POST',
        body: JSON.stringify({
          week_start_date: '2024-03-18'
          // Missing required fields
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('handles database errors', async () => {
      // Mock database error
      ;(createRouteHandlerClient as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => Promise.resolve({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      }))

      const request = new Request('http://localhost:3000/api/schedules', {
        method: 'POST',
        body: JSON.stringify({
          week_start_date: '2024-03-18',
          day_of_week: 'Monday',
          shift_id: '456',
          employee_id: '789'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database error')
    })
  })

  describe('PATCH /api/schedules', () => {
    it('updates an existing schedule', async () => {
      const url = new URL('http://localhost:3000/api/schedules?id=123')
      const request = new Request(url, {
        method: 'PATCH',
        body: JSON.stringify({
          shift_id: '456'
        })
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
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
      })
    })

    it('requires schedule ID', async () => {
      const url = new URL('http://localhost:3000/api/schedules')
      const request = new Request(url, {
        method: 'PATCH',
        body: JSON.stringify({
          shift_id: '456'
        })
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Schedule ID is required')
    })

    it('handles database errors', async () => {
      // Mock database error
      ;(createRouteHandlerClient as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => Promise.resolve({
                data: null,
                error: new Error('Database error')
              }))
            }))
          }))
        }))
      }))

      const url = new URL('http://localhost:3000/api/schedules?id=123')
      const request = new Request(url, {
        method: 'PATCH',
        body: JSON.stringify({
          shift_id: '456'
        })
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database error')
    })
  })
}) 