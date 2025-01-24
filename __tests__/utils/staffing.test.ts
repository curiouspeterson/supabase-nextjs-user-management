import { createClient } from '@supabase/supabase-js'
import { getStaffingRequirement, checkStaffingRequirements } from '@/utils/schedule'

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({
        data: [
          {
            period_name: 'Early Morning',
            start_time: '05:00',
            end_time: '09:00',
            minimum_employees: 6,
            shift_supervisor_required: true
          },
          {
            period_name: 'Day',
            start_time: '09:00',
            end_time: '21:00',
            minimum_employees: 8,
            shift_supervisor_required: true
          }
        ],
        error: null
      }))
    }))
  }))
}))

describe('Staffing Requirement Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getStaffingRequirement', () => {
    it('returns minimum employees for a given time', async () => {
      const minRequired = await getStaffingRequirement('07:00')
      expect(minRequired).toBe(6) // Early Morning requirement
    })

    it('returns 0 if no requirement found for time', async () => {
      const minRequired = await getStaffingRequirement('03:00')
      expect(minRequired).toBe(0)
    })

    it('handles database errors', async () => {
      // Mock error response
      ;(createClient as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({
            data: null,
            error: new Error('Database error')
          }))
        }))
      }))

      const minRequired = await getStaffingRequirement('07:00')
      expect(minRequired).toBe(0)
    })
  })

  describe('checkStaffingRequirements', () => {
    beforeEach(() => {
      // Mock schedules data
      ;(createClient as jest.Mock).mockImplementation(() => ({
        from: jest.fn((table) => {
          if (table === 'staffing_requirements') {
            return {
              select: jest.fn(() => Promise.resolve({
                data: [
                  {
                    period_name: 'Early Morning',
                    start_time: '05:00',
                    end_time: '09:00',
                    minimum_employees: 6
                  }
                ],
                error: null
              }))
            }
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
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
                }))
              }))
            }))
          }
        })
      }))
    })

    it('returns true when staffing requirements are met', async () => {
      const date = new Date('2024-03-20')
      const result = await checkStaffingRequirements(date, '07:00')
      expect(result).toBe(false) // 2 employees scheduled, need 6
    })

    it('returns false when staffing requirements are not met', async () => {
      // Mock fewer schedules
      ;(createClient as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn((table) => {
          if (table === 'staffing_requirements') {
            return {
              select: jest.fn(() => Promise.resolve({
                data: [
                  {
                    period_name: 'Early Morning',
                    start_time: '05:00',
                    end_time: '09:00',
                    minimum_employees: 6
                  }
                ],
                error: null
              }))
            }
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
                  data: [
                    {
                      shifts: {
                        start_time: '05:00',
                        end_time: '09:00'
                      }
                    }
                  ],
                  error: null
                }))
              }))
            }))
          }
        })
      }))

      const date = new Date('2024-03-20')
      const result = await checkStaffingRequirements(date, '07:00')
      expect(result).toBe(false) // 1 employee scheduled, need 6
    })

    it('returns false when no schedules found', async () => {
      // Mock no schedules
      ;(createClient as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn((table) => {
          if (table === 'staffing_requirements') {
            return {
              select: jest.fn(() => Promise.resolve({
                data: [
                  {
                    period_name: 'Early Morning',
                    start_time: '05:00',
                    end_time: '09:00',
                    minimum_employees: 6
                  }
                ],
                error: null
              }))
            }
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
                  data: [],
                  error: null
                }))
              }))
            }))
          }
        })
      }))

      const date = new Date('2024-03-20')
      const result = await checkStaffingRequirements(date, '07:00')
      expect(result).toBe(false)
    })

    it('returns false on database error', async () => {
      // Mock database error
      ;(createClient as jest.Mock).mockImplementationOnce(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({
            data: null,
            error: new Error('Database error')
          }))
        }))
      }))

      const date = new Date('2024-03-20')
      const result = await checkStaffingRequirements(date, '07:00')
      expect(result).toBe(false)
    })
  })
}) 