import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Create a service role client for all operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the JWT token from the request header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid auth header' },
        { status: 401 }
      )
    }

    // Get user from the token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token', details: userError?.message },
        { status: 401 }
      )
    }

    // Check if user has admin role using service role client
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (employeeError || !employeeData) {
      console.error('Employee lookup error:', employeeError)
      return NextResponse.json(
        { error: 'Unauthorized - Employee not found', details: employeeError?.message },
        { status: 401 }
      )
    }

    if (!['Admin', 'Manager'].includes(employeeData.user_role)) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    // Call the transaction function to delete the employee
    const { data, error: deleteError } = await supabase
      .rpc('delete_employee_transaction', params.id)

    if (deleteError) {
      console.error('Error deleting employee:', deleteError)
      return NextResponse.json(
        { 
          error: 'Failed to delete employee',
          details: deleteError.message
        },
        { status: 500 }
      )
    }

    // Revalidate the employees page
    revalidatePath('/employees')
    return new NextResponse(null, { status: 204 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 