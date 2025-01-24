import { createClient } from '@/utils/supabase/server'
import { login, signup } from '@/app/login/actions'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Mock dependencies
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(() => Promise.resolve({ error: null })),
      signUp: jest.fn(() => Promise.resolve({ error: null }))
    }
  }))
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

describe('Login Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('signs in user successfully', async () => {
      // Create mock form data
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      await login(formData)

      // Verify Supabase client calls
      const mockSupabase = await createClient()
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })

      // Verify redirects and revalidation
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(redirect).toHaveBeenCalledWith('/account')
    })

    it('handles sign in error', async () => {
      // Mock sign in error
      ;(createClient as jest.Mock).mockImplementationOnce(() => ({
        auth: {
          signInWithPassword: jest.fn(() => Promise.resolve({
            error: new Error('Invalid credentials')
          }))
        }
      }))

      // Create mock form data
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'wrongpassword')

      await login(formData)

      // Verify redirect to error page
      expect(redirect).toHaveBeenCalledWith('/error')
    })

    it('validates required fields', async () => {
      // Create mock form data without required fields
      const formData = new FormData()

      await login(formData)

      // Verify Supabase client was not called
      const mockSupabase = await createClient()
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()

      // Verify redirect to error page
      expect(redirect).toHaveBeenCalledWith('/error')
    })
  })

  describe('signup', () => {
    it('creates new user successfully', async () => {
      // Create mock form data
      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')

      await signup(formData)

      // Verify Supabase client calls
      const mockSupabase = await createClient()
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123'
      })

      // Verify redirects and revalidation
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(redirect).toHaveBeenCalledWith('/account')
    })

    it('handles signup error', async () => {
      // Mock signup error
      ;(createClient as jest.Mock).mockImplementationOnce(() => ({
        auth: {
          signUp: jest.fn(() => Promise.resolve({
            error: new Error('Email already exists')
          }))
        }
      }))

      // Create mock form data
      const formData = new FormData()
      formData.append('email', 'existing@example.com')
      formData.append('password', 'password123')

      await signup(formData)

      // Verify redirect to error page
      expect(redirect).toHaveBeenCalledWith('/error')
    })

    it('validates required fields', async () => {
      // Create mock form data without required fields
      const formData = new FormData()

      await signup(formData)

      // Verify Supabase client was not called
      const mockSupabase = await createClient()
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()

      // Verify redirect to error page
      expect(redirect).toHaveBeenCalledWith('/error')
    })

    it('validates password strength', async () => {
      // Create mock form data with weak password
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', '123')

      await signup(formData)

      // Verify Supabase client was not called
      const mockSupabase = await createClient()
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()

      // Verify redirect to error page
      expect(redirect).toHaveBeenCalledWith('/error')
    })
  })
}) 