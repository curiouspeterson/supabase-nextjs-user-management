import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { ApiError, DatabaseError, AuthError, ValidationError } from '@/lib/errors'
import crypto from 'crypto'

// Environment variables validation
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

// Request validation schemas
const userIdsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
})

const userQuerySchema = z.object({
  department_id: z.string().uuid().optional(),
  role: z.enum(['Admin', 'Manager', 'Employee']).optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export async function GET(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    // Validate environment variables
    const env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    const url = new URL(request.url)
    const searchParams = Object.fromEntries(url.searchParams)
    
    // Parse and validate query parameters
    const validatedQuery = userQuerySchema.parse({
      department_id: searchParams.department_id,
      role: searchParams.role,
      search: searchParams.search,
      page: searchParams.page,
      limit: searchParams.limit,
    })
    
    logger.info('Fetching users', {
      requestId,
      ...validatedQuery,
    })

    const supabase = createClient(cookies())

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      throw new AuthError('Failed to authenticate user', { cause: authError })
    }
    if (!user) {
      throw new AuthError('No authenticated user found')
    }

    // Build query
    let query = supabase
      .from('employees')
      .select('*', { count: 'exact' })
      .range(
        (validatedQuery.page - 1) * validatedQuery.limit,
        validatedQuery.page * validatedQuery.limit - 1
      )

    // Apply filters
    if (validatedQuery.department_id) {
      query = query.eq('department_id', validatedQuery.department_id)
    }
    if (validatedQuery.role) {
      query = query.eq('user_role', validatedQuery.role)
    }
    if (validatedQuery.search) {
      query = query.or(`full_name.ilike.%${validatedQuery.search}%,email.ilike.%${validatedQuery.search}%`)
    }

    // Execute query
    const { data: users, count, error: fetchError } = await query
    if (fetchError) {
      throw new DatabaseError('Failed to fetch users', { cause: fetchError })
    }

    // Mask sensitive data
    const maskedUsers = await Promise.all(
      (users ?? []).map(async (userData) => {
        const { data: masked, error: maskError } = await supabase.rpc(
          'mask_user_data',
          {
            p_viewer_id: user.id,
            p_user_data: userData,
          }
        )
        if (maskError) {
          logger.warn('Failed to mask user data', {
            requestId,
            userId: userData.id,
            error: maskError,
          })
          return null
        }
        return masked
      })
    )

    // Filter out any users that failed to mask
    const filteredUsers = maskedUsers.filter(Boolean)

    logger.info('Successfully fetched users', {
      requestId,
      count: filteredUsers.length,
      total: count,
    })

    return NextResponse.json({
      data: filteredUsers,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: count,
        pages: Math.ceil((count ?? 0) / validatedQuery.limit),
      },
    })

  } catch (error) {
    logger.error('Error fetching users', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          type: 'validation_error',
          title: 'Validation Error',
          status: 400,
          detail: 'Invalid request parameters',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          type: 'authorization_error',
          title: 'Authorization Error',
          status: 403,
          detail: error.message,
        },
        { status: 403 }
      )
    }

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        {
          type: 'database_error',
          title: 'Database Error',
          status: 500,
          detail: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        type: 'internal_server_error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    // Validate environment variables
    const env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    // Parse and validate request body
    const body = await request.json()
    const validatedData = userIdsSchema.parse(body)
    
    logger.info('Fetching users by IDs', {
      requestId,
      count: validatedData.ids.length,
    })

    const supabase = createClient(cookies())

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      throw new AuthError('Failed to authenticate user', { cause: authError })
    }
    if (!user) {
      throw new AuthError('No authenticated user found')
    }

    // Fetch users
    const { data: users, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .in('id', validatedData.ids)

    if (fetchError) {
      throw new DatabaseError('Failed to fetch users', { cause: fetchError })
    }

    // Mask sensitive data
    const maskedUsers = await Promise.all(
      (users ?? []).map(async (userData) => {
        const { data: masked, error: maskError } = await supabase.rpc(
          'mask_user_data',
          {
            p_viewer_id: user.id,
            p_user_data: userData,
          }
        )
        if (maskError) {
          logger.warn('Failed to mask user data', {
            requestId,
            userId: userData.id,
            error: maskError,
          })
          return null
        }
        return masked
      })
    )

    // Filter out any users that failed to mask
    const filteredUsers = maskedUsers.filter(Boolean)

    logger.info('Successfully fetched users by IDs', {
      requestId,
      count: filteredUsers.length,
    })

    return NextResponse.json({
      data: filteredUsers,
    })

  } catch (error) {
    logger.error('Error fetching users by IDs', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          type: 'validation_error',
          title: 'Validation Error',
          status: 400,
          detail: 'Invalid request data',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          type: 'authorization_error',
          title: 'Authorization Error',
          status: 403,
          detail: error.message,
        },
        { status: 403 }
      )
    }

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        {
          type: 'database_error',
          title: 'Database Error',
          status: 500,
          detail: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        type: 'internal_server_error',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
} 