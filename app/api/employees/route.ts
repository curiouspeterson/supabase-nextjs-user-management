import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

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

export async function POST(request: Request) {
  try {
    console.log('Starting employee creation process...')
    const requestData = await request.json()
    console.log('Received request data:', JSON.stringify(requestData, null, 2))

    const {
      email,
      full_name,
      employee_role,
      user_role,
      weekly_hours_scheduled,
      default_shift_type_id
    } = requestData

    // Validate required fields
    if (!email || !full_name || !employee_role || !user_role || !weekly_hours_scheduled || !default_shift_type_id) {
      console.error('Missing required fields:', {
        email: !email,
        full_name: !full_name,
        employee_role: !employee_role,
        user_role: !user_role,
        weekly_hours_scheduled: !weekly_hours_scheduled,
        default_shift_type_id: !default_shift_type_id
      })
      return NextResponse.json(
        { error: 'Missing required fields', details: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate field formats
    if (typeof weekly_hours_scheduled !== 'number' || weekly_hours_scheduled < 0) {
      return NextResponse.json(
        { error: 'Invalid weekly_hours_scheduled', details: 'Must be a positive number' },
        { status: 400 }
      )
    }

    if (!default_shift_type_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json(
        { error: 'Invalid default_shift_type_id', details: 'Must be a valid UUID' },
        { status: 400 }
      )
    }

    if (!['Dispatcher', 'Shift Supervisor', 'Management'].includes(employee_role)) {
      return NextResponse.json(
        { error: 'Invalid employee_role', details: 'Must be one of: Dispatcher, Shift Supervisor, Management' },
        { status: 400 }
      )
    }

    if (!['Employee', 'Manager', 'Admin'].includes(user_role)) {
      return NextResponse.json(
        { error: 'Invalid user_role', details: 'Must be one of: Employee, Manager, Admin' },
        { status: 400 }
      )
    }

    console.log('Request data validated:', { email, full_name, employee_role, user_role })

    // Create Supabase client with admin role
    const supabase = createAdminClient()
    console.log('Admin client created')

    // Check if user already exists
    console.log('Checking for existing user...')
    const { data: existingUser, error: lookupError } = await supabase.auth.admin.listUsers()
    if (lookupError) {
      console.error('Error checking existing users:', lookupError)
      return NextResponse.json(
        { error: 'Error checking existing users', details: lookupError.message },
        { status: 500 }
      )
    }

    const userExists = existingUser.users.some(user => user.email === email)
    if (userExists) {
      console.log('User already exists:', email)
      return NextResponse.json(
        { error: 'User already exists', details: 'A user with this email already exists' },
        { status: 400 }
      )
    }
    console.log('No existing user found')

    // Generate a secure password if not provided
    const password = generateSecurePassword()
    console.log('Password generated')

    // First try creating user with minimal data
    console.log('Attempting to create user with minimal data...')
    const { data: minimalAuthData, error: minimalAuthError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name
      }
    })

    if (minimalAuthError) {
      console.error('Error creating user with minimal data:', minimalAuthError)
      console.error('Minimal user data:', { email, full_name })
      return NextResponse.json(
        { 
          error: 'Error creating user', 
          details: minimalAuthError.message,
          code: minimalAuthError.status,
          context: 'minimal_data',
          metadata: { email, full_name }
        },
        { status: minimalAuthError.status || 400 }
      )
    }

    // If minimal user creation succeeds, update with full metadata
    console.log('User created successfully with minimal data, updating metadata...')
    console.log('Full metadata to be updated:', {
      full_name,
      employee_role,
      user_role,
      weekly_hours_scheduled,
      default_shift_type_id
    })

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      minimalAuthData.user.id,
      {
        user_metadata: {
          full_name,
          employee_role,
          user_role,
          weekly_hours_scheduled: parseInt(weekly_hours_scheduled.toString(), 10),
          default_shift_type_id
        }
      }
    )

    if (updateError) {
      console.error('Error updating user metadata:', updateError)
      console.error('Update data:', {
        userId: minimalAuthData.user.id,
        metadata: {
          full_name,
          employee_role,
          user_role,
          weekly_hours_scheduled,
          default_shift_type_id
        }
      })
      // Try to clean up the user if metadata update fails
      await supabase.auth.admin.deleteUser(minimalAuthData.user.id)
      return NextResponse.json(
        { 
          error: 'Error updating user metadata', 
          details: updateError.message,
          code: updateError.status,
          metadata: {
            full_name,
            employee_role,
            user_role,
            weekly_hours_scheduled,
            default_shift_type_id
          }
        },
        { status: updateError.status || 400 }
      )
    }

    // Wait a moment for the trigger to complete
    console.log('Waiting for database trigger...')
    await new Promise(resolve => setTimeout(resolve, 2000)) // Increased wait time

    // Verify the employee record was created
    console.log('Verifying employee record...')
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', minimalAuthData.user.id)
      .single()

    if (employeeError || !employee) {
      console.error('Error verifying employee creation:', employeeError)
      console.error('Employee verification data:', {
        userId: minimalAuthData.user.id,
        error: employeeError
      })
      // Try to clean up the user if employee verification fails
      await supabase.auth.admin.deleteUser(minimalAuthData.user.id)
      return NextResponse.json(
        { 
          error: 'Failed to verify employee record', 
          details: employeeError?.message,
          context: 'verification',
          userId: minimalAuthData.user.id
        },
        { status: 500 }
      )
    }

    console.log('Employee created successfully:', employee)
    return NextResponse.json({ 
      message: 'Employee created successfully',
      userId: minimalAuthData.user.id,
      employee
    })

  } catch (error) {
    console.error('Unexpected error in employee creation:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 