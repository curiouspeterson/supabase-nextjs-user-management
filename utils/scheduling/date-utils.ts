/**
 * Utility functions for date and time operations in the scheduling system
 */

/**
 * Parse a time string in HH:mm format to milliseconds since midnight
 */
export function parseTimeToMs(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60 + minutes) * 60 * 1000;
}

/**
 * Format milliseconds since midnight to HH:mm format
 */
export function formatMsToTime(ms: number): string {
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Calculate the number of hours between two dates
 */
export function getHoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/**
 * Get dates between start and end dates (inclusive)
 */
export function getDatesBetween(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Calculate working days based on a pattern rotation
 */
export function calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  rotationStartDate: Date,
  daysOn: number,
  daysOff: number
): Date[] {
  const workingDays: Date[] = [];
  const cycleLength = daysOn + daysOff;
  const current = new Date(startDate);
  
  // Calculate days since rotation start to determine position in cycle
  const daysSinceRotationStart = Math.floor(
    (startDate.getTime() - rotationStartDate.getTime()) / (24 * 60 * 60 * 1000)
  );
  
  // Determine current position in cycle
  let cyclePosition = daysSinceRotationStart % cycleLength;
  
  while (current <= endDate) {
    if (cyclePosition < daysOn) {
      workingDays.push(new Date(current));
    }
    
    current.setDate(current.getDate() + 1);
    cyclePosition = (cyclePosition + 1) % cycleLength;
  }
  
  return workingDays;
}

/**
 * Check if two time ranges overlap
 */
export function doTimeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseTimeToMs(start1);
  const e1 = parseTimeToMs(end1);
  const s2 = parseTimeToMs(start2);
  const e2 = parseTimeToMs(end2);
  
  return (s1 < e2 && e1 > s2) || (s2 < e1 && e2 > s1);
}

/**
 * Check if a date is within a date range (inclusive)
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const normalizedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

/**
 * Get the next date with the specified time
 */
export function getNextDateWithTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  
  if (result < date) {
    result.setDate(result.getDate() + 1);
  }
  
  return result;
}

/**
 * Calculate consecutive working days for an employee
 */
export function getConsecutiveWorkingDays(dates: Date[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = dates
    .map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    .sort((a, b) => a.getTime() - b.getTime());
  
  let maxConsecutive = 1;
  let currentConsecutive = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const dayDiff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (24 * 60 * 60 * 1000);
    
    if (dayDiff === 1) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 1;
    }
  }
  
  return maxConsecutive;
}

/**
 * Group dates by week
 */
export function groupDatesByWeek(dates: Date[]): Record<string, Date[]> {
  return dates.reduce((acc, date) => {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    acc[weekKey] = acc[weekKey] || [];
    acc[weekKey].push(date);
    
    return acc;
  }, {} as Record<string, Date[]>);
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Get the week number for a date (1-53)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
} 