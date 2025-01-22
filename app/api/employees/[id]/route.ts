import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Create a regular client for user auth check
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options)
            } catch (error) {
              // Handle cookies in middleware
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 })
            } catch (error) {
              // Handle cookies in middleware
            }
          },
        },
      }
    )

    // Create a service role client for admin operations
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options)
            } catch (error) {
              // Handle cookies in middleware
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 })
            } catch (error) {
              // Handle cookies in middleware
            }
          },
        },
      }
    )

    // Check if user is authorized (must be manager or admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is a manager or admin
    const { data: currentEmployee, error: roleError } = await supabase
      .from('employees')
      .select('user_role')
      .eq('id', user.id)
      .single()

    if (roleError) throw roleError
    if (!currentEmployee || !['Manager', 'Admin'].includes(currentEmployee.user_role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete employee record first (due to foreign key constraint)
    const { error: employeeError } = await supabaseAdmin
      .from('employees')
      .delete()
      .eq('id', params.id)

    if (employeeError) throw employeeError

    // Delete profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', params.id)

    if (profileError) throw profileError

    // Delete auth user using admin client
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
      params.id
    )

    if (authDeleteError) throw authDeleteError

    // Revalidate the employees page
    revalidatePath('/employees')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 