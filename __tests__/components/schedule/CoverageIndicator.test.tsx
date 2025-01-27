import React from 'react';
import { render, screen } from '@testing-library/react';
import { CoverageIndicator } from '@/components/schedule/CoverageIndicator';

describe('CoverageIndicator', () => {
  const defaultProps = {
    date: new Date('2025-01-01'),
    period: '07:00:00-19:00:00',
    required: 2,
    actual: 1,
    supervisors: 0,
    overtime: 0
  };

  it('renders coverage ratio correctly', () => {
    render(<CoverageIndicator {...defaultProps} />);
    
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('shows warning when no supervisors are scheduled', () => {
    render(<CoverageIndicator {...defaultProps} supervisors={0} />);
    
    const warningIcon = screen.getByText('⚠️');
    expect(warningIcon).toBeInTheDocument();
    expect(warningIcon).toHaveAttribute('title', 'No supervisor coverage');
  });

  it('does not show warning when supervisors are scheduled', () => {
    render(<CoverageIndicator {...defaultProps} supervisors={1} />);
    
    expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
  });

  it('displays period time range correctly', () => {
    render(<CoverageIndicator {...defaultProps} />);
    
    expect(screen.getByText('7am - 7pm')).toBeInTheDocument();
  });

  it('shows critical status when coverage is below 50%', () => {
    render(
      <CoverageIndicator
        {...defaultProps}
        required={4}
        actual={1}
      />
    );
    
    const indicator = screen.getByTestId('coverage-indicator');
    expect(indicator).toHaveClass('bg-red-100');
  });

  it('shows warning status when coverage is between 50% and 75%', () => {
    render(
      <CoverageIndicator
        {...defaultProps}
        required={4}
        actual={2}
      />
    );
    
    const indicator = screen.getByTestId('coverage-indicator');
    expect(indicator).toHaveClass('bg-yellow-100');
  });

  it('shows success status when coverage is above 75%', () => {
    render(
      <CoverageIndicator
        {...defaultProps}
        required={4}
        actual={4}
      />
    );
    
    const indicator = screen.getByTestId('coverage-indicator');
    expect(indicator).toHaveClass('bg-green-100');
  });

  it('displays overtime hours when present', () => {
    render(
      <CoverageIndicator
        {...defaultProps}
        overtime={2}
      />
    );
    
    expect(screen.getByText('OT: 2h')).toBeInTheDocument();
  });

  it('does not display overtime when zero', () => {
    render(
      <CoverageIndicator
        {...defaultProps}
        overtime={0}
      />
    );
    
    expect(screen.queryByText(/OT:/)).not.toBeInTheDocument();
  });

  it('shows supervisor count when greater than zero', () => {
    render(
      <CoverageIndicator
        {...defaultProps}
        supervisors={2}
      />
    );
    
    expect(screen.getByText('Sup: 2')).toBeInTheDocument();
  });

  it('formats midnight shift period correctly', () => {
    render(
      <CoverageIndicator
        {...defaultProps}
        period="19:00:00-07:00:00"
      />
    );
    
    expect(screen.getByText('7pm - 7am')).toBeInTheDocument();
  });
}); 