import React from 'react';
import { render, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TimeSlot } from '@/components/schedule/TimeSlot';
import { mockEmployee, mockShift, mockSchedule } from '@/lib/test-utils';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

describe('TimeSlot', () => {
  const defaultProps = {
    date: new Date('2025-01-01'),
    hour: 7,
    schedules: [
      mockSchedule({
        date: '2025-01-01',
        employee_id: 'test-employee-1',
        shift_id: 'test-shift-1'
      })
    ],
    shifts: [
      mockShift({
        id: 'test-shift-1',
        start_time: '07:00:00',
        end_time: '17:00:00',
        duration_hours: 10
      })
    ],
    employees: [
      mockEmployee({
        id: 'test-employee-1',
        employee_role: 'Dispatcher'
      })
    ],
    isEditable: true,
    onAssignShift: jest.fn()
  };

  it('renders time slot with correct hour', () => {
    render(
      <TestWrapper>
        <TimeSlot {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByText('7am')).toBeInTheDocument();
  });

  it('displays shift block when schedule exists for the time slot', () => {
    render(
      <TestWrapper>
        <TimeSlot {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Dispatcher')).toBeInTheDocument();
    expect(screen.getByText('7am - 5pm')).toBeInTheDocument();
  });

  it('shows current hour indicator when appropriate', () => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    
    render(
      <TestWrapper>
        <TimeSlot
          {...defaultProps}
          date={currentDate}
          hour={currentHour}
        />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('current-hour-indicator')).toBeInTheDocument();
  });

  it('does not show shift block when no schedule exists', () => {
    render(
      <TestWrapper>
        <TimeSlot
          {...defaultProps}
          schedules={[]}
        />
      </TestWrapper>
    );
    
    expect(screen.queryByText('Dispatcher')).not.toBeInTheDocument();
  });

  it('applies editable styles when isEditable is true', () => {
    render(
      <TestWrapper>
        <TimeSlot {...defaultProps} isEditable={true} />
      </TestWrapper>
    );
    
    const timeSlot = screen.getByTestId('time-slot');
    expect(timeSlot).toHaveClass('cursor-pointer');
  });

  it('applies non-editable styles when isEditable is false', () => {
    render(
      <TestWrapper>
        <TimeSlot {...defaultProps} isEditable={false} />
      </TestWrapper>
    );
    
    const timeSlot = screen.getByTestId('time-slot');
    expect(timeSlot).not.toHaveClass('cursor-pointer');
  });

  // Note: Actual drag and drop testing would require more complex setup with react-dnd-test-utils
  // This is a basic structure that should be expanded with proper drag and drop testing
}); 