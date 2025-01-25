import { rest } from 'msw'
import { faker } from '@faker-js/faker'
import { createMockUser, createMockEmployee, createMockTimeOff } from '../utils/test-utils'
import { BASE_URL } from '../utils/test-utils'

interface EmployeeRequest {
  email: string
  weekly_hours: number
  shift_type_id: string
  role: string
}

interface TimeOffRequest {
  start_date: string
  end_date: string
  status?: string
  notes?: string
}

interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

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
  rest.post(`${BASE_URL}/api/auth/login`, (req, res, ctx) => {
    return res(ctx.json({ success: true }))
  }),

  rest.post(`${BASE_URL}/api/auth/signout`, (req, res, ctx) => {
    return res(ctx.json({ success: true }))
  }),

  rest.post(`${BASE_URL}/api/auth/confirm`, (req, res, ctx) => {
    return res(ctx.json({ success: true }))
  }),

  // Employee endpoints
  rest.get(`${BASE_URL}/api/employees`, (req, res, ctx) => {
    return res(ctx.json([
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: faker.helpers.arrayElement(['admin', 'employee']),
        created_at: faker.date.past().toISOString(),
        updated_at: faker.date.recent().toISOString()
      }
    ]))
  }),

  rest.post(`${BASE_URL}/api/employees`, (req, res, ctx) => {
    return res(ctx.json({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: faker.helpers.arrayElement(['admin', 'employee']),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString()
    }))
  }),

  // User endpoints
  rest.get(`${BASE_URL}/api/users`, (req, res, ctx) => {
    return res(ctx.json([
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: faker.helpers.arrayElement(['admin', 'employee']),
        created_at: faker.date.past().toISOString(),
        updated_at: faker.date.recent().toISOString()
      }
    ]))
  }),

  // Time off endpoints
  rest.get(`${BASE_URL}/api/time-off`, (req, res, ctx) => {
    return res(ctx.json([
      {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(),
        start_date: faker.date.future().toISOString(),
        end_date: faker.date.future().toISOString(),
        status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
        created_at: faker.date.past().toISOString(),
        updated_at: faker.date.recent().toISOString()
      }
    ]))
  }),

  rest.post(`${BASE_URL}/api/time-off`, (req, res, ctx) => {
    return res(ctx.json({
      id: faker.string.uuid(),
      user_id: faker.string.uuid(),
      start_date: faker.date.future().toISOString(),
      end_date: faker.date.future().toISOString(),
      status: 'pending',
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString()
    }))
  }),

  // Schedule endpoints
  rest.get(`${BASE_URL}/api/schedules`, (req, res, ctx) => {
    return res(ctx.json([
      {
        id: faker.string.uuid(),
        user_id: faker.string.uuid(),
        start_time: faker.date.future().toISOString(),
        end_time: faker.date.future().toISOString(),
        created_at: faker.date.past().toISOString(),
        updated_at: faker.date.recent().toISOString()
      }
    ]))
  }),

  rest.post(`${BASE_URL}/api/schedules`, (req, res, ctx) => {
    return res(ctx.json({
      id: faker.string.uuid(),
      user_id: faker.string.uuid(),
      start_time: faker.date.future().toISOString(),
      end_time: faker.date.future().toISOString(),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString()
    }))
  }),

  // Error handlers
  rest.get('/api/error', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Internal Server Error' }))
  }),

  rest.post('/api/error', (req, res, ctx) => {
    return res(ctx.status(400), ctx.json({ error: 'Bad Request' }))
  }),
] 