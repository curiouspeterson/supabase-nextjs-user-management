import React from 'react';
import { format } from 'date-fns';
import { CoverageIndicatorProps } from './types';

export function CoverageIndicator({
  date,
  period,
  required,
  actual,
  supervisors
}: CoverageIndicatorProps) {
  // Calculate coverage percentage
  const coverage = (actual / required) * 100;
  
  // Determine status and color
  const getStatus = () => {
    if (coverage < 80) return { color: 'red', text: 'Critical' };
    if (coverage < 100) return { color: 'yellow', text: 'Warning' };
    return { color: 'green', text: 'Good' };
  };

  const status = getStatus();

  // Format period times
  const [startTime, endTime] = period.split('-');
  const formattedStart = format(new Date(`2000-01-01T${startTime}`), 'ha');
  const formattedEnd = format(new Date(`2000-01-01T${endTime}`), 'ha');

  return (
    <div className="flex items-center gap-4 p-2 rounded-lg border border-gray-200">
      {/* Date and time */}
      <div className="flex-shrink-0">
        <div className="text-sm font-medium">
          {format(date, 'MMM d, yyyy')}
        </div>
        <div className="text-xs text-gray-500">
          {formattedStart} - {formattedEnd}
        </div>
      </div>

      {/* Coverage stats */}
      <div className="flex items-center gap-8">
        {/* Actual vs Required */}
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {actual}/{required}
          </div>
          <div className="text-xs text-gray-500">
            Staff
          </div>
        </div>

        {/* Supervisors */}
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {supervisors}
          </div>
          <div className="text-xs text-gray-500">
            Supervisors
          </div>
        </div>

        {/* Coverage percentage */}
        <div className="flex items-center gap-2">
          <div
            className={`
              text-sm font-medium px-2 py-1 rounded
              ${status.color === 'red' ? 'bg-red-100 text-red-700' : ''}
              ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${status.color === 'green' ? 'bg-green-100 text-green-700' : ''}
            `}
          >
            {Math.round(coverage)}%
          </div>
          <div className="text-xs text-gray-500">
            Coverage
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div
        className={`
          ml-auto px-3 py-1 rounded-full text-xs font-medium
          ${status.color === 'red' ? 'bg-red-100 text-red-700' : ''}
          ${status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
          ${status.color === 'green' ? 'bg-green-100 text-green-700' : ''}
        `}
      >
        {status.text}
      </div>

      {/* Warnings */}
      {supervisors === 0 && (
        <div className="ml-2 text-yellow-500" title="No supervisor coverage">
          ⚠️
        </div>
      )}
    </div>
  );
} 