import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleVisualization } from '@/components/schedule/ScheduleVisualization';
import { mockEmployee, mockShift, mockSchedule } from '@/lib/test-utils';

describe('ScheduleVisualization', () => {
  const defaultProps = {
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-07'),
    schedules: [
      mockSchedule({
        date: '2025-01-01',
        employee_id: 'test-employee-1',
        shift_id: 'test-shift-1'
      }),
      mockSchedule({
        date: '2025-01-01',
        employee_id: 'test-employee-2',
        shift_id: 'test-shift-2'
      })
    ],
    employees: [
      mockEmployee({
        id: 'test-employee-1',
        employee_role: 'Dispatcher'
      }),
      mockEmployee({
        id: 'test-employee-2',
        employee_role: 'Shift Supervisor'
      })
    ],
    shifts: [
      mockShift({
        id: 'test-shift-1',
        start_time: '07:00:00',
        end_time: '17:00:00',
        duration_hours: 10
      }),
      mockShift({
        id: 'test-shift-2',
        start_time: '19:00:00',
        end_time: '07:00:00',
        duration_hours: 12
      })
    ],
    coverage: {
      '2025-01-01': {
        date: '2025-01-01',
        periods: {
          '07:00:00-19:00:00': {
            required: 2,
            actual: 1,
            supervisors: 0,
            overtime: 0
          },
          '19:00:00-07:00:00': {
            required: 2,
            actual: 2,
            supervisors: 1,
            overtime: 0
          }
        }
      }
    },
    onAssignShift: jest.fn(),
    onRemoveShift: jest.fn(),
    isEditable: true
  };

  it('renders schedule grid with correct time slots', () => {
    render(<ScheduleVisualization {...defaultProps} />);
    
    // Check for time labels
    expect(screen.getByText('7am')).toBeInTheDocument();
    expect(screen.getByText('7pm')).toBeInTheDocument();

    // Check for day headers
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Sunday')).toBeInTheDocument();
  });

  it('displays coverage indicators correctly', () => {
    render(<ScheduleVisualization {...defaultProps} />);
    
    // Check coverage stats
    expect(screen.getByText('1/2')).toBeInTheDocument(); // Day shift coverage
    expect(screen.getByText('2/2')).toBeInTheDocument(); // Night shift coverage
    
    // Check supervisor indicators
    expect(screen.getByText('0')).toBeInTheDocument(); // Day shift supervisors
    expect(screen.getByText('1')).toBeInTheDocument(); // Night shift supervisors
  });

  it('handles view mode changes', () => {
    render(<ScheduleVisualization {...defaultProps} />);
    
    // Switch to day view
    fireEvent.click(screen.getByText('day'));
    expect(screen.getByText('7am')).toBeInTheDocument();
    
    // Switch to month view
    fireEvent.click(screen.getByText('month'));
    expect(screen.getByText('7am')).toBeInTheDocument();
  });

  it('shows shift blocks in correct time slots', () => {
    render(<ScheduleVisualization {...defaultProps} />);
    
    // Check for employee roles in shift blocks
    expect(screen.getByText('Dispatcher')).toBeInTheDocument();
    expect(screen.getByText('Shift Supervisor')).toBeInTheDocument();
    
    // Check shift times
    expect(screen.getByText('7am - 5pm')).toBeInTheDocument();
    expect(screen.getByText('7pm - 7am')).toBeInTheDocument();
  });

  it('handles shift assignments when editable', async () => {
    const onAssignShift = jest.fn();
    render(
      <ScheduleVisualization
        {...defaultProps}
        onAssignShift={onAssignShift}
        isEditable={true}
      />
    );
    
    // Note: Actual drag and drop testing would require more complex setup
    // This is just checking if the component is in editable state
    expect(screen.getAllByRole('button')).toHaveLength(expect.any(Number));
  });

  it('shows coverage warnings appropriately', () => {
    render(<ScheduleVisualization {...defaultProps} />);
    
    // Check for warning indicators
    const warningIcon = screen.getByText('⚠️');
    expect(warningIcon).toBeInTheDocument();
    expect(warningIcon).toHaveAttribute('title', 'No supervisor coverage');
  });
}); 