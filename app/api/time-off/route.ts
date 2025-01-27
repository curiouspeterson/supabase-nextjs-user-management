import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { ApiError, DatabaseError, AuthError, ValidationError } from '@/lib/errors'
import { parseISO, isValid, isBefore, addYears } from 'date-fns'
import crypto from 'crypto'

// Environment variables validation
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

// Request validation schemas
const timeOffRequestSchema = z.object({
  start_date: z.string().refine(
    (date) => {
      const parsed = parseISO(date)
      return isValid(parsed) && !isBefore(parsed, new Date())
    },
    { message: 'Invalid start date. Date must be in the future.' }
  ),
  end_date: z.string().refine(
    (date) => {
      const parsed = parseISO(date)
      return isValid(parsed) && !isBefore(parsed, new Date())
    },
    { message: 'Invalid end date. Date must be in the future.' }
  ),
  request_type: z.enum(['Vacation', 'Sick Leave', 'Personal', 'Other']),
  reason: z.string().min(1).max(500),
})

const updateRequestSchema = z.object({
  status: z.enum(['Approved', 'Denied', 'Pending']),
  manager_notes: z.string().max(500).optional(),
})

export const dynamic = 'force-dynamic'

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
    const validatedData = timeOffRequestSchema.parse(body)
    
    logger.info('Creating time-off request', {
      requestId,
      startDate: validatedData.start_date,
      endDate: validatedData.end_date,
      type: validatedData.request_type,
    })

    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookies().set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookies().set({ name, value: '', ...options })
          },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      throw new AuthError('Failed to authenticate user', { cause: authError })
    }
    if (!user) {
      throw new AuthError('No authenticated user found')
    }

    // Begin transaction
    const { error: beginError } = await supabase.rpc('begin_transaction')
    if (beginError) {
      throw new DatabaseError('Failed to begin transaction', { cause: beginError })
    }

    try {
      // Validate request using database function
      const { data: validation, error: validationError } = await supabase.rpc(
        'validate_time_off_request',
        {
          p_user_id: user.id,
          p_start_date: validatedData.start_date,
          p_end_date: validatedData.end_date,
          p_request_type: validatedData.request_type,
          p_reason: validatedData.reason,
        }
      )

      if (validationError) {
        throw new DatabaseError('Failed to validate request', { cause: validationError })
      }

      if (!validation.valid) {
        throw new ValidationError('Invalid time-off request', {
          errors: validation.errors,
          conflicts: validation.conflicts,
        })
      }

      // Insert time-off request
      const { error: insertError } = await supabase
        .from('time_off_requests')
        .insert({
          employee_id: user.id,
          start_date: validatedData.start_date,
          end_date: validatedData.end_date,
          request_type: validatedData.request_type,
          reason: validatedData.reason,
          status: 'Pending',
          created_by: user.id,
          updated_by: user.id,
        })

      if (insertError) {
        throw new DatabaseError('Failed to create time-off request', { cause: insertError })
      }

      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction')
      if (commitError) {
        throw new DatabaseError('Failed to commit transaction', { cause: commitError })
      }

      logger.info('Successfully created time-off request', {
        requestId,
        userId: user.id,
      })

      return NextResponse.json({
        message: 'Time-off request created successfully',
      })

    } catch (error) {
      // Rollback transaction on error
      const { error: rollbackError } = await supabase.rpc('rollback_transaction')
      if (rollbackError) {
        logger.error('Failed to rollback transaction', {
          requestId,
          error: rollbackError,
        })
      }
      throw error
    }

  } catch (error) {
    logger.error('Error creating time-off request', {
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

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          type: 'validation_error',
          title: 'Validation Error',
          status: 400,
          detail: error.message,
          errors: error.errors,
          conflicts: error.conflicts,
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

export async function GET(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    // Validate environment variables
    const env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookies().set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookies().set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      throw new AuthError('Failed to authenticate user', { cause: authError })
    }
    if (!user) {
      throw new AuthError('No authenticated user found')
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    // Check if user can manage time-off requests if querying other employees
    if (employeeId && employeeId !== user.id) {
      const { data: canManage, error: permissionError } = await supabase
        .rpc('can_manage_time_off_requests', {
          p_user_id: user.id,
        })

      if (permissionError) {
        throw new DatabaseError('Failed to check permissions', { cause: permissionError })
      }

      if (!canManage) {
        throw new AuthError('Insufficient permissions to view other employees time-off requests')
      }
    }

    const query = supabase
      .from('time_off_requests')
      .select(`
        id,
        employee_id,
        start_date,
        end_date,
        request_type,
        reason,
        status,
        manager_notes,
        created_at,
        updated_at,
        created_by,
        updated_by,
        employees (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
    
    if (employeeId) {
      query.eq('employee_id', employeeId)
    } else {
      // If no specific employee is requested, only show the user's own requests
      query.eq('employee_id', user.id)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      throw new DatabaseError('Failed to fetch time-off requests', { cause: fetchError })
    }

    logger.info('Successfully fetched time-off requests', {
      requestId,
      count: data?.length ?? 0,
      employeeId: employeeId ?? user.id,
    })

    return NextResponse.json({
      data,
    })

  } catch (error) {
    logger.error('Error fetching time-off requests', {
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

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          type: 'validation_error',
          title: 'Validation Error',
          status: 400,
          detail: error.message,
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

export async function PUT(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    // Validate environment variables
    const env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    // Get request ID from URL
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      throw new ValidationError('Request ID is required')
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateRequestSchema.parse(body)
    
    logger.info('Updating time-off request', {
      requestId,
      timeOffRequestId: id,
      status: validatedData.status,
    })

    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookies().set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookies().set({ name, value: '', ...options })
          },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      throw new AuthError('Failed to authenticate user', { cause: authError })
    }
    if (!user) {
      throw new AuthError('No authenticated user found')
    }

    // Check if user can manage time-off requests
    const { data: canManage, error: permissionError } = await supabase
      .rpc('can_manage_time_off_requests', {
        p_user_id: user.id,
      })

    if (permissionError) {
      throw new DatabaseError('Failed to check permissions', { cause: permissionError })
    }

    if (!canManage) {
      throw new AuthError('Insufficient permissions to manage time-off requests')
    }

    // Begin transaction
    const { error: beginError } = await supabase.rpc('begin_transaction')
    if (beginError) {
      throw new DatabaseError('Failed to begin transaction', { cause: beginError })
    }

    try {
      // Update time-off request
      const { error: updateError } = await supabase
        .from('time_off_requests')
        .update({
          status: validatedData.status,
          manager_notes: validatedData.manager_notes,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('id', id)

      if (updateError) {
        throw new DatabaseError('Failed to update time-off request', { cause: updateError })
      }

      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction')
      if (commitError) {
        throw new DatabaseError('Failed to commit transaction', { cause: commitError })
      }

      logger.info('Successfully updated time-off request', {
        requestId,
        timeOffRequestId: id,
        status: validatedData.status,
      })

      return NextResponse.json({
        message: 'Time-off request updated successfully',
      })

    } catch (error) {
      // Rollback transaction on error
      const { error: rollbackError } = await supabase.rpc('rollback_transaction')
      if (rollbackError) {
        logger.error('Failed to rollback transaction', {
          requestId,
          error: rollbackError,
        })
      }
      throw error
    }

  } catch (error) {
    logger.error('Error updating time-off request', {
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

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          type: 'validation_error',
          title: 'Validation Error',
          status: 400,
          detail: error.message,
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

export async function DELETE(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    // Validate environment variables
    const env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    // Get request ID from URL
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      throw new ValidationError('Request ID is required')
    }
    
    logger.info('Deleting time-off request', {
      requestId,
      timeOffRequestId: id,
    })

    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookies().set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookies().set({ name, value: '', ...options })
          },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      throw new AuthError('Failed to authenticate user', { cause: authError })
    }
    if (!user) {
      throw new AuthError('No authenticated user found')
    }

    // Check if user can manage time-off requests
    const { data: canManage, error: permissionError } = await supabase
      .rpc('can_manage_time_off_requests', {
        p_user_id: user.id,
      })

    if (permissionError) {
      throw new DatabaseError('Failed to check permissions', { cause: permissionError })
    }

    if (!canManage) {
      throw new AuthError('Insufficient permissions to delete time-off requests')
    }

    // Begin transaction
    const { error: beginError } = await supabase.rpc('begin_transaction')
    if (beginError) {
      throw new DatabaseError('Failed to begin transaction', { cause: beginError })
    }

    try {
      // Delete time-off request
      const { error: deleteError } = await supabase
        .from('time_off_requests')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw new DatabaseError('Failed to delete time-off request', { cause: deleteError })
      }

      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction')
      if (commitError) {
        throw new DatabaseError('Failed to commit transaction', { cause: commitError })
      }

      logger.info('Successfully deleted time-off request', {
        requestId,
        timeOffRequestId: id,
      })

      return NextResponse.json({
        message: 'Time-off request deleted successfully',
      })

    } catch (error) {
      // Rollback transaction on error
      const { error: rollbackError } = await supabase.rpc('rollback_transaction')
      if (rollbackError) {
        logger.error('Failed to rollback transaction', {
          requestId,
          error: rollbackError,
        })
      }
      throw error
    }

  } catch (error) {
    logger.error('Error deleting time-off request', {
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

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          type: 'validation_error',
          title: 'Validation Error',
          status: 400,
          detail: error.message,
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