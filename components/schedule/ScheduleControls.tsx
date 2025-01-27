import React from 'react';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { ScheduleControlsProps, ViewMode } from './types';

export function ScheduleControls({
  viewMode,
  onViewModeChange,
  onDateChange,
  onRefresh
}: ScheduleControlsProps) {
  const handleNavigate = (direction: 'prev' | 'next') => {
    const modifier = direction === 'next' ? 1 : -1;
    switch (viewMode) {
      case 'day':
        onDateChange(new Date(addDays(new Date(), modifier)));
        break;
      case 'week':
        onDateChange(new Date(addWeeks(new Date(), modifier)));
        break;
      case 'month':
        onDateChange(new Date(addMonths(new Date(), modifier)));
        break;
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      {/* Navigation controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleNavigate('prev')}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Previous"
        >
          ←
        </button>
        <button
          onClick={() => handleNavigate('next')}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Next"
        >
          →
        </button>
        <button
          onClick={handleToday}
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Today
        </button>
      </div>

      {/* View mode selector */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
        {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`
              px-3 py-1 text-sm font-medium rounded-md capitalize
              ${viewMode === mode
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        title="Refresh"
      >
        <RefreshIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

function RefreshIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
} 