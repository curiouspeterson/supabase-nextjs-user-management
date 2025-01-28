import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { 
  Schedule, 
  ScheduleWithRelations, 
  CreateScheduleInput, 
  UpdateScheduleInput,
  BulkUpdateScheduleInput
} from '@/types/schedule'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { ApiError, DatabaseError, AuthError, ValidationError } from '@/lib/errors'
import { startOfWeek, parseISO, isValid, format } from 'date-fns'
import crypto from 'crypto'

// GET /api/schedules
export async function GET(request: Request) {
  try {
    const supabase = createClient(cookies())
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const weekStart = searchParams.get('week_start')
    const employeeId = searchParams.get('employee_id')
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const shiftId = searchParams.get('shift_id')
    
    // Build query with expanded relations
    let query = supabase.from('schedules').select(`
      *,
      shifts:shifts (
        *,
        shift_types:shift_types (*)
      ),
      employees:employees (
        *,
        profiles:profiles (
          full_name
        )
      )
    `)
    
    // Apply filters if provided
    if (weekStart) {
      query = query.eq('week_start_date', weekStart)
    }
    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }
    if (status) {
      query = query.eq('schedule_status', status)
    }
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }
    if (shiftId) {
      query = query.eq('shift_id', shiftId)
    }

    // Order by date and employee
    query = query.order('date').order('employee_id')

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data as ScheduleWithRelations[])
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// POST /api/schedules
export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    // Validate environment variables
    const env = z.object({
      NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    }).parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    // Parse and validate request body
    const body = await request.json()
    const validatedData = z.object({
      employee_id: z.string().uuid(),
      shift_type_id: z.string().uuid(),
      week_start_date: z.string().refine(
        (date) => {
          const parsed = parseISO(date)
          return isValid(parsed)
        },
        { message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)' }
      ),
      hours: z.number().min(0).max(168),
      notes: z.string().optional(),
    }).parse(body)
    
    logger.info('Creating new schedule', {
      requestId,
      employeeId: validatedData.employee_id,
      weekStart: validatedData.week_start_date,
    })

    const supabase = createClient(
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

    // Check if user has permission to create schedules
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError) {
      throw new DatabaseError('Failed to fetch employee data', { cause: employeeError })
    }
    if (!employeeData || !['Manager', 'Admin'].includes(employeeData.user_role)) {
      throw new AuthError('Insufficient permissions to create schedules')
    }

    // Validate week start date
    const weekStart = startOfWeek(parseISO(validatedData.week_start_date))
    const formattedWeekStart = format(weekStart, 'yyyy-MM-dd')

    // Check for existing schedule
    const { data: existingSchedule, error: checkError } = await supabase
      .from('schedules')
      .select()
      .eq('employee_id', validatedData.employee_id)
      .eq('week_start_date', formattedWeekStart)
      .maybeSingle()

    if (checkError) {
      throw new DatabaseError('Failed to check existing schedule', { cause: checkError })
    }

    if (existingSchedule) {
      throw new ValidationError('Schedule already exists for this week')
    }

    // Create schedule
    const { data: schedule, error: createError } = await supabase
      .from('schedules')
      .insert({
        ...validatedData,
        week_start_date: formattedWeekStart,
        created_by: user.id,
      })
      .select()
      .single()

    if (createError) {
      throw new DatabaseError('Failed to create schedule', { cause: createError })
    }

    logger.info('Successfully created schedule', {
      requestId,
      scheduleId: schedule.id,
    })

    return NextResponse.json(
      {
        message: 'Schedule created successfully',
        data: schedule,
      },
      { status: 201 }
    )

  } catch (error) {
    logger.error('Error creating schedule', {
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

// PATCH /api/schedules
export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const bulk = searchParams.get('bulk') === 'true'
    
    if (!bulk && !id) {
      return NextResponse.json(
        { error: 'Schedule ID is required for single update' },
        { status: 400 }
      )
    }

    const body: UpdateScheduleInput | BulkUpdateScheduleInput = await request.json()

    let result;
    if (bulk) {
      // Bulk update
      const bulkBody = body as BulkUpdateScheduleInput
      if (!bulkBody.ids || !Array.isArray(bulkBody.ids) || bulkBody.ids.length === 0) {
        return NextResponse.json(
          { error: 'Schedule IDs array is required for bulk update' },
          { status: 400 }
        )
      }

      result = await supabase
        .from('schedules')
        .update(bulkBody.data)
        .in('id', bulkBody.ids)
        .select(`
          *,
          shifts (
            *,
            shift_types (*)
          ),
          employees (
            id, 
            full_name,
            employee_pattern,
            weekly_hours_scheduled,
            default_shift_type_id
          )
        `)
    } else {
      // Single update
      result = await supabase
        .from('schedules')
        .update(body as UpdateScheduleInput)
        .eq('id', id)
        .select(`
          *,
          shifts (
            *,
            shift_types (*)
          ),
          employees (
            id, 
            full_name,
            employee_pattern,
            weekly_hours_scheduled,
            default_shift_type_id
          )
        `)
        .single()
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE /api/schedules
export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const ids = searchParams.get('ids')?.split(',')
    
    if (!id && !ids) {
      return NextResponse.json(
        { error: 'Schedule ID or IDs are required' },
        { status: 400 }
      )
    }

    let query = supabase.from('schedules').delete()
    
    if (ids) {
      query = query.in('id', ids)
    } else {
      query = query.eq('id', id)
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    // Validate environment variables
    const env = z.object({
      NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    }).parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    // Parse and validate request body
    const body = await request.json()
    const validatedData = z.object({
      id: z.string().uuid(),
      week_start_date: z.string().refine(
        (date) => {
          const parsed = parseISO(date)
          return isValid(parsed)
        },
        { message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)' }
      ).optional(),
      hours: z.number().min(0).max(168).optional(),
      notes: z.string().optional(),
    }).parse(body)
    
    logger.info('Updating schedule', {
      requestId,
      scheduleId: validatedData.id,
    })

    const supabase = createClient(
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

    // Check if user has permission to update schedules
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError) {
      throw new DatabaseError('Failed to fetch employee data', { cause: employeeError })
    }
    if (!employeeData || !['Manager', 'Admin'].includes(employeeData.user_role)) {
      throw new AuthError('Insufficient permissions to update schedules')
    }

    // If week_start_date is being updated, validate it
    let formattedWeekStart: string | undefined
    if (validatedData.week_start_date) {
      const weekStart = startOfWeek(parseISO(validatedData.week_start_date))
      formattedWeekStart = format(weekStart, 'yyyy-MM-dd')
    }

    // Update schedule
    const { data: schedule, error: updateError } = await supabase
      .from('schedules')
      .update({
        ...validatedData,
        week_start_date: formattedWeekStart,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.id)
      .select()
      .single()

    if (updateError) {
      throw new DatabaseError('Failed to update schedule', { cause: updateError })
    }

    logger.info('Successfully updated schedule', {
      requestId,
      scheduleId: schedule.id,
    })

    return NextResponse.json({
      message: 'Schedule updated successfully',
      data: schedule,
    })

  } catch (error) {
    logger.error('Error updating schedule', {
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