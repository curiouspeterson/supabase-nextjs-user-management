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
import { mockSupabase } from '../utils/test-utils'

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

describe('Time Off API', () => {
  let mockClient: SupabaseClient

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockSupabaseClient()
  })

  describe('getTimeOffRequests', () => {
    it('fetches time off requests successfully', async () => {
      const mockRequests = [
        {
          id: '1',
          user_id: 'user1',
          start_date: '2024-01-01',
          end_date: '2024-01-05',
          status: 'pending',
          type: 'vacation',
        },
      ]

      mockSupabase.from().select().mockResolvedValueOnce({
        data: mockRequests,
        error: null,
      })

      const response = await fetch('/api/time-off')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockRequests)
    })
  })

  describe('createTimeOffRequest', () => {
    it('creates time off request successfully', async () => {
      const newRequest = {
        user_id: 'user1',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        type: 'vacation',
      }

      mockSupabase.from().insert().mockResolvedValueOnce({
        data: [{ id: '1', ...newRequest, status: 'pending' }],
        error: null,
      })

      const response = await fetch('/api/time-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      })

      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('1')
      expect(data.status).toBe('pending')
    })
  })

  describe('updateTimeOffRequest', () => {
    it('updates time off request successfully', async () => {
      const requestId = '1'
      const updates = {
        status: 'approved',
      }

      mockSupabase.from().update().mockResolvedValueOnce({
        data: [{ id: requestId, ...updates }],
        error: null,
      })

      const response = await fetch(`/api/time-off/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe(requestId)
      expect(data.status).toBe('approved')
    })
  })

  describe('Error Handling', () => {
    it('handles validation errors', async () => {
      const invalidRequest = {
        user_id: 'user1',
        // Missing required fields
      }

      const response = await fetch('/api/time-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBeTruthy()
    })

    it('handles database errors', async () => {
      mockSupabase.from().select().mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      })

      const response = await fetch('/api/time-off')
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Database error')
    })

    it('handles network errors', async () => {
      mockSupabase.from().select().mockRejectedValueOnce(new Error('Network error'))

      const response = await fetch('/api/time-off')
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('Business Logic', () => {
    it('handles invalid date ranges', async () => {
      const invalidRequest = {
        user_id: 'user1',
        start_date: '2024-01-05',
        end_date: '2024-01-01', // End date before start date
        type: 'vacation',
      }

      const response = await fetch('/api/time-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRequest),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid date range')
    })

    it('handles overlapping time off requests', async () => {
      const existingRequest = {
        id: '1',
        user_id: 'user1',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        status: 'approved',
      }

      mockSupabase.from().select().mockResolvedValueOnce({
        data: [existingRequest],
        error: null,
      })

      const overlappingRequest = {
        user_id: 'user1',
        start_date: '2024-01-03',
        end_date: '2024-01-07',
        type: 'vacation',
      }

      const response = await fetch('/api/time-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overlappingRequest),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Overlapping time off request')
    })
  })
}) 