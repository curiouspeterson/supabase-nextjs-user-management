import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
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

    // Get the request body
    const values = await request.json()
    const email = values.full_name.toLowerCase().replace(/\s+/g, '.') + '@example.com'

    // Create new auth user
    const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'temppass123',
      email_confirm: true,
    })

    if (createUserError) throw createUserError

    // Create profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ 
        id: authUser.user.id, 
        full_name: values.full_name,
        updated_at: new Date().toISOString()
      })

    if (profileError) throw profileError

    // Create employee record
    const { error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        id: authUser.user.id,
        employee_role: values.employee_role,
        user_role: values.user_role,
        weekly_hours_scheduled: values.weekly_hours_scheduled,
      })

    if (employeeError) throw employeeError

    // Revalidate the employees page
    revalidatePath('/employees')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 