import { createClient } from '@/utils/supabase/client'
import {
  getTimeOffRequests,
  createTimeOffRequest,
  updateTimeOffRequest,
} from '@/lib/api/time-off'
import { TimeOffType, TimeOffRequestInsert, TimeOffRequestUpdate } from '@/lib/types/time-off'

// Mock Supabase client
jest.mock('@/utils/supabase/client')

describe('Time Off API', () => {
  const mockTimeOffRequests = [
    {
      id: '1',
      employee_id: 'emp1',
      type: TimeOffType.VACATION,
      status: 'Pending' as const,
      start_date: '2024-03-15',
      end_date: '2024-03-20',
      notes: 'Spring break',
      submitted_at: '2024-03-01T00:00:00Z',
      employee: {
        id: 'emp1',
        name: 'Employee One'
      },
      reviewer: null
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTimeOffRequests', () => {
    it('fetches time off requests successfully', async () => {
      // Mock successful response
      ;(createClient as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockTimeOffRequests, error: null }))
          }))
        }))
      }))

      const result = await getTimeOffRequests()

      expect(result.data).toEqual(mockTimeOffRequests)
      expect(result.error).toBeNull()

      // Verify Supabase client calls
      const mockSupabase = createClient()
      expect(mockSupabase.from).toHaveBeenCalledWith('time_off_requests')
      expect(mockSupabase.from().select).toHaveBeenCalledWith(
        `
        *,
        employee:employee_id (
          id,
          name
        ),
        reviewer:reviewed_by (
          id,
          name
        )
        `
      )
      expect(mockSupabase.from().select().order).toHaveBeenCalledWith('submitted_at', { ascending: false })
    })

    it('handles fetch error gracefully', async () => {
      // Mock error response
      const mockError = new Error('Failed to fetch')
      ;(createClient as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: null, error: mockError }))
          }))
        }))
      }))

      const result = await getTimeOffRequests()

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError)
    })
  })

  describe('createTimeOffRequest', () => {
    const mockRequest: TimeOffRequestInsert = {
      employee_id: 'emp1',
      type: TimeOffType.VACATION,
      start_date: '2024-03-15',
      end_date: '2024-03-20',
      notes: 'Spring break',
      status: 'Pending',
      submitted_at: '2024-03-01T00:00:00Z'
    }

    it('creates time off request successfully', async () => {
      // Mock successful response
      ;(createClient as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          insert: jest.fn(() => Promise.resolve({ data: [mockRequest], error: null }))
        }))
      }))

      const result = await createTimeOffRequest(mockRequest)

      expect(result.data).toEqual([mockRequest])
      expect(result.error).toBeNull()

      // Verify Supabase client calls
      const mockSupabase = createClient()
      expect(mockSupabase.from).toHaveBeenCalledWith('time_off_requests')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(mockRequest)
    })

    it('handles creation error gracefully', async () => {
      // Mock error response
      const mockError = new Error('Failed to create')
      ;(createClient as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          insert: jest.fn(() => Promise.resolve({ data: null, error: mockError }))
        }))
      }))

      const result = await createTimeOffRequest(mockRequest)

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError)
    })
  })

  describe('updateTimeOffRequest', () => {
    const mockUpdate: TimeOffRequestUpdate = {
      status: 'Approved',
      reviewed_by: 'mgr1',
      reviewed_at: '2024-03-02T00:00:00Z'
    }

    it('updates time off request successfully', async () => {
      // Mock successful response
      ;(createClient as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [mockUpdate], error: null }))
          }))
        }))
      }))

      const result = await updateTimeOffRequest('1', mockUpdate)

      expect(result.data).toEqual([mockUpdate])
      expect(result.error).toBeNull()

      // Verify Supabase client calls
      const mockSupabase = createClient()
      expect(mockSupabase.from).toHaveBeenCalledWith('time_off_requests')
      expect(mockSupabase.from().update).toHaveBeenCalledWith(mockUpdate)
      expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', '1')
    })

    it('handles update error gracefully', async () => {
      // Mock error response
      const mockError = new Error('Failed to update')
      ;(createClient as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: null, error: mockError }))
          }))
        }))
      }))

      const result = await updateTimeOffRequest('1', mockUpdate)

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError)
    })
  })

  describe('API Error Handling', () => {
    it('handles network errors', async () => {
      // Mock network error
      ;(createClient as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.reject(new Error('Network error')))
          }))
        }))
      }))

      await expect(getTimeOffRequests()).rejects.toThrow('Network error')
    })

    it('handles invalid input data', async () => {
      // Mock validation error
      const mockError = new Error('Invalid input data')
      ;(createClient as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          insert: jest.fn(() => Promise.resolve({ data: null, error: mockError }))
        }))
      }))

      const invalidRequest = {} as TimeOffRequestInsert
      const result = await createTimeOffRequest(invalidRequest)

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toBe('Invalid input data')
    })

    it('handles unauthorized access', async () => {
      // Mock unauthorized error
      const mockError = new Error('Unauthorized')
      ;(createClient as jest.Mock).mockImplementation(() => ({
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: null, error: mockError }))
          }))
        }))
      }))

      const result = await updateTimeOffRequest('1', { status: 'Approved' } as TimeOffRequestUpdate)

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toBe('Unauthorized')
    })
  })
}) 