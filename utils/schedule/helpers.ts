import { Database } from '@/types/supabase'

export type Shift = Database['public']['Tables']['shifts']['Row']
export type Schedule = Database['public']['Tables']['schedules']['Row']
export type Employee = Database['public']['Tables']['employees']['Row']
export type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']
export type StaffingRequirement = Database['public']['Tables']['staffing_requirements']['Row']
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

export const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as DayOfWeek[]

// Helper function to get the start of the week (Monday) for a given date
export function getWeekStart(date: Date): Date {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
  return new Date(date.setDate(diff))
}

// Helper function to format a date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Helper function to parse time string (HH:mm:ss) to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper function to check if two time ranges overlap
export function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Min = timeToMinutes(start1)
  const end1Min = timeToMinutes(end1)
  const start2Min = timeToMinutes(start2)
  const end2Min = timeToMinutes(end2)

  // Handle cases where end time is on the next day (e.g., "23:00" to "05:00")
  const range1CrossesMidnight = end1Min <= start1Min
  const range2CrossesMidnight = end2Min <= start2Min

  if (!range1CrossesMidnight && !range2CrossesMidnight) {
    // Neither range crosses midnight
    return start1Min < end2Min && start2Min < end1Min
  } else if (range1CrossesMidnight && range2CrossesMidnight) {
    // Both ranges cross midnight
    return true
  } else if (range1CrossesMidnight) {
    // Only range1 crosses midnight
    return start2Min < end1Min || start2Min >= start1Min
  } else {
    // Only range2 crosses midnight
    return start1Min < end2Min || start1Min >= start2Min
  }
}

// Helper function to calculate total hours between two times
export function calculateHours(start: string, end: string): number {
  const startMin = timeToMinutes(start)
  const endMin = timeToMinutes(end)
  
  if (endMin <= startMin) {
    // Shift crosses midnight
    return (24 * 60 - startMin + endMin) / 60
  } else {
    return (endMin - startMin) / 60
  }
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

export function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)
  
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

export function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
} 