import { createClient } from '@supabase/supabase-js'
import { format } from 'date-fns'

// Set up environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client for test setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Increase test timeout for integration tests
jest.setTimeout(30000)

// Global setup function
export async function setup() {
  // Create test data that will be used across multiple test files
  await createTestData()
}

// Global teardown function
export async function teardown() {
  // Clean up test data
  await cleanupTestData()
}

// Helper function to create test data
async function createTestData() {
  try {
    // Create test shift types
    const shiftTypes = [
      {
        name: 'Day Shift Early',
        description: 'Early morning shift'
      },
      {
        name: 'Day Shift',
        description: 'Regular day shift'
      },
      {
        name: 'Swing Shift',
        description: 'Afternoon to evening shift'
      },
      {
        name: 'Graveyard',
        description: 'Overnight shift'
      }
    ]

    const { data: createdShiftTypes } = await supabase
      .from('shift_types')
      .insert(shiftTypes)
      .select()

    // Create test shifts
    const shifts = [
      {
        shift_type_id: createdShiftTypes![0].id,
        start_time: '05:00',
        end_time: '15:00',
        duration_hours: 10,
        duration_category: '10 hours'
      },
      {
        shift_type_id: createdShiftTypes![1].id,
        start_time: '09:00',
        end_time: '19:00',
        duration_hours: 10,
        duration_category: '10 hours'
      },
      {
        shift_type_id: createdShiftTypes![2].id,
        start_time: '15:00',
        end_time: '01:00',
        duration_hours: 10,
        duration_category: '10 hours'
      },
      {
        shift_type_id: createdShiftTypes![3].id,
        start_time: '21:00',
        end_time: '07:00',
        duration_hours: 10,
        duration_category: '10 hours'
      }
    ]

    await supabase.from('shifts').insert(shifts)

    // Create test employees
    const employees = [
      {
        full_name: 'Test Admin',
        employee_pattern: '4x10',
        weekly_hours_scheduled: 40,
        role: 'admin',
        default_shift_type_id: createdShiftTypes![0].id
      },
      {
        full_name: 'Test Manager',
        employee_pattern: '4x10',
        weekly_hours_scheduled: 40,
        role: 'manager',
        default_shift_type_id: createdShiftTypes![1].id
      },
      {
        full_name: 'Test Employee 1',
        employee_pattern: '4x10',
        weekly_hours_scheduled: 40,
        role: 'employee',
        default_shift_type_id: createdShiftTypes![2].id
      },
      {
        full_name: 'Test Employee 2',
        employee_pattern: '3x12_1x4',
        weekly_hours_scheduled: 40,
        role: 'employee',
        default_shift_type_id: createdShiftTypes![3].id
      }
    ]

    await supabase.from('employees').insert(employees)

    // Create test staffing requirements
    const staffingRequirements = [
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
      },
      {
        period_name: 'Evening',
        start_time: '21:00',
        end_time: '01:00',
        minimum_employees: 7,
        shift_supervisor_required: true
      },
      {
        period_name: 'Night',
        start_time: '01:00',
        end_time: '05:00',
        minimum_employees: 6,
        shift_supervisor_required: true
      }
    ]

    await supabase.from('staffing_requirements').insert(staffingRequirements)
  } catch (error) {
    console.error('Error creating test data:', error)
    throw error
  }
}

// Helper function to clean up test data
async function cleanupTestData() {
  try {
    // Delete test data in reverse order of creation to handle foreign key constraints
    await supabase.from('schedules').delete().neq('id', '')
    await supabase.from('staffing_requirements').delete().neq('id', '')
    await supabase.from('employees').delete().neq('id', '')
    await supabase.from('shifts').delete().neq('id', '')
    await supabase.from('shift_types').delete().neq('id', '')
  } catch (error) {
    console.error('Error cleaning up test data:', error)
    throw error
  }
}

// Mock functions that might be needed in tests
global.fetch = jest.fn()
global.console.error = jest.fn()

// Reset mocks before each test
beforeEach(() => {
  jest.resetAllMocks()
}) 