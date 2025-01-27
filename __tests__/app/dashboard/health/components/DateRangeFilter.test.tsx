import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateRangeFilter from '@/app/dashboard/health/components/DateRangeFilter';
import { format, subDays, subHours, startOfDay, endOfDay } from 'date-fns';

// Mock date-fns functions to ensure consistent dates in tests
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  startOfDay: jest.fn((date) => date),
  endOfDay: jest.fn((date) => date)
}));

describe('DateRangeFilter', () => {
  const mockOnRangeChange = jest.fn();
  const currentDate = new Date('2024-03-01T12:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
    // Set a fixed date for all tests
    jest.useFakeTimers();
    jest.setSystemTime(currentDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render with default values', () => {
    render(<DateRangeFilter onRangeChange={mockOnRangeChange} />);

    expect(screen.getByText('Select range')).toBeInTheDocument();
    expect(screen.getByText(format(subDays(currentDate, 7), 'PPP'))).toBeInTheDocument();
    expect(screen.getByText(format(currentDate, 'PPP'))).toBeInTheDocument();
  });

  it('should handle preset range selection', async () => {
    render(<DateRangeFilter onRangeChange={mockOnRangeChange} />);

    // Open preset selector
    const selectTrigger = screen.getByRole('combobox');
    await userEvent.click(selectTrigger);

    // Select "Last 24 Hours"
    const option = screen.getByRole('option', { name: 'Last 24 Hours' });
    await userEvent.click(option);

    expect(mockOnRangeChange).toHaveBeenCalledWith(
      subHours(currentDate, 24),
      currentDate
    );
  });

  it('should handle custom date selection', async () => {
    render(<DateRangeFilter onRangeChange={mockOnRangeChange} />);

    // Open start date calendar
    const startDateButton = screen.getByRole('button', {
      name: new RegExp(format(subDays(currentDate, 7), 'PPP'))
    });
    await userEvent.click(startDateButton);

    // Select a new start date
    const newStartDate = subDays(currentDate, 14);
    const startDateOption = screen.getByRole('button', {
      name: format(newStartDate, 'd')
    });
    await userEvent.click(startDateOption);

    expect(mockOnRangeChange).toHaveBeenCalledWith(
      newStartDate,
      currentDate
    );
  });

  it('should prevent end date being before start date', async () => {
    render(<DateRangeFilter onRangeChange={mockOnRangeChange} />);

    // Open end date calendar
    const endDateButton = screen.getByRole('button', {
      name: new RegExp(format(currentDate, 'PPP'))
    });
    await userEvent.click(endDateButton);

    // Try to select a date before start date
    const invalidDate = subDays(currentDate, 14);
    const endDateOption = screen.getByRole('button', {
      name: format(invalidDate, 'd')
    });
    await userEvent.click(endDateOption);

    // Callback should not be called with invalid range
    expect(mockOnRangeChange).not.toHaveBeenCalledWith(
      expect.any(Date),
      invalidDate
    );
  });

  it('should prevent start date being after end date', async () => {
    render(<DateRangeFilter onRangeChange={mockOnRangeChange} />);

    // Open start date calendar
    const startDateButton = screen.getByRole('button', {
      name: new RegExp(format(subDays(currentDate, 7), 'PPP'))
    });
    await userEvent.click(startDateButton);

    // Try to select a date after end date
    const invalidDate = new Date('2024-03-15');
    const startDateOption = screen.getByRole('button', {
      name: format(invalidDate, 'd')
    });
    await userEvent.click(startDateOption);

    // Callback should not be called with invalid range
    expect(mockOnRangeChange).not.toHaveBeenCalledWith(
      invalidDate,
      expect.any(Date)
    );
  });

  it('should handle all preset ranges correctly', async () => {
    render(<DateRangeFilter onRangeChange={mockOnRangeChange} />);

    const presetRanges = [
      {
        label: 'Last 24 Hours',
        expectedStart: subHours(currentDate, 24)
      },
      {
        label: 'Last 7 Days',
        expectedStart: subDays(currentDate, 7)
      },
      {
        label: 'Last 30 Days',
        expectedStart: subDays(currentDate, 30)
      }
    ];

    for (const range of presetRanges) {
      // Open preset selector
      const selectTrigger = screen.getByRole('combobox');
      await userEvent.click(selectTrigger);

      // Select preset range
      const option = screen.getByRole('option', { name: range.label });
      await userEvent.click(option);

      expect(mockOnRangeChange).toHaveBeenCalledWith(
        range.expectedStart,
        currentDate
      );
    }
  });

  it('should update the date range display text', async () => {
    render(<DateRangeFilter onRangeChange={mockOnRangeChange} />);

    const newStartDate = subDays(currentDate, 14);

    // Open start date calendar
    const startDateButton = screen.getByRole('button', {
      name: new RegExp(format(subDays(currentDate, 7), 'PPP'))
    });
    await userEvent.click(startDateButton);

    // Select a new start date
    const startDateOption = screen.getByRole('button', {
      name: format(newStartDate, 'd')
    });
    await userEvent.click(startDateOption);

    expect(screen.getByText(format(newStartDate, 'PPP'))).toBeInTheDocument();
  });

  it('should close calendar popovers after date selection', async () => {
    render(<DateRangeFilter onRangeChange={mockOnRangeChange} />);

    // Open start date calendar
    const startDateButton = screen.getByRole('button', {
      name: new RegExp(format(subDays(currentDate, 7), 'PPP'))
    });
    await userEvent.click(startDateButton);

    // Select a date
    const dateOption = screen.getByRole('button', {
      name: format(subDays(currentDate, 14), 'd')
    });
    await userEvent.click(dateOption);

    // Calendar should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should handle invalid date inputs gracefully', async () => {
    render(<DateRangeFilter onRangeChange={mockOnRangeChange} />);

    // Try to select an undefined date
    const startDateButton = screen.getByRole('button', {
      name: new RegExp(format(subDays(currentDate, 7), 'PPP'))
    });
    await userEvent.click(startDateButton);

    // Mock calendar onSelect with undefined
    const calendar = screen.getByRole('grid');
    fireEvent.select(calendar, { target: { value: undefined } });

    // Callback should not be called with invalid date
    expect(mockOnRangeChange).not.toHaveBeenCalled();
  });
}); 