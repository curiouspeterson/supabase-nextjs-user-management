import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ShiftBlock } from '@/components/schedule/ShiftBlock';
import { mockEmployee, mockShift, mockSchedule } from '@/lib/test-utils';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

describe('ShiftBlock', () => {
  const defaultProps = {
    schedule: mockSchedule({
      date: '2025-01-01',
      employee_id: 'test-employee-1',
      shift_id: 'test-shift-1'
    }),
    shift: mockShift({
      id: 'test-shift-1',
      start_time: '07:00:00',
      end_time: '17:00:00',
      duration_hours: 10
    }),
    employee: mockEmployee({
      id: 'test-employee-1',
      employee_role: 'Dispatcher',
      first_name: 'John',
      last_name: 'Doe'
    }),
    isEditable: true,
    onRemove: jest.fn()
  };

  it('renders shift block with correct employee information', () => {
    render(
      <TestWrapper>
        <ShiftBlock {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Dispatcher')).toBeInTheDocument();
  });

  it('displays correct shift times', () => {
    render(
      <TestWrapper>
        <ShiftBlock {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByText('7am - 5pm')).toBeInTheDocument();
  });

  it('shows duration badge for long shifts', () => {
    const longShift = {
      ...defaultProps.shift,
      duration_hours: 12
    };
    
    render(
      <TestWrapper>
        <ShiftBlock {...defaultProps} shift={longShift} />
      </TestWrapper>
    );
    
    expect(screen.getByText('12h')).toBeInTheDocument();
  });

  it('shows remove button when editable', () => {
    render(
      <TestWrapper>
        <ShiftBlock {...defaultProps} isEditable={true} />
      </TestWrapper>
    );
    
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('does not show remove button when not editable', () => {
    render(
      <TestWrapper>
        <ShiftBlock {...defaultProps} isEditable={false} />
      </TestWrapper>
    );
    
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = jest.fn();
    render(
      <TestWrapper>
        <ShiftBlock {...defaultProps} onRemove={onRemove} />
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('applies correct background color based on employee role', () => {
    render(
      <TestWrapper>
        <ShiftBlock {...defaultProps} />
      </TestWrapper>
    );
    
    const shiftBlock = screen.getByTestId('shift-block');
    expect(shiftBlock).toHaveClass('bg-blue-100'); // Assuming Dispatcher role gets blue background
  });

  it('applies draggable styles when editable', () => {
    render(
      <TestWrapper>
        <ShiftBlock {...defaultProps} isEditable={true} />
      </TestWrapper>
    );
    
    const shiftBlock = screen.getByTestId('shift-block');
    expect(shiftBlock).toHaveClass('cursor-move');
  });

  // Note: Actual drag and drop testing would require more complex setup with react-dnd-test-utils
  // This is a basic structure that should be expanded with proper drag and drop testing
}); 