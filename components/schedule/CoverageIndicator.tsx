'use client';

import React from 'react';
import { format } from 'date-fns';

interface CoverageIndicatorProps {
  date: Date;
  period: string;
  required: number;
  actual: number;
  supervisors: number;
}

export default function CoverageIndicator({
  date,
  period,
  required,
  actual,
  supervisors
}: CoverageIndicatorProps) {
  // Calculate coverage percentage
  const coverage = (actual / required) * 100;
  
  // Determine status and color based on coverage
  const getStatus = () => {
    if (coverage >= 100 && supervisors > 0) {
      return {
        color: 'bg-green-100 border-green-200 text-green-800',
        text: 'Fully Staffed'
      };
    } else if (coverage >= 80) {
      return {
        color: 'bg-yellow-100 border-yellow-200 text-yellow-800',
        text: 'Partially Staffed'
      };
    } else {
      return {
        color: 'bg-red-100 border-red-200 text-red-800',
        text: 'Understaffed'
      };
    }
  };

  const status = getStatus();

  // Format period times
  const [startTime, endTime] = period.split('-');
  const formattedStart = format(new Date(`2000-01-01T${startTime}`), 'h:mma');
  const formattedEnd = format(new Date(`2000-01-01T${endTime}`), 'h:mma');

  return (
    <div className={`
      p-2 rounded-md border mb-2
      ${status.color}
    `}>
      {/* Period time range */}
      <div className="text-xs font-medium">
        {formattedStart} - {formattedEnd}
      </div>

      {/* Staffing numbers */}
      <div className="flex justify-between items-center mt-1">
        <div className="text-sm">
          {actual}/{required} Staff
        </div>
        <div className="text-xs">
          {supervisors} Supervisor{supervisors !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Coverage percentage */}
      <div className="mt-1 h-2 bg-white rounded-full overflow-hidden">
        <div 
          className="h-full bg-current transition-all duration-300"
          style={{ width: `${Math.min(coverage, 100)}%` }}
        />
      </div>

      {/* Status text */}
      <div className="text-xs mt-1">
        {status.text}
      </div>

      {/* Warning for no supervisors */}
      {supervisors === 0 && (
        <div className="text-xs mt-1 flex items-center text-red-600">
          <svg 
            className="w-4 h-4 mr-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          No supervisor assigned
        </div>
      )}
    </div>
  );
} 