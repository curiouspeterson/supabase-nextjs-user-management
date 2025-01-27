import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { ApiError, ValidationError } from '@/lib/errors'

// Validation schema for query parameters
const confirmQuerySchema = z.object({
  token_hash: z.string().min(1, 'Token hash is required'),
  type: z.enum(['email', 'recovery', 'invite', 'magiclink'] as const, {
    errorMap: () => ({ message: 'Invalid confirmation type' })
  }),
  next: z.string().optional()
})

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      token_hash: searchParams.get('token_hash'),
      type: searchParams.get('type'),
      next: searchParams.get('next') || '/account'
    }

    const { token_hash, type, next } = confirmQuerySchema.parse(queryParams)

    // Get client info for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check rate limit before proceeding
    const { data: rateLimit, error: rateLimitError } = await supabase.rpc(
      'check_confirmation_rate_limit',
      { 
        p_ip_address: clientIp,
        p_email: null // We don't have email at this point
      }
    )

    if (rateLimitError) {
      throw new ApiError('Failed to check rate limit', { cause: rateLimitError })
    }

    if (!rateLimit?.allowed) {
      const retryAfter = rateLimit?.next_allowed_attempt
        ? Math.ceil((new Date(rateLimit.next_allowed_attempt).getTime() - Date.now()) / 1000)
        : 3600

      // Log failed attempt
      await supabase.rpc('log_confirmation_attempt', {
        p_type: type,
        p_token_hash: token_hash,
        p_ip_address: clientIp,
        p_user_agent: userAgent,
        p_success: false,
        p_error_message: 'Rate limit exceeded'
      })

      // Create redirect to error page with rate limit info
      const errorUrl = new URL('/error', request.url)
      errorUrl.searchParams.set('code', 'RATE_LIMIT_EXCEEDED')
      errorUrl.searchParams.set('retry_after', String(retryAfter))
      return NextResponse.redirect(errorUrl, {
        headers: {
          'Retry-After': String(retryAfter)
        }
      })
    }

    // Verify the token
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    // Log the confirmation attempt
    await supabase.rpc('log_confirmation_attempt', {
      p_type: type,
      p_token_hash: token_hash,
      p_ip_address: clientIp,
      p_user_agent: userAgent,
      p_success: !verifyError,
      p_error_message: verifyError?.message
    })

    if (verifyError) {
      throw new ApiError('Failed to verify token', { cause: verifyError })
    }

    // Create redirect URL for success
    const redirectTo = new URL(next, request.url)
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')
    redirectTo.searchParams.delete('next')

    return NextResponse.redirect(redirectTo)

  } catch (error) {
    console.error('Auth confirmation error:', error)

    // Create redirect URL for error page
    const errorUrl = new URL('/error', request.url)

    if (error instanceof z.ZodError) {
      errorUrl.searchParams.set('code', 'INVALID_PARAMETERS')
      errorUrl.searchParams.set('message', error.errors[0]?.message || 'Invalid parameters')
      return NextResponse.redirect(errorUrl)
    }

    if (error instanceof ApiError) {
      errorUrl.searchParams.set('code', 'VERIFICATION_FAILED')
      errorUrl.searchParams.set('message', error.message)
      return NextResponse.redirect(errorUrl)
    }

    // Generic error
    errorUrl.searchParams.set('code', 'UNKNOWN_ERROR')
    errorUrl.searchParams.set('message', 'An unexpected error occurred')
    return NextResponse.redirect(errorUrl)
  }
}
