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
    const {
      email,
      full_name,
      employee_role,
      user_role,
      weekly_hours_scheduled,
      default_shift_type_id
    } = requestData

    console.log('Request data validated:', { email, full_name })

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
          context: 'minimal_data'
        },
        { status: minimalAuthError.status || 400 }
      )
    }

    // If minimal user creation succeeds, update with full metadata
    console.log('User created successfully with minimal data, updating metadata...')
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      minimalAuthData.user.id,
      {
        user_metadata: {
          full_name,
          employee_role,
          user_role,
          weekly_hours_scheduled: parseInt(weekly_hours_scheduled.toString(), 10),
          default_shift_type_id: default_shift_type_id.toString()
        }
      }
    )

    if (updateError) {
      console.error('Error updating user metadata:', updateError)
      // Try to clean up the user if metadata update fails
      await supabase.auth.admin.deleteUser(minimalAuthData.user.id)
      return NextResponse.json(
        { 
          error: 'Error updating user metadata', 
          details: updateError.message,
          code: updateError.status
        },
        { status: updateError.status || 400 }
      )
    }

    // Wait a moment for the trigger to complete
    console.log('Waiting for database trigger...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Verify the employee record was created
    console.log('Verifying employee record...')
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', minimalAuthData.user.id)
      .single()

    if (employeeError || !employee) {
      console.error('Error verifying employee creation:', employeeError)
      // Try to clean up the user if employee verification fails
      await supabase.auth.admin.deleteUser(minimalAuthData.user.id)
      return NextResponse.json(
        { error: 'Failed to verify employee record', details: employeeError?.message },
        { status: 500 }
      )
    }

    console.log('Employee created successfully')
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
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 