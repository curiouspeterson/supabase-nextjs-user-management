'use client';

import React, { useRef } from 'react';
import { useDrag, DragSourceMonitor } from 'react-dnd';
import { format } from 'date-fns';
import type { 
  Schedule, 
  Employee, 
  Shift 
} from '@/services/scheduler/types';

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
}

export default function ShiftBlock({
  schedule,
  shift,
  employee,
  isEditable,
  onRemove
}: ShiftBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  
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

  return (
    <div
      ref={ref}
      className={`
        relative p-2 rounded-md border
        ${getBgColor()}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isEditable ? 'cursor-move' : ''}
        transition-all duration-200
      `}
      style={{
        height: `${Math.max(duration * 4, 4)}rem`
      }}
    >
      {/* Employee name */}
      <div className="text-sm font-medium truncate">
        {employee.employee_role}
      </div>

      {/* Shift times */}
      <div className="text-xs text-gray-600">
        {format(new Date(`2000-01-01T${shift.start_time}`), 'h:mma')} -
        {format(new Date(`2000-01-01T${shift.end_time}`), 'h:mma')}
      </div>

      {/* Duration badge */}
      <div className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
        {shift.duration_category}
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