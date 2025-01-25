import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface TimeOffRequest {
  userId: string
  startDate: string
  endDate: string
  reason: string
}

export async function handleTimeOffRequest(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as TimeOffRequest

    // Validate required fields
    if (!body.userId || !body.startDate || !body.endDate || !body.reason) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 })
    }

    // Validate date range
    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)
    if (endDate < startDate) {
      return NextResponse.json({
        success: false,
        error: 'End date must be after start date',
      }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check for overlapping requests
    const { data: existingRequests, error: fetchError } = await supabase
      .from('time_off_requests')
      .select('*')
      .eq('userId', body.userId)

    if (fetchError) {
      throw fetchError
    }

    const hasOverlap = existingRequests?.some(request => {
      const existingStart = new Date(request.startDate)
      const existingEnd = new Date(request.endDate)
      return (
        (startDate >= existingStart && startDate <= existingEnd) ||
        (endDate >= existingStart && endDate <= existingEnd) ||
        (startDate <= existingStart && endDate >= existingEnd)
      )
    })

    if (hasOverlap) {
      return NextResponse.json({
        success: false,
        error: 'Time off request overlaps with existing request',
      }, { status: 409 })
    }

    // Insert time off request
    const { data, error } = await supabase
      .from('time_off_requests')
      .insert({
        userId: body.userId,
        startDate: body.startDate,
        endDate: body.endDate,
        reason: body.reason,
        status: 'pending',
      })
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error handling time off request:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return handleTimeOffRequest(request)
} 