'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { useErrorBoundary } from 'react-error-boundary';
import { useHealthMonitor } from '@/hooks/use-health-monitor';
import type { 
  Schedule, 
  Employee, 
  Shift 
} from '@/services/scheduler/types';
import ShiftBlock from './ShiftBlock';

interface TimeSlotProps {
  date: Date;
  hour: number;
  schedules: Schedule[];
  shifts: Shift[];
  employees: Employee[];
  isEditable: boolean;
  onAssignShift?: (employeeId: string, shiftId: string, date: Date) => Promise<void>;
}

interface DragItem {
  type: 'EMPLOYEE';
  employeeId: string;
}

// Memoized current hour check
const useIsCurrentHour = (hour: number) => {
  return useMemo(() => {
    const now = new Date();
    return now.getHours() === hour;
  }, [hour]);
};

export default function TimeSlot({
  date,
  hour,
  schedules,
  shifts,
  employees,
  isEditable,
  onAssignShift
}: TimeSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { showBoundary } = useErrorBoundary();
  const { trackError } = useHealthMonitor();
  const isCurrentHourValue = useIsCurrentHour(hour);

  // Memoize the drop handler
  const handleDrop = useCallback((item: DragItem) => {
    if (!onAssignShift) return;

    // Find the most appropriate shift starting at this hour
    const availableShift = shifts.find(s => {
      const [shiftHour] = s.start_time.split(':').map(Number);
      return shiftHour === hour;
    });

    if (!availableShift) {
      toast({
        title: 'No Available Shift',
        description: 'No shift is available for this time slot.',
        variant: 'destructive',
      });
      return;
    }

    // Handle the assignment asynchronously
    onAssignShift(item.employeeId, availableShift.id, date)
      .then(() => {
        toast({
          title: 'Shift Assigned',
          description: 'The shift has been successfully assigned.',
        });
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({
          title: 'Error Assigning Shift',
          description: errorMessage,
          variant: 'destructive',
        });
        trackError('SCHEDULE', 'SHIFT_ASSIGNMENT', {
          error: errorMessage,
          employeeId: item.employeeId,
          date: date.toISOString(),
          hour,
        });
        showBoundary(error);
      });
  }, [onAssignShift, shifts, hour, date, toast, trackError, showBoundary]);

  // Memoize the canDrop check
  const canDropCheck = useCallback(() => {
    if (!isEditable) return false;
    return !schedules.some(s => {
      const shift = shifts.find(sh => sh.id === s.shift_id);
      if (!shift) return false;
      const [shiftHour] = shift.start_time.split(':').map(Number);
      return shiftHour === hour;
    });
  }, [isEditable, schedules, shifts, hour]);

  const [{ isOver, canDrop }, drop] = useDrop<
    DragItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: 'EMPLOYEE',
    drop: handleDrop,
    canDrop: canDropCheck,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  // Connect the drop ref to our element ref
  drop(ref);

  // Memoize filtered schedules
  const timeSlotSchedules = useMemo(() => 
    schedules.filter(schedule => {
      const shift = shifts.find(s => s.id === schedule.shift_id);
      if (!shift) return false;
      const shiftHour = parseInt(shift.start_time.split(':')[0]);
      return shiftHour === hour;
    }),
    [schedules, shifts, hour]
  );

  return (
    <div
      ref={ref}
      className={`
        relative h-16 border-b border-gray-200 p-2
        ${isOver && canDrop ? 'bg-blue-50' : ''}
        ${canDrop ? 'bg-gray-50' : ''}
      `}
      role="gridcell"
      aria-label={`Time slot for ${format(date, 'MMM d')} at ${format(new Date().setHours(hour), 'ha')}`}
    >
      {/* Current hour indicator */}
      {isCurrentHourValue && (
        <div 
          className="absolute inset-0 bg-yellow-100 opacity-20"
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Time slot label */}
      <div className="text-xs text-gray-400">
        {format(new Date().setHours(hour), 'ha')}
      </div>

      {/* Scheduled shifts */}
      {timeSlotSchedules.map(schedule => {
        const employee = employees.find(e => e.id === schedule.employee_id);
        const shift = shifts.find(s => s.id === schedule.shift_id);
        
        if (!employee || !shift) return null;

        return (
          <ShiftBlock
            key={schedule.id}
            schedule={schedule}
            shift={shift}
            employee={employee}
            isEditable={isEditable}
          />
        );
      })}
    </div>
  );
} 