import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

export function middleware(request: NextRequest) {
  // Generate a unique request ID
  const requestId = crypto.randomBytes(16).toString('hex')

  if (process.env.DEBUG === 'true') {
    console.log('\n🔍 ===== API Request Logger =====')
    console.log(`📝 Request ID: ${requestId}`)
    console.log('📅 Timestamp:', new Date().toISOString())
    console.log('🛠  Method:', request.method)
    console.log('🔗 URL:', request.url)
    console.log('📋 Headers:', Object.fromEntries(request.headers.entries()))
    console.log('📦 Body Present:', request.body ? 'Yes' : 'No')
    console.log('============================\n')
  }

  // Add request ID to response headers
  const response = NextResponse.next()
  response.headers.set('x-request-id', requestId)
  return response
}

export const config = {
  matcher: '/api/:path*',
} 