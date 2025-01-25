import { NextRequest, NextResponse } from 'next/server'
import { mockCreateClient } from '../../utils/test-utils'
import { GET } from '@/app/auth/confirm/route'

describe('Auth Confirm Route', () => {
  it('handles email confirmation successfully', async () => {
    const searchParams = new URLSearchParams({
      token_hash: 'valid-token',
      type: 'email'
    })
    const request = new NextRequest(new URL(`http://localhost:3000/auth/confirm?${searchParams}`))
    const mockSupabase = mockCreateClient()

    const response = await GET(request)

    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/dashboard')
    expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: 'valid-token',
      type: 'email'
    })
  })

  it('handles magic link confirmation successfully', async () => {
    const searchParams = new URLSearchParams({
      token_hash: 'valid-token',
      type: 'magiclink'
    })
    const request = new NextRequest(new URL(`http://localhost:3000/auth/confirm?${searchParams}`))
    const mockSupabase = mockCreateClient()

    const response = await GET(request)

    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/dashboard')
    expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: 'valid-token',
      type: 'magiclink'
    })
  })

  it('handles missing token hash', async () => {
    const searchParams = new URLSearchParams({
      type: 'email'
    })
    const request = new NextRequest(new URL(`http://localhost:3000/auth/confirm?${searchParams}`))

    const response = await GET(request)

    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/error')
  })

  it('handles missing type', async () => {
    const searchParams = new URLSearchParams({
      token_hash: 'valid-token'
    })
    const request = new NextRequest(new URL(`http://localhost:3000/auth/confirm?${searchParams}`))

    const response = await GET(request)

    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/error')
  })

  it('handles verification error', async () => {
    const searchParams = new URLSearchParams({
      token_hash: 'invalid-token',
      type: 'email'
    })
    const request = new NextRequest(new URL(`http://localhost:3000/auth/confirm?${searchParams}`))
    const mockSupabase = mockCreateClient()
    mockSupabase.auth.verifyOtp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Verification failed' }
    })

    const response = await GET(request)

    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/error')
  })
}) 