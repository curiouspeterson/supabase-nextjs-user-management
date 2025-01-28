import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { ApiError, DatabaseError, AuthError, ValidationError } from '@/lib/errors'
import { parseISO, isValid, isBefore, addYears } from 'date-fns'
import crypto from 'crypto'

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
  type: z.enum(['Vacation', 'Personal', 'Sick', 'Training']),
  notes: z.string().min(1).max(500),
})

const updateRequestSchema = z.object({
  status: z.enum(['Approved', 'Declined', 'Pending']),
  manager_notes: z.string().max(500).optional(),
})

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = timeOffRequestSchema.parse(body)
    
    logger.info('Creating time-off request', {
      requestId,
      startDate: validatedData.start_date,
      endDate: validatedData.end_date,
      type: validatedData.type,
    })

    const supabase = createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      throw new AuthError('Failed to authenticate user', { cause: authError })
    }
    if (!user) {
      throw new AuthError('No authenticated user found')
    }

    // Create time off request
    const { data: timeOffRequest, error: createError } = await supabase
      .from('time_off_requests')
      .insert({
        employee_id: user.id,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        type: validatedData.type,
        notes: validatedData.notes,
        status: 'Pending',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      throw new DatabaseError('Failed to create time off request', { cause: createError })
    }

    logger.info('Successfully created time off request', {
      requestId,
      timeOffRequestId: timeOffRequest.id,
    })

    return NextResponse.json({
      message: 'Time-off request created successfully',
      data: timeOffRequest,
    })

  } catch (error) {
    logger.error('Error creating time-off request', {
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

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    const supabase = createClient()

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
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('user_role')
        .eq('id', user.id)
        .single()

      if (employeeError) {
        throw new DatabaseError('Failed to fetch employee data', { cause: employeeError })
      }
      if (!employeeData || !['Manager', 'Admin'].includes(employeeData.user_role)) {
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
        type,
        notes,
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

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
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

    const supabase = createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      throw new AuthError('Failed to authenticate user', { cause: authError })
    }
    if (!user) {
      throw new AuthError('No authenticated user found')
    }

    // Check if user has permission to update time-off requests
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError) {
      throw new DatabaseError('Failed to fetch employee data', { cause: employeeError })
    }
    if (!employeeData || !['Manager', 'Admin'].includes(employeeData.user_role)) {
      throw new AuthError('Insufficient permissions to manage time-off requests')
    }

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

    logger.info('Successfully updated time-off request', {
      requestId,
      timeOffRequestId: id,
      status: validatedData.status,
    })

    return NextResponse.json({
      message: 'Time-off request updated successfully',
    })

  } catch (error) {
    logger.error('Error updating time-off request', {
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

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
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

    const supabase = createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      throw new AuthError('Failed to authenticate user', { cause: authError })
    }
    if (!user) {
      throw new AuthError('No authenticated user found')
    }

    // Check if user has permission to delete time-off requests
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError) {
      throw new DatabaseError('Failed to fetch employee data', { cause: employeeError })
    }
    if (!employeeData || !['Manager', 'Admin'].includes(employeeData.user_role)) {
      throw new AuthError('Insufficient permissions to delete time-off requests')
    }

    // Delete time-off request
    const { error: deleteError } = await supabase
      .from('time_off_requests')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw new DatabaseError('Failed to delete time-off request', { cause: deleteError })
    }

    logger.info('Successfully deleted time-off request', {
      requestId,
      timeOffRequestId: id,
    })

    return NextResponse.json({
      message: 'Time-off request deleted successfully',
    })

  } catch (error) {
    logger.error('Error deleting time-off request', {
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

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 