'use client';

import React from 'react';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

interface ScheduleControlsProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode?: 'day' | 'week' | 'month';
  onViewModeChange?: (mode: 'day' | 'week' | 'month') => void;
  onRefresh?: () => Promise<void>;
}

export default function ScheduleControls({
  currentDate,
  onDateChange,
  viewMode = 'week',
  onViewModeChange,
  onRefresh
}: ScheduleControlsProps) {
  // Navigation functions
  const goToPrevious = () => {
    switch (viewMode) {
      case 'day':
        onDateChange(addDays(currentDate, -1));
        break;
      case 'week':
        onDateChange(addWeeks(currentDate, -1));
        break;
      case 'month':
        onDateChange(addMonths(currentDate, -1));
        break;
    }
  };

  const goToNext = () => {
    switch (viewMode) {
      case 'day':
        onDateChange(addDays(currentDate, 1));
        break;
      case 'week':
        onDateChange(addWeeks(currentDate, 1));
        break;
      case 'month':
        onDateChange(addMonths(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      {/* Navigation controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={goToPrevious}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={goToToday}
          className="px-3 py-1 text-sm hover:bg-gray-100 rounded-md"
        >
          Today
        </button>

        <button
          onClick={goToNext}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <span className="ml-4 text-lg font-semibold">
          {format(currentDate, 'MMMM d, yyyy')}
        </span>
      </div>

      {/* View mode selector */}
      {onViewModeChange && (
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {(['day', 'week', 'month'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`
                px-3 py-1 text-sm rounded-md capitalize transition-colors
                ${viewMode === mode
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-gray-200'
                }
              `}
            >
              {mode}
            </button>
          ))}
        </div>
      )}

      {/* Refresh button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      )}
    </div>
  );
} 