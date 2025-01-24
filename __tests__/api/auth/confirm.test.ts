import { createClient } from '@/utils/supabase/server'
import { GET } from '@/app/auth/confirm/route'
import { NextRequest, NextResponse } from 'next/server'

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      verifyOtp: jest.fn(() => Promise.resolve({ error: null }))
    }
  }))
}))

describe('Auth Confirm Route', () => {
  const mockUrl = 'http://localhost:3000/auth/confirm'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles email confirmation successfully', async () => {
    // Create mock request with token hash and type
    const request = new NextRequest(new URL(
      `${mockUrl}?token_hash=abc123&type=email`,
      mockUrl
    ))

    const response = await GET(request)

    // Verify Supabase client calls
    const mockSupabase = await createClient()
    expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
      type: 'email',
      token_hash: 'abc123'
    })

    // Verify redirect to account page
    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/account')
  })

  it('handles magic link confirmation successfully', async () => {
    // Create mock request with token hash and type
    const request = new NextRequest(new URL(
      `${mockUrl}?token_hash=abc123&type=magiclink`,
      mockUrl
    ))

    const response = await GET(request)

    // Verify Supabase client calls
    const mockSupabase = await createClient()
    expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
      type: 'magiclink',
      token_hash: 'abc123'
    })

    // Verify redirect to account page
    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/account')
  })

  it('handles missing token hash', async () => {
    // Create mock request without token hash
    const request = new NextRequest(new URL(
      `${mockUrl}?type=email`,
      mockUrl
    ))

    const response = await GET(request)

    // Verify redirect to error page
    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/error')
  })

  it('handles missing type', async () => {
    // Create mock request without type
    const request = new NextRequest(new URL(
      `${mockUrl}?token_hash=abc123`,
      mockUrl
    ))

    const response = await GET(request)

    // Verify redirect to error page
    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/error')
  })

  it('handles verification error', async () => {
    // Mock verification error
    ;(createClient as jest.Mock).mockImplementationOnce(() => ({
      auth: {
        verifyOtp: jest.fn(() => Promise.resolve({ error: new Error('Invalid token') }))
      }
    }))

    // Create mock request
    const request = new NextRequest(new URL(
      `${mockUrl}?token_hash=abc123&type=email`,
      mockUrl
    ))

    const response = await GET(request)

    // Verify redirect to error page
    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/error')
  })
}) 