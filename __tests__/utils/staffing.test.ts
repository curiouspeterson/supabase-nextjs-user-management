import { createClient } from '@supabase/supabase-js'
import { getStaffingRequirement, checkStaffingRequirements } from '@/utils/schedule'
import { mockSupabaseClient, mockCreateClient } from '../utils/test-utils'

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}))

const mockedSupabaseClient = jest.mocked(mockSupabaseClient, { shallow: false })

describe('Staffing Requirement Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient()
  })

  describe('getStaffingRequirement', () => {
    it('returns minimum employees for a given time', async () => {
      // Mock the response for staffing requirements
      const mockSelect = jest.fn().mockResolvedValue({
        data: [
          {
            period_name: 'Early Morning',
            start_time: '05:00',
            end_time: '09:00',
            minimum_employees: 6,
            shift_supervisor_required: true
          }
        ],
        error: null
      })

      mockedSupabaseClient.from.mockReturnValue({
        select: mockSelect
      } as any)

      const minRequired = await getStaffingRequirement('07:00')
      expect(minRequired).toBe(6) // Early Morning requirement
    })

    it('returns 0 if no requirement found for time', async () => {
      // Mock empty requirements
      const mockSelect = jest.fn().mockResolvedValue({
        data: [],
        error: null
      })

      mockedSupabaseClient.from.mockReturnValue({
        select: mockSelect
      } as any)

      const minRequired = await getStaffingRequirement('03:00')
      expect(minRequired).toBe(0)
    })

    it('handles database errors', async () => {
      // Mock error response
      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error')
      })

      mockedSupabaseClient.from.mockReturnValue({
        select: mockSelect
      } as any)

      const minRequired = await getStaffingRequirement('07:00')
      expect(minRequired).toBe(0)
    })
  })

  describe('checkStaffingRequirements', () => {
    beforeEach(() => {
      // Mock staffing requirements response
      mockedSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staffing_requirements') {
          return {
            select: jest.fn().mockResolvedValue({
              data: [
                {
                  period_name: 'Early Morning',
                  start_time: '05:00',
                  end_time: '09:00',
                  minimum_employees: 6
                }
              ],
              error: null
            })
          } as any
        }

        // Mock schedules response
        const mockEq2 = jest.fn().mockResolvedValue({
          data: [
            {
              shifts: {
                start_time: '05:00',
                end_time: '09:00'
              }
            },
            {
              shifts: {
                start_time: '05:00',
                end_time: '09:00'
              }
            }
          ],
          error: null
        })

        const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 })
        const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 })

        return {
          select: mockSelect
        } as any
      })
    })

    it('returns true when staffing requirements are met', async () => {
      // Mock staffing requirements response
      mockedSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staffing_requirements') {
          return {
            select: jest.fn().mockResolvedValue({
              data: [
                {
                  period_name: 'Early Morning',
                  start_time: '05:00',
                  end_time: '09:00',
                  minimum_employees: 2 // Changed to 2 to match the number of scheduled employees
                }
              ],
              error: null
            })
          } as any
        }

        // Mock schedules response
        const mockEq2 = jest.fn().mockResolvedValue({
          data: [
            {
              shifts: {
                start_time: '05:00',
                end_time: '09:00'
              }
            },
            {
              shifts: {
                start_time: '05:00',
                end_time: '09:00'
              }
            }
          ],
          error: null
        })

        const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 })
        const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 })

        return {
          select: mockSelect
        } as any
      })

      const date = new Date('2024-03-20')
      const result = await checkStaffingRequirements(date, '07:00')
      expect(result).toBe(true) // 2 employees scheduled, meets minimum requirement
    })

    it('returns false when staffing requirements are not met', async () => {
      // Mock fewer schedules
      mockedSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staffing_requirements') {
          return {
            select: jest.fn().mockResolvedValue({
              data: [
                {
                  period_name: 'Early Morning',
                  start_time: '05:00',
                  end_time: '09:00',
                  minimum_employees: 6
                }
              ],
              error: null
            })
          } as any
        }

        // Mock schedules response with fewer employees
        const mockEq2 = jest.fn().mockResolvedValue({
          data: [
            {
              shifts: {
                start_time: '05:00',
                end_time: '09:00'
              }
            }
          ],
          error: null
        })

        const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 })
        const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 })

        return {
          select: mockSelect
        } as any
      })

      const date = new Date('2024-03-20')
      const result = await checkStaffingRequirements(date, '07:00')
      expect(result).toBe(false) // 1 employee scheduled, need 6
    })

    it('returns false when no schedules found', async () => {
      // Mock no schedules
      mockedSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staffing_requirements') {
          return {
            select: jest.fn().mockResolvedValue({
              data: [
                {
                  period_name: 'Early Morning',
                  start_time: '05:00',
                  end_time: '09:00',
                  minimum_employees: 6
                }
              ],
              error: null
            })
          } as any
        }

        // Mock empty schedules response
        const mockEq2 = jest.fn().mockResolvedValue({
          data: [],
          error: null
        })

        const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 })
        const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 })

        return {
          select: mockSelect
        } as any
      })

      const date = new Date('2024-03-20')
      const result = await checkStaffingRequirements(date, '07:00')
      expect(result).toBe(false)
    })

    it('returns false on database error', async () => {
      // Mock database error for staffing requirements
      mockedSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'staffing_requirements') {
          return {
            select: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error')
            })
          } as any
        }

        // Mock schedules response
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Database error')
              })
            })
          })
        } as any
      })

      const date = new Date('2024-03-20')
      const result = await checkStaffingRequirements(date, '07:00')
      expect(result).toBe(false)
    })
  })
}) 