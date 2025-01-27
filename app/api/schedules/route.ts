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

// GET /api/schedules
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
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
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body: CreateScheduleInput | CreateScheduleInput[] = await request.json()

    // Handle both single and bulk create
    const isArray = Array.isArray(body)
    const schedules = isArray ? body : [body]

    // Validate required fields
    const invalidSchedules = schedules.filter(
      schedule => !schedule.week_start_date || !schedule.day_of_week || !schedule.shift_id || !schedule.employee_id
    )

    if (invalidSchedules.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', invalidSchedules },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert(schedules)
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(isArray ? data : data[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
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