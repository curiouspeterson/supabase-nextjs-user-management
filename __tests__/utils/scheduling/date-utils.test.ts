import {
  parseTimeToMs,
  formatMsToTime,
  getHoursBetween,
  getDatesBetween,
  calculateWorkingDays,
  doTimeRangesOverlap,
  isDateInRange,
  getNextDateWithTime,
  getConsecutiveWorkingDays,
  groupDatesByWeek,
  isWeekend,
  getWeekNumber
} from '../../../utils/scheduling/date-utils';

describe('Date Utils', () => {
  describe('parseTimeToMs', () => {
    it('should parse time string to milliseconds', () => {
      expect(parseTimeToMs('00:00')).toBe(0);
      expect(parseTimeToMs('01:00')).toBe(3600000);
      expect(parseTimeToMs('01:30')).toBe(5400000);
      expect(parseTimeToMs('23:59')).toBe(86340000);
    });
  });

  describe('formatMsToTime', () => {
    it('should format milliseconds to time string', () => {
      expect(formatMsToTime(0)).toBe('00:00');
      expect(formatMsToTime(3600000)).toBe('01:00');
      expect(formatMsToTime(5400000)).toBe('01:30');
      expect(formatMsToTime(86340000)).toBe('23:59');
    });
  });

  describe('getHoursBetween', () => {
    it('should calculate hours between dates', () => {
      const start = new Date('2024-01-01T09:00:00');
      const end = new Date('2024-01-01T17:00:00');
      expect(getHoursBetween(start, end)).toBe(8);
    });

    it('should handle dates across days', () => {
      const start = new Date('2024-01-01T20:00:00');
      const end = new Date('2024-01-02T04:00:00');
      expect(getHoursBetween(start, end)).toBe(8);
    });
  });

  describe('getDatesBetween', () => {
    it('should return array of dates between start and end', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-03');
      const dates = getDatesBetween(start, end);
      
      expect(dates.length).toBe(3);
      expect(dates[0].toISOString().split('T')[0]).toBe('2024-01-01');
      expect(dates[1].toISOString().split('T')[0]).toBe('2024-01-02');
      expect(dates[2].toISOString().split('T')[0]).toBe('2024-01-03');
    });

    it('should handle same start and end date', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-01');
      const dates = getDatesBetween(start, end);
      
      expect(dates.length).toBe(1);
      expect(dates[0].toISOString().split('T')[0]).toBe('2024-01-01');
    });
  });

  describe('calculateWorkingDays', () => {
    it('should calculate working days based on pattern', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      const rotationStartDate = new Date('2024-01-01');
      const daysOn = 4;
      const daysOff = 3;

      const workingDays = calculateWorkingDays(
        startDate,
        endDate,
        rotationStartDate,
        daysOn,
        daysOff
      );

      expect(workingDays.length).toBe(4);
      expect(workingDays[0].toISOString().split('T')[0]).toBe('2024-01-01');
      expect(workingDays[3].toISOString().split('T')[0]).toBe('2024-01-04');
    });

    it('should handle mid-cycle start date', () => {
      const startDate = new Date('2024-01-03');
      const endDate = new Date('2024-01-09');
      const rotationStartDate = new Date('2024-01-01');
      const daysOn = 4;
      const daysOff = 3;

      const workingDays = calculateWorkingDays(
        startDate,
        endDate,
        rotationStartDate,
        daysOn,
        daysOff
      );

      expect(workingDays.length).toBe(2);
      expect(workingDays[0].toISOString().split('T')[0]).toBe('2024-01-03');
      expect(workingDays[1].toISOString().split('T')[0]).toBe('2024-01-04');
    });
  });

  describe('doTimeRangesOverlap', () => {
    it('should detect overlapping time ranges', () => {
      expect(doTimeRangesOverlap('09:00', '17:00', '12:00', '20:00')).toBe(true);
      expect(doTimeRangesOverlap('09:00', '17:00', '17:00', '20:00')).toBe(true);
      expect(doTimeRangesOverlap('09:00', '17:00', '17:01', '20:00')).toBe(false);
    });
  });

  describe('isDateInRange', () => {
    it('should check if date is within range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const date = new Date('2024-01-15');
      const outside = new Date('2024-02-01');

      expect(isDateInRange(date, start, end)).toBe(true);
      expect(isDateInRange(outside, start, end)).toBe(false);
    });
  });

  describe('getNextDateWithTime', () => {
    it('should get next date with specified time', () => {
      const date = new Date('2024-01-01T15:00:00');
      const nextNine = getNextDateWithTime(date, '09:00');
      expect(nextNine.toISOString()).toBe('2024-01-02T09:00:00.000Z');
    });

    it('should handle same day if time is later', () => {
      const date = new Date('2024-01-01T09:00:00');
      const nextSeventeen = getNextDateWithTime(date, '17:00');
      expect(nextSeventeen.toISOString()).toBe('2024-01-01T17:00:00.000Z');
    });
  });

  describe('getConsecutiveWorkingDays', () => {
    it('should calculate maximum consecutive working days', () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        new Date('2024-01-03'),
        new Date('2024-01-05'),
        new Date('2024-01-06')
      ];

      expect(getConsecutiveWorkingDays(dates)).toBe(3);
    });

    it('should handle empty dates array', () => {
      expect(getConsecutiveWorkingDays([])).toBe(0);
    });
  });

  describe('groupDatesByWeek', () => {
    it('should group dates by week', () => {
      const dates = [
        new Date('2024-01-01'), // Monday
        new Date('2024-01-03'), // Wednesday
        new Date('2024-01-07'), // Sunday
        new Date('2024-01-08')  // Monday (next week)
      ];

      const grouped = groupDatesByWeek(dates);
      expect(Object.keys(grouped).length).toBe(2);
      expect(grouped['2023-12-31'].length).toBe(3); // Week starting Sunday Dec 31
      expect(grouped['2024-01-07'].length).toBe(1); // Week starting Sunday Jan 7
    });
  });

  describe('isWeekend', () => {
    it('should identify weekend days', () => {
      expect(isWeekend(new Date('2024-01-06'))).toBe(true); // Saturday
      expect(isWeekend(new Date('2024-01-07'))).toBe(true); // Sunday
      expect(isWeekend(new Date('2024-01-08'))).toBe(false); // Monday
    });
  });

  describe('getWeekNumber', () => {
    it('should calculate week number', () => {
      expect(getWeekNumber(new Date('2024-01-01'))).toBe(1);
      expect(getWeekNumber(new Date('2024-07-01'))).toBe(27);
      expect(getWeekNumber(new Date('2024-12-31'))).toBe(53);
    });
  });
}); 