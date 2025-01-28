import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { ApiError, DatabaseError, AuthError, ValidationError } from '@/lib/errors'
import crypto from 'crypto'
import type { Database } from '@/types/supabase'

// Environment variables validation
const envSchema = z.object({
  EMAIL_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

// Validate environment variables
const env = envSchema.parse({
  EMAIL_DOMAIN: process.env.EMAIL_DOMAIN || 'example.com',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

// Request validation schemas
const employeeSchema = z.object({
  user_role: z.enum(['Admin', 'Manager', 'Employee']).describe('User role for permissions'),
  employee_role: z.enum(['Dispatcher', 'Shift Supervisor', 'Management']).describe('Employee role for scheduling'),
  weekly_hours_scheduled: z.number().min(0).max(168).optional(),
  default_shift_type_id: z.string().uuid().optional().nullable(),
}) satisfies z.ZodType<Omit<Database['public']['Tables']['employees']['Insert'], 'id' | 'created_at' | 'updated_at'>>

const updateEmployeeSchema = z.object({
  user_role: z.enum(['Admin', 'Manager', 'Employee']).optional(),
  employee_role: z.enum(['Dispatcher', 'Shift Supervisor', 'Management']).optional(),
  weekly_hours_scheduled: z.number().min(0).max(168).optional(),
  default_shift_type_id: z.string().uuid().optional(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new DatabaseError('Failed to fetch employees', { cause: error })
    }

    return NextResponse.json({
      data,
    })

  } catch (error) {
    logger.error('Error fetching employees', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

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

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = employeeSchema.parse(body)
    
    logger.info('Creating employee', {
      requestId,
      ...validatedData,
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

    // Check if user has permission to create employees
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError) {
      throw new DatabaseError('Failed to fetch employee data', { cause: employeeError })
    }
    if (!employeeData || !['Manager', 'Admin'].includes(employeeData.user_role)) {
      throw new AuthError('Insufficient permissions to create employees')
    }

    // Create employee with type assertion to handle the id requirement
    const { data: employee, error: createError } = await supabase
      .from('employees')
      .insert(validatedData as Database['public']['Tables']['employees']['Insert'])
      .select()
      .single()

    if (createError) {
      throw new DatabaseError('Failed to create employee', { cause: createError })
    }

    logger.info('Successfully created employee', {
      requestId,
      employeeId: employee.id,
    })

    return NextResponse.json({
      message: 'Employee created successfully',
      data: employee,
    })

  } catch (error) {
    logger.error('Error creating employee', {
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
    // Get employee ID from URL
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      throw new ValidationError('Employee ID is required')
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateEmployeeSchema.parse(body)
    
    logger.info('Updating employee', {
      requestId,
      employeeId: id,
      ...validatedData,
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

    // Check if user has permission to update employees
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError) {
      throw new DatabaseError('Failed to fetch employee data', { cause: employeeError })
    }
    if (!employeeData || !['Manager', 'Admin'].includes(employeeData.user_role)) {
      throw new AuthError('Insufficient permissions to update employees')
    }

    // Update employee
    const { data: employee, error: updateError } = await supabase
      .from('employees')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new DatabaseError('Failed to update employee', { cause: updateError })
    }

    logger.info('Successfully updated employee', {
      requestId,
      employeeId: employee.id,
    })

    return NextResponse.json({
      message: 'Employee updated successfully',
      data: employee,
    })

  } catch (error) {
    logger.error('Error updating employee', {
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
    // Get employee ID from URL
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      throw new ValidationError('Employee ID is required')
    }
    
    logger.info('Deleting employee', {
      requestId,
      employeeId: id,
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

    // Check if user has permission to delete employees
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError) {
      throw new DatabaseError('Failed to fetch employee data', { cause: employeeError })
    }
    if (!employeeData || !['Manager', 'Admin'].includes(employeeData.user_role)) {
      throw new AuthError('Insufficient permissions to delete employees')
    }

    // Delete employee
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw new DatabaseError('Failed to delete employee', { cause: deleteError })
    }

    logger.info('Successfully deleted employee', {
      requestId,
      employeeId: id,
    })

    return NextResponse.json({
      message: 'Employee deleted successfully',
    })

  } catch (error) {
    logger.error('Error deleting employee', {
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