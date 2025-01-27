import React from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { format } from 'date-fns';
import { TimeSlotProps, DragItem } from './types';
import { ShiftBlock } from './ShiftBlock';

export function TimeSlot({
  date,
  hour,
  schedules,
  shifts,
  employees,
  isEditable,
  onAssignShift
}: TimeSlotProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'SHIFT',
    canDrop: (item: DragItem) => {
      // Check if the time slot can accept the shift
      const shift = shifts.find(s => s.id === item.shiftId);
      if (!shift) return false;

      // Check if the hour matches the shift start time
      const shiftHour = parseInt(shift.start_time.split(':')[0]);
      return shiftHour === hour;
    },
    drop: (item: DragItem) => {
      if (onAssignShift) {
        onAssignShift(item.employeeId, item.shiftId, date);
      }
    },
    collect: (monitor: DropTargetMonitor<DragItem>) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  // Get the schedules that start in this time slot
  const slotSchedules = schedules.filter(schedule => {
    const shift = shifts.find(s => s.id === schedule.shift_id);
    if (!shift) return false;
    return parseInt(shift.start_time.split(':')[0]) === hour;
  });

  return (
    <div
      ref={drop}
      className={`
        h-16 border-b border-gray-200 p-1 relative
        ${isOver && canDrop ? 'bg-blue-50' : ''}
        ${isOver && !canDrop ? 'bg-red-50' : ''}
        ${!isOver && canDrop ? 'bg-gray-50' : ''}
      `}
    >
      {/* Current time indicator */}
      {isCurrentHour(date, hour) && (
        <div className="absolute left-0 top-0 w-1 h-full bg-blue-500" />
      )}

      {/* Shift blocks */}
      <div className="flex flex-col gap-1">
        {slotSchedules.map(schedule => {
          const shift = shifts.find(s => s.id === schedule.shift_id);
          const employee = employees.find(e => e.id === schedule.employee_id);
          
          if (!shift || !employee) return null;

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

      {/* Time slot label */}
      <div className="absolute bottom-0 right-1 text-xs text-gray-400">
        {format(new Date().setHours(hour), 'ha')}
      </div>
    </div>
  );
}

function isCurrentHour(date: Date, hour: number): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate() &&
    now.getHours() === hour
  );
} 