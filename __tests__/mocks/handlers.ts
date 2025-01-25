import { http, HttpResponse } from 'msw'
import { createTestUser, createTestEmployee, createTestShift } from '../utils/test-utils'

interface CreateEmployeeInput {
  email: string
  full_name: string
  employee_role: 'Dispatcher' | 'Shift Supervisor' | 'Management'
  user_role: 'Employee' | 'Manager' | 'Admin'
  weekly_hours_scheduled: number
  default_shift_type_id: string
}

interface CreateScheduleInput {
  week_start_date: string
  day_of_week: number
  shift_id: string
  employee_id: string
  schedule_status?: string
}

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/signup', () => {
    return HttpResponse.json({
      user: createTestUser(),
      session: { access_token: 'mock-token' },
    }, { status: 200 })
  }),

  http.post('/api/auth/signin', () => {
    return HttpResponse.json({
      user: createTestUser(),
      session: { access_token: 'mock-token' },
    }, { status: 200 })
  }),

  // Employee endpoints
  http.get('/api/employees', () => {
    return HttpResponse.json({
      employees: Array(3).fill(null).map(createTestEmployee),
    }, { status: 200 })
  }),

  http.post('/api/employees', async ({ request }) => {
    const data = await request.json() as CreateEmployeeInput
    
    // Simulate validation errors
    if (!data.email || !data.full_name || !data.employee_role || !data.user_role || !data.weekly_hours_scheduled || !data.default_shift_type_id) {
      return HttpResponse.json(
        { error: 'Missing required fields', details: 'All fields are required' },
        { status: 400 }
      )
    }

    if (typeof data.weekly_hours_scheduled !== 'number' || data.weekly_hours_scheduled < 0) {
      return HttpResponse.json(
        { error: 'Invalid weekly_hours_scheduled', details: 'Must be a positive number' },
        { status: 400 }
      )
    }

    if (!data.default_shift_type_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return HttpResponse.json(
        { error: 'Invalid default_shift_type_id', details: 'Must be a valid UUID' },
        { status: 400 }
      )
    }

    if (!['Dispatcher', 'Shift Supervisor', 'Management'].includes(data.employee_role)) {
      return HttpResponse.json(
        { error: 'Invalid employee_role', details: 'Must be one of: Dispatcher, Shift Supervisor, Management' },
        { status: 400 }
      )
    }

    if (!['Employee', 'Manager', 'Admin'].includes(data.user_role)) {
      return HttpResponse.json(
        { error: 'Invalid user_role', details: 'Must be one of: Employee, Manager, Admin' },
        { status: 400 }
      )
    }

    // Simulate specific error cases
    if (data.email === 'error@test.com') {
      return HttpResponse.json(
        { error: 'Error creating user', details: 'Auth error' },
        { status: 400 }
      )
    }

    if (data.email === 'metadata-error@test.com') {
      return HttpResponse.json(
        { error: 'Error updating user metadata', details: 'Metadata error' },
        { status: 400 }
      )
    }

    if (data.email === 'verify-error@test.com') {
      return HttpResponse.json(
        { error: 'Failed to verify employee record', details: 'Verification error' },
        { status: 500 }
      )
    }

    // Success case
    const employee = {
      id: createTestUser().id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    }

    return HttpResponse.json({
      message: 'Employee created successfully',
      userId: employee.id,
      employee
    }, { status: 200 })
  }),

  http.delete('/api/employees/:id', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return HttpResponse.json(
        { error: 'Unauthorized', details: 'No auth token' },
        { status: 401 }
      )
    }

    // Simulate role check
    const userRole = request.headers.get('X-User-Role')
    if (!['Admin', 'Manager'].includes(userRole || '')) {
      return HttpResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    return new Response(null, { status: 204 })
  }),

  // Shift endpoints
  http.get('/api/shifts', () => {
    return HttpResponse.json({
      shifts: Array(3).fill(null).map(createTestShift),
    }, { status: 200 })
  }),

  http.post('/api/shifts', () => {
    return HttpResponse.json(
      createTestShift(),
      { status: 201 }
    )
  }),

  // User endpoints
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url)
    const ids = url.searchParams.get('ids')

    if (!ids) {
      return HttpResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      )
    }

    if (ids === 'error-id') {
      return HttpResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    if (ids === 'unexpected-error') {
      throw new Error('Unexpected error')
    }

    const userIds = ids.split(',')
    const users = userIds.map(id => ({
      id,
      email: id.includes('duplicate') ? `user.1@test.com` : `user@test.com`
    }))

    return HttpResponse.json(users, { status: 200 })
  }),

  // Schedule endpoints
  http.get('/api/schedules', ({ request }) => {
    const url = new URL(request.url)
    const weekStart = url.searchParams.get('week_start')
    const employeeId = url.searchParams.get('employee_id')
    const status = url.searchParams.get('status')

    let schedules = Array(3).fill(null).map(() => ({
      id: createTestUser().id,
      week_start_date: weekStart || '2024-03-18',
      employee_id: employeeId || createTestUser().id,
      schedule_status: status || 'pending',
      shifts: createTestShift(),
      employees: {
        id: employeeId || createTestUser().id,
        full_name: 'Test Employee'
      }
    }))

    if (weekStart === 'invalid-date') {
      return HttpResponse.json(
        { error: 'Invalid date format' },
        { status: 500 }
      )
    }

    return HttpResponse.json(schedules, { status: 200 })
  }),

  http.post('/api/schedules', async ({ request }) => {
    const data = await request.json() as CreateScheduleInput

    if (!data.week_start_date || !data.day_of_week || !data.shift_id || !data.employee_id) {
      return HttpResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const schedule = {
      id: createTestUser().id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
      shifts: createTestShift(),
      employees: {
        id: data.employee_id,
        full_name: 'Test Employee'
      }
    }

    return HttpResponse.json(schedule, { status: 200 })
  }),

  http.patch('/api/schedules', async ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return HttpResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    const data = await request.json() as Partial<CreateScheduleInput>

    const schedule = {
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
      shifts: createTestShift(),
      employees: {
        id: createTestUser().id,
        full_name: 'Test Employee'
      }
    }

    return HttpResponse.json(schedule, { status: 200 })
  }),

  http.delete('/api/schedules', ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return HttpResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      )
    }

    if (id === 'invalid-uuid') {
      return HttpResponse.json(
        { error: 'Invalid UUID format' },
        { status: 500 }
      )
    }

    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  // Error handlers
  http.get('/api/error', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }),

  http.post('/api/error', () => {
    return HttpResponse.json(
      { error: 'Bad Request' },
      { status: 400 }
    )
  }),
] 