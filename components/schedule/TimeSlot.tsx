'use client';

import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { format } from 'date-fns';
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
  const [{ isOver, canDrop }, drop] = useDrop<
    DragItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: 'EMPLOYEE',
    drop: (item) => {
      if (onAssignShift) {
        // Find the most appropriate shift starting at this hour
        const availableShift = shifts.find(s => {
          const [shiftHour] = s.start_time.split(':').map(Number);
          return shiftHour === hour;
        });

        if (availableShift) {
          // Call onAssignShift and handle any errors
          onAssignShift(item.employeeId, availableShift.id, date).catch(error => {
            console.error('Error assigning shift:', error);
          });
        }
      }
    },
    canDrop: () => isEditable && !schedules.some(s => {
      const shift = shifts.find(sh => sh.id === s.shift_id);
      if (!shift) return false;
      const [shiftHour] = shift.start_time.split(':').map(Number);
      return shiftHour === hour;
    }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  // Connect the drop ref to our element ref
  drop(ref);

  // Find schedules that start in this time slot
  const timeSlotSchedules = schedules.filter(schedule => {
    const shift = shifts.find(s => s.id === schedule.shift_id);
    if (!shift) return false;
    
    const shiftHour = parseInt(shift.start_time.split(':')[0]);
    return shiftHour === hour;
  });

  return (
    <div
      ref={ref}
      className={`
        h-16 border-b border-gray-200 p-2
        ${isOver && canDrop ? 'bg-blue-50' : ''}
        ${canDrop ? 'bg-gray-50' : ''}
      `}
    >
      {/* Current hour indicator */}
      {isCurrentHour(hour) && (
        <div className="absolute inset-0 bg-yellow-100 opacity-20"></div>
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

function isCurrentHour(hour: number): boolean {
  const now = new Date();
  return now.getHours() === hour;
} 