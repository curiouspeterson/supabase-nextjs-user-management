import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { DatabaseError, AuthError, ValidationError } from '@/lib/errors'
import { ScheduleGenerator } from '@/services/scheduler/ScheduleGenerator'
import type { Database } from '@/types/supabase'

// Environment variables validation
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

// Request validation schema
const generateScheduleSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  department_id: z.string().uuid().optional(),
  batch_size: z.number().min(1).max(1000).optional(),
})

type GenerateScheduleRequest = z.infer<typeof generateScheduleSchema>

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { start_date, end_date, department_id, batch_size } = generateScheduleSchema.parse(body)

    logger.info('Generating schedule', {
      start_date,
      end_date,
      department_id,
      batch_size,
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

    // Initialize schedule generator
    const generator = new ScheduleGenerator(supabase)
    await generator.initialize({
      startDate: start_date,
      endDate: end_date,
      departmentId: department_id,
      batchSize: batch_size,
    })

    // Generate schedules
    const { schedules, errors } = await generator.generate()

    if (errors.length > 0) {
      logger.warn('Some schedules could not be generated', {
        errors: errors.map(e => e.message),
      })
    }

    if (schedules.length === 0) {
      throw new ValidationError('No schedules could be generated')
    }

    logger.info('Schedule generation completed', {
      start_date,
      end_date,
      schedulesGenerated: schedules.length,
      errors: errors.length,
    })

    return NextResponse.json({
      message: 'Schedule generated successfully',
      data: {
        schedules,
        warnings: errors.length > 0 ? errors.map(e => e.message) : undefined,
      },
    })

  } catch (error) {
    logger.error('Error generating schedule', {
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