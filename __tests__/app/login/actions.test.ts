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
      await login('test@example.com', 'password123')

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

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow()

      // Verify redirect was not called
      expect(redirect).not.toHaveBeenCalled()
    })

    it('validates required fields', async () => {
      await expect(login('', '')).rejects.toThrow()

      // Verify Supabase client was not called
      const mockSupabase = await createClient()
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled()
    })
  })

  describe('signup', () => {
    it('creates new user successfully', async () => {
      await signup('newuser@example.com', 'password123')

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

      await expect(signup('existing@example.com', 'password123')).rejects.toThrow()

      // Verify redirect was not called
      expect(redirect).not.toHaveBeenCalled()
    })

    it('validates required fields', async () => {
      await expect(signup('', '')).rejects.toThrow()

      // Verify Supabase client was not called
      const mockSupabase = await createClient()
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('validates password strength', async () => {
      await expect(signup('test@example.com', '123')).rejects.toThrow()

      // Verify Supabase client was not called
      const mockSupabase = await createClient()
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })
  })
}) 