import { test as setup, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

setup('create test users and data', async () => {
  // Create test users
  const users = [
    {
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      full_name: 'Test Admin'
    },
    {
      email: 'manager@example.com',
      password: 'password123',
      role: 'manager',
      full_name: 'Test Manager'
    },
    {
      email: 'employee@example.com',
      password: 'password123',
      role: 'employee',
      full_name: 'Test Employee'
    }
  ]

  for (const user of users) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      continue
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: user.role,
        full_name: user.full_name
      })
      .eq('id', authData.user!.id)

    if (profileError) {
      console.error('Error creating profile:', profileError)
    }
  }

  // Create shift types
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

  const { data: createdShiftTypes, error: shiftTypeError } = await supabase
    .from('shift_types')
    .insert(shiftTypes)
    .select()

  if (shiftTypeError) {
    console.error('Error creating shift types:', shiftTypeError)
    return
  }

  // Create shifts
  const shifts = [
    {
      shift_type_id: createdShiftTypes[0].id,
      start_time: '05:00',
      end_time: '15:00',
      duration_hours: 10,
      duration_category: '10 hours'
    },
    {
      shift_type_id: createdShiftTypes[1].id,
      start_time: '09:00',
      end_time: '19:00',
      duration_hours: 10,
      duration_category: '10 hours'
    },
    {
      shift_type_id: createdShiftTypes[2].id,
      start_time: '15:00',
      end_time: '01:00',
      duration_hours: 10,
      duration_category: '10 hours'
    },
    {
      shift_type_id: createdShiftTypes[3].id,
      start_time: '21:00',
      end_time: '07:00',
      duration_hours: 10,
      duration_category: '10 hours'
    }
  ]

  const { error: shiftError } = await supabase
    .from('shifts')
    .insert(shifts)

  if (shiftError) {
    console.error('Error creating shifts:', shiftError)
  }

  // Create staffing requirements
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

  const { error: requirementError } = await supabase
    .from('staffing_requirements')
    .insert(staffingRequirements)

  if (requirementError) {
    console.error('Error creating staffing requirements:', requirementError)
  }
})

setup('clean up test data after all tests', async () => {
  // Delete test data in reverse order of creation
  const tables = [
    'schedules',
    'staffing_requirements',
    'shifts',
    'shift_types',
    'profiles'
  ]

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '')

    if (error) {
      console.error(`Error cleaning up ${table}:`, error)
    }
  }

  // Delete test users
  const testEmails = [
    'admin@example.com',
    'manager@example.com',
    'employee@example.com'
  ]

  for (const email of testEmails) {
    const { data: user } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()

    if (user) {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) {
        console.error(`Error deleting user ${email}:`, error)
      }
    }
  }
}) 