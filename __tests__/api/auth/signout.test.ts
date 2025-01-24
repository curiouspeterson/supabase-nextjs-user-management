import { createClient } from '@/utils/supabase/server'
import { GET, POST } from '@/app/auth/signout/route'
import { NextRequest } from 'next/server'

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signOut: jest.fn(() => Promise.resolve({ error: null }))
    }
  }))
}))

describe('Auth Signout Route', () => {
  const mockUrl = 'http://localhost:3000/auth/signout'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET method', () => {
    it('signs out user successfully', async () => {
      // Create mock request
      const request = new NextRequest(new URL(mockUrl))

      const response = await GET(request)

      // Verify Supabase client calls
      const mockSupabase = await createClient()
      expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({ scope: 'global' })

      // Verify redirect to login page
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('/login')
    })

    it('handles sign out error', async () => {
      // Mock sign out error
      ;(createClient as jest.Mock).mockImplementationOnce(() => ({
        auth: {
          signOut: jest.fn(() => Promise.resolve({ error: new Error('Sign out failed') }))
        }
      }))

      // Create mock request
      const request = new NextRequest(new URL(mockUrl))

      const response = await GET(request)

      // Should still redirect to login page
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('/login')
    })
  })

  describe('POST method', () => {
    it('signs out user successfully', async () => {
      // Create mock request
      const request = new NextRequest(new URL(mockUrl), {
        method: 'POST'
      })

      const response = await POST(request)

      // Verify Supabase client calls
      const mockSupabase = await createClient()
      expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({ scope: 'global' })

      // Verify redirect to login page
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('/login')
    })

    it('handles sign out error', async () => {
      // Mock sign out error
      ;(createClient as jest.Mock).mockImplementationOnce(() => ({
        auth: {
          signOut: jest.fn(() => Promise.resolve({ error: new Error('Sign out failed') }))
        }
      }))

      // Create mock request
      const request = new NextRequest(new URL(mockUrl), {
        method: 'POST'
      })

      const response = await POST(request)

      // Should still redirect to login page
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('/login')
    })
  })

  it('revalidates layout after sign out', async () => {
    // Create mock request
    const request = new NextRequest(new URL(mockUrl))

    const response = await GET(request)

    // Verify cache revalidation header
    expect(response.headers.get('x-next-cache-revalidate')).toBe('layout')
  })
}) 