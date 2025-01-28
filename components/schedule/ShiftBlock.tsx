'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useDrag, DragSourceMonitor } from 'react-dnd';
import { format } from 'date-fns';
import type { 
  Schedule, 
  Employee, 
  Shift 
} from '@/services/scheduler/types';
import { useScheduleStore } from '@/lib/stores/schedule-store';
import { cn } from '@/lib/utils';

interface DragItem {
  type: 'SHIFT';
  scheduleId: string;
  shiftId: string;
  employeeId: string;
}

interface ShiftBlockProps {
  schedule: Schedule;
  shift: Shift;
  employee: Employee;
  isEditable: boolean;
  onRemove?: () => Promise<void>;
  startTime?: string;
  className?: string;
  overlappingShifts?: Shift[];
}

export default function ShiftBlock({
  schedule,
  shift,
  employee,
  isEditable,
  onRemove,
  startTime = '05:00',
  className,
  overlappingShifts = []
}: ShiftBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { selectedShift, setSelectedShift } = useScheduleStore();
  const [position, setPosition] = useState({ top: 0, height: 0 });

  const [{ isDragging }, dragRef] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >(() => ({
    type: 'SHIFT',
    item: { 
      type: 'SHIFT',
      scheduleId: schedule.id,
      shiftId: shift.id,
      employeeId: employee.id
    },
    canDrag: () => isEditable,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [schedule.id, shift.id, employee.id, isEditable]);

  // Connect the drag ref to our element ref
  dragRef(ref);

  // Calculate duration for styling
  const startHour = parseInt(shift.start_time.split(':')[0]);
  const endHour = parseInt(shift.end_time.split(':')[0]);
  const duration = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour;
  
  // Determine background color based on role and duration
  const getBgColor = () => {
    if (employee.employee_role === 'Shift Supervisor') {
      return 'bg-purple-100 border-purple-200';
    }
    switch (shift.duration_category) {
      case '12 hours':
        return 'bg-blue-100 border-blue-200';
      case '10 hours':
        return 'bg-green-100 border-green-200';
      case '8 hours':
        return 'bg-yellow-100 border-yellow-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  // Calculate position based on start time and handle overlaps
  useEffect(() => {
    const shiftStart = new Date(`1970-01-01T${shift.start_time}`);
    const shiftEnd = new Date(`1970-01-01T${shift.end_time}`);
    const dayStart = new Date(`1970-01-01T${startTime}`);

    // Calculate minutes from day start
    const minutesFromStart = (shiftStart.getTime() - dayStart.getTime()) / 1000 / 60;
    const duration = (shiftEnd.getTime() - shiftStart.getTime()) / 1000 / 60;

    // Handle overlapping shifts
    const overlapIndex = overlappingShifts.findIndex(s => s.id === shift.id);
    const overlapOffset = overlapIndex > 0 ? overlapIndex * 10 : 0; // Offset overlapping shifts

    setPosition({
      top: (minutesFromStart / 30) * 40, // 40px per 30 minutes
      height: (duration / 30) * 40
    });
  }, [shift, startTime, overlappingShifts]);

  const shiftStyle = useMemo(() => ({
    top: `${position.top}px`,
    height: `${position.height}px`,
    left: overlappingShifts.length > 1 ? `${overlappingShifts.findIndex(s => s.id === shift.id) * 10}px` : '0',
    width: overlappingShifts.length > 1 ? 'calc(100% - 10px)' : '100%',
    zIndex: overlappingShifts.findIndex(s => s.id === shift.id) + 1
  }), [position, shift, overlappingShifts]);

  return (
    <div
      ref={ref}
      className={cn(
        'absolute left-0 w-full rounded-md border bg-background p-2 shadow-sm transition-all hover:shadow-md',
        selectedShift?.id === shift.id && 'ring-2 ring-primary',
        className
      )}
      style={shiftStyle}
      onClick={() => setSelectedShift(shift)}
      role="button"
      tabIndex={0}
      aria-label={`Shift from ${format(new Date(`1970-01-01T${shift.start_time}`), 'h:mm a')} to ${format(new Date(`1970-01-01T${shift.end_time}`), 'h:mm a')}`}
    >
      <div className="flex flex-col space-y-1">
        <div className="text-xs font-medium">
          {format(new Date(`1970-01-01T${shift.start_time}`), 'h:mm a')} - 
          {format(new Date(`1970-01-01T${shift.end_time}`), 'h:mm a')}
        </div>
        {employee && (
          <div className="text-xs text-muted-foreground">
            {employee.first_name} {employee.last_name}
          </div>
        )}
        {overlappingShifts.length > 1 && (
          <div className="text-xs text-warning">
            {overlappingShifts.length - 1} overlapping {overlappingShifts.length - 1 === 1 ? 'shift' : 'shifts'}
          </div>
        )}
      </div>

      {/* Remove button */}
      {isEditable && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
        >
          ×
        </button>
      )}
    </div>
  );
} 