import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { ApiError, ValidationError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

// Validation schema for query parameters
const confirmQuerySchema = z.object({
  token_hash: z.string().min(1, 'Token hash is required'),
  type: z.enum(['signup', 'recovery', 'invite', 'email'] as const),
  next: z.string().url().optional()
})

// Creating a handler to a GET request to route /auth/confirm
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestId = crypto.randomUUID()
  const cookieStore = cookies()
  const supabase = createClient()

  try {
    // Parse and validate query parameters
    const url = new URL(request.url)
    const validatedQuery = confirmQuerySchema.parse({
      token_hash: url.searchParams.get('token_hash'),
      type: url.searchParams.get('type'),
      next: url.searchParams.get('next'),
    })
    
    logger.info('Processing confirmation request', {
      requestId,
      type: validatedQuery.type,
    })

    // Verify the token hash
    const { data: { user }, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: validatedQuery.token_hash,
      type: validatedQuery.type as EmailOtpType,
    })

    if (verifyError) {
      throw new ApiError('Failed to verify token', { cause: verifyError })
    }

    if (!user) {
      throw new ApiError('No user found')
    }

    // Create employee record if this is a signup confirmation
    if (validatedQuery.type === 'signup') {
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          id: user.id,
          user_role: 'Employee',
          employee_role: 'Dispatcher',
        })

      if (employeeError) {
        throw new ApiError('Failed to create employee record', { cause: employeeError })
      }
    }

    logger.info('Successfully confirmed user', {
      requestId,
      userId: user.id,
      type: validatedQuery.type,
    })

    // Redirect to the next URL or default to the dashboard
    const redirectTo = validatedQuery.next ?? '/dashboard'
    return NextResponse.redirect(redirectTo)

  } catch (error) {
    logger.error('Error confirming user', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
