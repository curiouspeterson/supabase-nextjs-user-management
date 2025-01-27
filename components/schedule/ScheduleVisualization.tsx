import React, { useState, useCallback, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleViewProps, ViewMode } from './types';
import { Schedule } from '@/services/scheduler/types';
import ShiftBlock from './ShiftBlock';
import CoverageIndicator from './CoverageIndicator';
import TimeSlot from './TimeSlot';
import ScheduleControls from './ScheduleControls';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface ScheduleVisualizationProps extends ScheduleViewProps {
  startDate: Date;
  schedules: Schedule[];
  shifts: any[];
  onRefresh: () => Promise<void>;
}

export function ScheduleVisualization({
  startDate,
  endDate,
  schedules,
  employees,
  shifts,
  coverage,
  onAssignShift,
  onRemoveShift,
  isEditable = false,
  onRefresh
}: ScheduleVisualizationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(startDate);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate view range based on mode
  const viewRange = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return { start: currentDate, end: currentDate };
      case 'week':
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        };
      case 'month':
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        return { start, end };
    }
  }, [currentDate, viewMode]);

  // Filter schedules within view range
  const visibleSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return isWithinInterval(scheduleDate, {
        start: viewRange.start,
        end: viewRange.end
      });
    });
  }, [schedules, viewRange]);

  // Group schedules by date and hour
  const scheduleMap = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    visibleSchedules.forEach(schedule => {
      const key = `${schedule.date}_${shifts.find(s => s.id === schedule.shift_id)?.start_time.split(':')[0] || '0'}`;
      const existing = map.get(key) || [];
      map.set(key, [...existing, schedule]);
    });
    return map;
  }, [visibleSchedules, shifts]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col w-full h-full">
        <ScheduleControls
          viewMode={viewMode}
          currentDate={currentDate}
          onViewModeChange={setViewMode}
          onDateChange={setCurrentDate}
          onRefresh={handleRefresh}
        />

        <div className="grid grid-cols-[auto,1fr] gap-4 mt-4">
          {/* Time labels */}
          <div className="flex flex-col">
            <div className="h-8" /> {/* Header spacer */}
            {HOURS.map(hour => (
              <div key={hour} className="h-16 flex items-center justify-end pr-2 text-sm text-gray-500">
                {format(new Date().setHours(hour), 'ha')}
              </div>
            ))}
          </div>

          {/* Schedule grid */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${viewMode === 'day' ? 1 : 7}, 1fr)` }}>
            {/* Day headers */}
            <div className="grid grid-cols-7 h-8">
              {DAYS.map(day => (
                <div key={day} className="flex items-center justify-center text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="grid grid-cols-7">
              {Array.from({ length: viewMode === 'day' ? 1 : 7 }).map((_, dayIndex) => (
                <div key={dayIndex} className="border-r border-gray-200">
                  {HOURS.map(hour => {
                    const date = addDays(viewRange.start, dayIndex);
                    const key = `${format(date, 'yyyy-MM-dd')}_${hour}`;
                    const slotSchedules = scheduleMap.get(key) || [];

                    return (
                      <TimeSlot
                        key={`${key}_${hour}`}
                        date={date}
                        hour={hour}
                        schedules={slotSchedules}
                        shifts={shifts}
                        employees={employees}
                        isEditable={isEditable}
                        onAssignShift={onAssignShift}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coverage indicators */}
        <div className="mt-4">
          {Object.entries(coverage).map(([date, report]) => (
            <div key={date} className="mb-2">
              {Object.entries(report.periods).map(([period, stats]) => (
                <CoverageIndicator
                  key={`${date}_${period}`}
                  date={new Date(date)}
                  period={period}
                  required={stats.required}
                  actual={stats.actual}
                  supervisors={stats.supervisors}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
} 