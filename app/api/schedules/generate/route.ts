import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { ApiError, DatabaseError, AuthError, ValidationError } from '@/lib/errors'
import { startOfWeek, parseISO, isValid, format, addWeeks } from 'date-fns'
import crypto from 'crypto'
import { ScheduleGenerator } from '@/services/scheduler/ScheduleGenerator'

// Environment variables validation
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

// Request validation schema
const generateScheduleSchema = z.object({
  start_date: z.string().refine(
    (date) => {
      const parsed = parseISO(date)
      return isValid(parsed)
    },
    { message: 'Invalid start date format. Use ISO 8601 format (YYYY-MM-DD)' }
  ),
  weeks: z.number().min(1).max(12), // Limit to reasonable range
  department_id: z.string().uuid().optional(),
})

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
    const validatedData = generateScheduleSchema.parse(body)
    
    logger.info('Generating schedules', {
      requestId,
      startDate: validatedData.start_date,
      weeks: validatedData.weeks,
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

    // Check if user has permission to generate schedules
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError) {
      throw new DatabaseError('Failed to fetch employee data', { cause: employeeError })
    }
    if (!employeeData || !['Manager', 'Admin'].includes(employeeData.user_role)) {
      throw new AuthError('Insufficient permissions to generate schedules')
    }

    // Calculate date range
    const startDate = startOfWeek(parseISO(validatedData.start_date))
    const endDate = addWeeks(startDate, validatedData.weeks)

    // Begin transaction
    const { error: beginError } = await supabase.rpc('begin_transaction')
    if (beginError) {
      throw new DatabaseError('Failed to begin transaction', { cause: beginError })
    }

    try {
      // Fetch required data with pagination and date range filtering
      const batchSize = 100
      const generator = new ScheduleGenerator(supabase)

      // Initialize generator with date range
      await generator.initialize({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        departmentId: validatedData.department_id,
        batchSize,
      })

      // Generate schedules
      const { schedules, errors } = await generator.generate()

      if (errors.length > 0) {
        // Log errors but continue if some schedules were generated
        logger.warn('Some schedules could not be generated', {
          requestId,
          errors,
        })
      }

      if (schedules.length === 0) {
        throw new ValidationError('No schedules could be generated')
      }

      // Insert schedules in batches
      for (let i = 0; i < schedules.length; i += batchSize) {
        const batch = schedules.slice(i, i + batchSize)
        const { error: insertError } = await supabase
          .from('schedules')
          .insert(batch.map(schedule => ({
            ...schedule,
            created_by: user.id,
          })))

        if (insertError) {
          throw new DatabaseError('Failed to insert schedules', { cause: insertError })
        }
      }

      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction')
      if (commitError) {
        throw new DatabaseError('Failed to commit transaction', { cause: commitError })
      }

      logger.info('Successfully generated schedules', {
        requestId,
        count: schedules.length,
        warnings: errors.length,
      })

      return NextResponse.json({
        message: 'Schedules generated successfully',
        data: {
          count: schedules.length,
          warnings: errors.length > 0 ? errors : undefined,
        },
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
    logger.error('Error generating schedules', {
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