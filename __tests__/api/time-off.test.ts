import { createTestRequest, createMockSupabaseClient } from '../utils/test-utils'
import {
  getTimeOffRequests,
  createTimeOffRequest,
  updateTimeOffRequest
} from '@/lib/api/time-off'
import { TimeOffRequest, TimeOffRequestUpdate } from '@/lib/types/time-off'
import { PostgrestQueryBuilder } from '@supabase/postgrest-js'
import { handleTimeOffRequest } from '@/app/api/time-off/route'
import { createClient } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

describe('Time Off API', () => {
  let mockClient: SupabaseClient

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockSupabaseClient()
    ;(createClient as jest.Mock).mockReturnValue(mockClient)
  })

  describe('getTimeOffRequests', () => {
    it('fetches time off requests successfully', async () => {
      const mockRequests = [
        {
          id: '1',
          employee_id: 'emp123',
          start_date: '2024-02-01',
          end_date: '2024-02-02',
          type: 'Vacation',
          status: 'Pending',
          notes: null,
          submitted_at: '2024-01-25T00:00:00Z',
          reviewed_by: null,
          reviewed_at: null,
          created_at: '2024-01-25T00:00:00Z',
          updated_at: '2024-01-25T00:00:00Z'
        }
      ]

      const selectMock = jest.fn().mockResolvedValue({ data: mockRequests, error: null })
      jest.spyOn(mockClient, 'from').mockReturnValue({
        select: selectMock
      } as unknown as PostgrestQueryBuilder<any, any, any>)

      const result = await getTimeOffRequests()

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockRequests)
      expect(mockClient.from).toHaveBeenCalledWith('time_off_requests')
      expect(selectMock).toHaveBeenCalled()
    })
  })

  describe('createTimeOffRequest', () => {
    it('creates time off request successfully', async () => {
      const mockRequest: TimeOffRequest = {
        id: '1',
        employee_id: 'emp123',
        start_date: '2024-02-01',
        end_date: '2024-02-02',
        type: 'Vacation',
        status: 'Pending',
        notes: null,
        submitted_at: '2024-01-25T00:00:00Z',
        reviewed_by: null,
        reviewed_at: null,
        created_at: '2024-01-25T00:00:00Z',
        updated_at: '2024-01-25T00:00:00Z'
      }

      const insertMock = jest.fn().mockResolvedValue({ data: [mockRequest], error: null })
      jest.spyOn(mockClient, 'from').mockReturnValue({
        insert: insertMock
      } as unknown as PostgrestQueryBuilder<any, any, any>)

      const result = await createTimeOffRequest(mockRequest)

      expect(result.error).toBeNull()
      expect(result.data).toEqual([mockRequest])
      expect(mockClient.from).toHaveBeenCalledWith('time_off_requests')
      expect(insertMock).toHaveBeenCalledWith(mockRequest)
    })
  })

  describe('updateTimeOffRequest', () => {
    it('updates time off request successfully', async () => {
      const mockUpdate: TimeOffRequestUpdate = {
        status: 'Approved',
        reviewed_by: 'mgr123',
        reviewed_at: '2024-01-25T00:00:00Z'
      }

      const eqMock = jest.fn().mockResolvedValue({ data: [{ id: '1', ...mockUpdate }], error: null })
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock })
      jest.spyOn(mockClient, 'from').mockReturnValue({
        update: updateMock
      } as unknown as PostgrestQueryBuilder<any, any, any>)

      const result = await updateTimeOffRequest('1', mockUpdate)

      expect(result.error).toBeNull()
      expect(result.data).toEqual([{ id: '1', ...mockUpdate }])
      expect(mockClient.from).toHaveBeenCalledWith('time_off_requests')
      expect(updateMock).toHaveBeenCalledWith(mockUpdate)
      expect(eqMock).toHaveBeenCalledWith('id', '1')
    })
  })

  it('handles successful time off request', async () => {
    // Mock successful insert
    const mockData = { id: 1 }
    jest.spyOn(mockClient, 'from').mockReturnValue({
      insert: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    } as any)

    const request = createTestRequest('/api/time-off', {
      method: 'POST',
      body: JSON.stringify({
        userId: '123',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        reason: 'Vacation',
      }),
    })

    const response = await handleTimeOffRequest(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toEqual({
      success: true,
      data: mockData,
    })
  })

  it('handles validation errors', async () => {
    const request = createTestRequest('/api/time-off', {
      method: 'POST',
      body: JSON.stringify({
        userId: '123',
        // Missing required fields
      }),
    })

    const response = await handleTimeOffRequest(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toEqual({
      success: false,
      error: expect.any(String),
    })
  })

  it('handles database errors', async () => {
    // Mock database error
    jest.spyOn(mockClient, 'from').mockReturnValue({
      insert: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
      }),
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    } as any)

    const request = createTestRequest('/api/time-off', {
      method: 'POST',
      body: JSON.stringify({
        userId: '123',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        reason: 'Vacation',
      }),
    })

    const response = await handleTimeOffRequest(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data).toEqual({
      success: false,
      error: expect.any(String),
    })
  })

  it('handles network errors', async () => {
    // Mock network error
    jest.spyOn(mockClient, 'from').mockReturnValue({
      insert: jest.fn().mockReturnValue({
        single: jest.fn().mockRejectedValue(new Error('Network error')),
      }),
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    } as any)

    const request = createTestRequest('/api/time-off', {
      method: 'POST',
      body: JSON.stringify({
        userId: '123',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        reason: 'Vacation',
      }),
    })

    const response = await handleTimeOffRequest(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data).toEqual({
      success: false,
      error: expect.any(String),
    })
  })

  it('handles invalid date ranges', async () => {
    const request = createTestRequest('/api/time-off', {
      method: 'POST',
      body: JSON.stringify({
        userId: '123',
        startDate: '2024-02-05',
        endDate: '2024-02-01', // End date before start date
        reason: 'Vacation',
      }),
    })

    const response = await handleTimeOffRequest(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toEqual({
      success: false,
      error: expect.any(String),
    })
  })

  it('handles overlapping time off requests', async () => {
    // Mock existing time off request
    jest.spyOn(mockClient, 'from').mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{
          id: 1,
          startDate: '2024-02-01',
          endDate: '2024-02-10',
        }],
        error: null,
      }),
      eq: jest.fn().mockReturnThis(),
    } as any)

    const request = createTestRequest('/api/time-off', {
      method: 'POST',
      body: JSON.stringify({
        userId: '123',
        startDate: '2024-02-05',
        endDate: '2024-02-15',
        reason: 'Vacation',
      }),
    })

    const response = await handleTimeOffRequest(request)
    expect(response.status).toBe(409)

    const data = await response.json()
    expect(data).toEqual({
      success: false,
      error: expect.any(String),
    })
  })
}) 