/**
 * Utility functions for date and time operations in the scheduling system
 */

import { format, getISOWeek, parseISO, isValid, addDays } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export class TimeFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeFormatError';
  }
}

/**
 * Validates time string format (HH:mm)
 */
const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Converts time string to milliseconds
 * @throws {TimeFormatError} If time string is invalid
 */
export const parseTimeToMs = (time: string): number => {
  if (!isValidTimeFormat(time)) {
    throw new TimeFormatError(`Invalid time format: ${time}. Expected format: HH:mm`);
  }

  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
};

/**
 * Formats milliseconds to time string
 * @throws {TimeFormatError} If milliseconds value is invalid
 */
export const formatMsToTime = (ms: number): string => {
  if (ms < 0 || ms >= 24 * 60 * 60 * 1000) {
    throw new TimeFormatError(`Invalid milliseconds value: ${ms}`);
  }

  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

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
 * Checks if a date is within a given range, considering timezone
 */
export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date,
  timezone: string = 'UTC'
): boolean => {
  const zonedDate = utcToZonedTime(date, timezone);
  const zonedStart = utcToZonedTime(startDate, timezone);
  const zonedEnd = utcToZonedTime(endDate, timezone);
  
  return zonedDate >= zonedStart && zonedDate <= zonedEnd;
};

/**
 * Gets the next date with a specific time, considering timezone
 */
export const getNextDateWithTime = (
  time: string,
  timezone: string = 'UTC'
): Date => {
  if (!isValidTimeFormat(time)) {
    throw new TimeFormatError(`Invalid time format: ${time}. Expected format: HH:mm`);
  }

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const zonedNow = utcToZonedTime(now, timezone);
  
  let nextDate = new Date(
    zonedNow.getFullYear(),
    zonedNow.getMonth(),
    zonedNow.getDate(),
    hours,
    minutes,
    0,
    0
  );

  if (nextDate <= zonedNow) {
    nextDate = addDays(nextDate, 1);
  }

  return zonedTimeToUtc(nextDate, timezone);
};

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
 * Gets ISO week number for a given date
 */
export const getWeekNumber = (date: Date, timezone: string = 'UTC'): number => {
  const zonedDate = utcToZonedTime(date, timezone);
  return getISOWeek(zonedDate);
};

/**
 * Validates and parses an ISO date string
 * @throws {Error} If date string is invalid
 */
export const parseAndValidateDate = (dateStr: string): Date => {
  const date = parseISO(dateStr);
  if (!isValid(date)) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }
  return date;
};

/**
 * Formats a date to ISO string with timezone consideration
 */
export const formatDateWithZone = (
  date: Date,
  timezone: string = 'UTC',
  formatStr: string = "yyyy-MM-dd'T'HH:mm:ssXXX"
): string => {
  const zonedDate = utcToZonedTime(date, timezone);
  return format(zonedDate, formatStr);
}; 