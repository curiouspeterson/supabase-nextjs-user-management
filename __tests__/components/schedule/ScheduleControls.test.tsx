import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleControls } from '@/components/schedule/ScheduleControls';
import { addDays, addWeeks, addMonths, startOfToday } from 'date-fns';

describe('ScheduleControls', () => {
  const defaultProps = {
    viewMode: 'week',
    onViewModeChange: jest.fn(),
    onDateChange: jest.fn(),
    onRefresh: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all view mode options', () => {
    render(<ScheduleControls {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /day/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument();
  });

  it('highlights current view mode', () => {
    render(<ScheduleControls {...defaultProps} viewMode="week" />);
    
    const weekButton = screen.getByRole('button', { name: /week/i });
    expect(weekButton).toHaveClass('bg-blue-500');
  });

  it('calls onViewModeChange when view mode is changed', () => {
    const onViewModeChange = jest.fn();
    render(
      <ScheduleControls
        {...defaultProps}
        onViewModeChange={onViewModeChange}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /day/i }));
    expect(onViewModeChange).toHaveBeenCalledWith('day');
  });

  it('calls onDateChange with previous date when previous button is clicked', () => {
    const onDateChange = jest.fn();
    const currentDate = new Date('2025-01-15');
    
    render(
      <ScheduleControls
        {...defaultProps}
        onDateChange={onDateChange}
        currentDate={currentDate}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(onDateChange).toHaveBeenCalledWith(addWeeks(currentDate, -1));
  });

  it('calls onDateChange with next date when next button is clicked', () => {
    const onDateChange = jest.fn();
    const currentDate = new Date('2025-01-15');
    
    render(
      <ScheduleControls
        {...defaultProps}
        onDateChange={onDateChange}
        currentDate={currentDate}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onDateChange).toHaveBeenCalledWith(addWeeks(currentDate, 1));
  });

  it('calls onDateChange with today when today button is clicked', () => {
    const onDateChange = jest.fn();
    render(
      <ScheduleControls
        {...defaultProps}
        onDateChange={onDateChange}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /today/i }));
    expect(onDateChange).toHaveBeenCalledWith(startOfToday());
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = jest.fn();
    render(
      <ScheduleControls
        {...defaultProps}
        onRefresh={onRefresh}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    expect(onRefresh).toHaveBeenCalled();
  });

  it('adjusts navigation based on day view', () => {
    const onDateChange = jest.fn();
    const currentDate = new Date('2025-01-15');
    
    render(
      <ScheduleControls
        {...defaultProps}
        viewMode="day"
        onDateChange={onDateChange}
        currentDate={currentDate}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onDateChange).toHaveBeenCalledWith(addDays(currentDate, 1));
  });

  it('adjusts navigation based on month view', () => {
    const onDateChange = jest.fn();
    const currentDate = new Date('2025-01-15');
    
    render(
      <ScheduleControls
        {...defaultProps}
        viewMode="month"
        onDateChange={onDateChange}
        currentDate={currentDate}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onDateChange).toHaveBeenCalledWith(addMonths(currentDate, 1));
  });

  it('displays current date in correct format', () => {
    const currentDate = new Date('2025-01-15');
    render(
      <ScheduleControls
        {...defaultProps}
        currentDate={currentDate}
      />
    );
    
    expect(screen.getByText(/January 2025/)).toBeInTheDocument();
  });
}); 