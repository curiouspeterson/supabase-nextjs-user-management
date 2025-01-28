import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { ApiError, DatabaseError, AuthError } from '@/lib/errors'
import crypto from 'crypto'

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

// Request validation schema
const createEmployeeSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  username: z.string().min(1, 'Username is required'),
  employee_role: z.enum(['Dispatcher', 'Shift Supervisor', 'Management']),
  weekly_hours_scheduled: z.number().min(0).max(168),
  default_shift_type_id: z.string().optional(),
})

function generateUniqueEmail(fullName: string): string {
  // Remove special characters and convert to lowercase
  const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '')
  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 7)
  return `${cleanName}.${randomSuffix}@dispatch911.com`
}

function generateSecurePassword(): string {
  // Generate a password that meets Supabase requirements:
  // - At least 6 characters
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one number
  const length = 12
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const specialChars = '!@#$%^&*'
  
  // Ensure at least one of each required character type
  let password = 
    uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)) +
    lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)) +
    numberChars.charAt(Math.floor(Math.random() * numberChars.length)) +
    specialChars.charAt(Math.floor(Math.random() * specialChars.length))
  
  // Fill the rest with random characters
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export async function GET() {
  try {
    const supabase = createClient(cookies())
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Failed to fetch employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  
  try {
    const json = await request.json()
    const validatedData = createEmployeeSchema.parse(json)
    
    logger.info('Creating new employee', {
      requestId,
      username: validatedData.username,
      role: validatedData.employee_role
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

    // Check if user has admin role
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError) {
      throw new DatabaseError('Failed to fetch employee data', { cause: employeeError })
    }
    if (!employeeData || !['Manager', 'Admin'].includes(employeeData.user_role)) {
      throw new AuthError('Insufficient permissions to create employee')
    }

    // Generate a secure random password
    const password = crypto.randomBytes(16).toString('hex')

    // Create the user account
    const { data: userData, error: createUserError } = await supabase.auth.signUp({
      email: `${validatedData.username}@${env.EMAIL_DOMAIN}`,
      password,
    })

    if (createUserError || !userData.user) {
      throw new DatabaseError('Failed to create user account', { cause: createUserError })
    }

    // Create employee profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userData.user.id,
      full_name: validatedData.full_name,
      username: validatedData.username,
    })

    if (profileError) {
      throw new DatabaseError('Failed to create employee profile', { cause: profileError })
    }

    // Create employee record
    const { data: employeeRecord, error: createEmployeeError } = await supabase.from('employees').insert({
      id: userData.user.id,
      employee_role: validatedData.employee_role,
      weekly_hours_scheduled: validatedData.weekly_hours_scheduled,
      default_shift_type_id: validatedData.default_shift_type_id,
      user_role: validatedData.employee_role === 'Management' ? 'Admin' : 'Employee',
    }).select().single()

    if (createEmployeeError) {
      throw new DatabaseError('Failed to create employee record', { cause: createEmployeeError })
    }

    logger.info('Successfully created employee', {
      requestId,
      employeeId: userData.user.id
    })

    return NextResponse.json(employeeRecord)
  } catch (error) {
    logger.error('Error creating employee', {
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