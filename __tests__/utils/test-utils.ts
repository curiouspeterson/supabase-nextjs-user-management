import { faker } from '@faker-js/faker'
import { render } from '@testing-library/react'
import { Database } from '@/app/database.types'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}

// Test data factories
export const createTestUser = () => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
})

export const createTestEmployee = () => ({
  id: faker.string.uuid(),
  user_id: faker.string.uuid(),
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
})

export const createTestShift = () => ({
  id: faker.string.uuid(),
  shift_type_id: faker.string.uuid(),
  start_time: '09:00:00',
  end_time: '17:00:00',
  duration_hours: 8,
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
})

// Custom render function with providers
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui)
}

// Helper to create a mock response
export const createMockResponse = () => {
  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    headers: new Headers(),
  }
  return res
}

// Helper to create a mock request
export const createMockRequest = (method = 'GET', body?: any) => {
  return new Request('http://localhost:3000', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Type guard for checking if response is error
export const isErrorResponse = (response: any): response is { error: string } => {
  return response && typeof response.error === 'string'
}

// Helper to mock Next.js navigation
export const mockNextNavigation = () => {
  const push = jest.fn()
  const replace = jest.fn()
  const refresh = jest.fn()
  
  return {
    push,
    replace,
    refresh,
    back: jest.fn(),
    forward: jest.fn(),
  }
}

// Helper to setup MSW handlers
export const setupMockHandlers = () => {
  // Add MSW handlers here when needed
} 