import React from 'react';
import { useDrag, DragSourceMonitor } from 'react-dnd';
import { format } from 'date-fns';
import { ShiftBlockProps } from './types';

export function ShiftBlock({
  schedule,
  shift,
  employee,
  isEditable,
  onRemove
}: ShiftBlockProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'SHIFT',
    item: {
      type: 'SHIFT',
      id: schedule.id,
      shiftId: shift.id,
      employeeId: employee.id,
      sourceDate: new Date(schedule.date)
    },
    canDrag: () => isEditable === true,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  // Calculate shift duration for styling
  const startHour = parseInt(shift.start_time.split(':')[0]);
  const endHour = parseInt(shift.end_time.split(':')[0]);
  const duration = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour;

  // Determine background color based on shift type and employee role
  const getBgColor = () => {
    if (employee.employee_role === 'Shift Supervisor') {
      return 'bg-purple-100 border-purple-300';
    }
    switch (shift.duration_category) {
      case '12 hours':
        return 'bg-blue-100 border-blue-300';
      case '10 hours':
        return 'bg-green-100 border-green-300';
      case '4 hours':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div
      ref={drag}
      className={`
        ${getBgColor()}
        rounded-md border p-1 cursor-pointer
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isEditable ? 'hover:shadow-md transition-shadow' : ''}
        relative group
      `}
      style={{
        height: `${Math.min(duration * 4, 16)}rem`
      }}
    >
      {/* Employee info */}
      <div className="text-xs font-medium truncate">
        {employee.employee_role === 'Shift Supervisor' && (
          <span className="mr-1 text-purple-600">👑</span>
        )}
        {employee.user_role}
      </div>

      {/* Shift time */}
      <div className="text-xs text-gray-600">
        {format(new Date(`2000-01-01T${shift.start_time}`), 'ha')} -
        {format(new Date(`2000-01-01T${shift.end_time}`), 'ha')}
      </div>

      {/* Duration badge */}
      <div className="absolute bottom-1 right-1 text-xs px-1 rounded bg-white/50">
        {shift.duration_hours}h
      </div>

      {/* Remove button */}
      {isEditable && onRemove && (
        <button
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-1 -right-1 hidden group-hover:flex h-5 w-5 items-center justify-center
                     bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
        >
          ×
        </button>
      )}
    </div>
  );
} 