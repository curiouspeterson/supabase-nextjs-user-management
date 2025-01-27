import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HealthDashboard from '@/app/dashboard/health/page';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockHealthData = {
  status: 'healthy',
  metrics: {
    coverage_deficit: 0,
    overtime_violations: 0,
    pattern_errors: 0,
    schedule_generation_time: 1500,
    last_run_status: 'success'
  },
  coverage: [
    {
      date: '2024-03-01',
      periods: [
        {
          start_time: '08:00',
          end_time: '16:00',
          required: 2,
          actual: 2,
          supervisors: 1
        }
      ]
    }
  ],
  alerts: []
};

describe('HealthDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockHealthData)
      })
    );
  });

  it('should render loading state initially', () => {
    render(<HealthDashboard />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should fetch and display health data', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Scheduler Health Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('healthy')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // coverage deficit
    expect(screen.getByText('1500ms')).toBeInTheDocument(); // generation time
  });

  it('should handle error state', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch health status')).toBeInTheDocument();
    });
  });

  it('should refresh data when refresh button is clicked', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Scheduler Health Dashboard')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should display alerts when present', async () => {
    const dataWithAlerts = {
      ...mockHealthData,
      alerts: ['Coverage deficit detected', 'Pattern violation found']
    };

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(dataWithAlerts)
      })
    );

    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Active Alerts')).toBeInTheDocument();
      expect(screen.getByText('Coverage deficit detected')).toBeInTheDocument();
      expect(screen.getByText('Pattern violation found')).toBeInTheDocument();
    });
  });

  it('should display correct status colors', async () => {
    const statuses = ['healthy', 'degraded', 'critical'];
    
    for (const status of statuses) {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockHealthData,
            status
          })
        })
      );

      render(<HealthDashboard />);

      await waitFor(() => {
        expect(screen.getByText(status)).toBeInTheDocument();
      });

      const statusElement = screen.getByText(status);
      expect(statusElement).toHaveClass(
        status === 'healthy' ? 'text-green-500' :
        status === 'degraded' ? 'text-yellow-500' :
        'text-red-500'
      );
    }
  });

  it('should display coverage report correctly', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Coverage Report')).toBeInTheDocument();
    });

    expect(screen.getByText('2024-03-01')).toBeInTheDocument();
    expect(screen.getByText('08:00 - 16:00')).toBeInTheDocument();
    expect(screen.getByText('2/2 Staff')).toBeInTheDocument();
    expect(screen.getByText('1 Supervisors')).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should display system metrics correctly', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('System Metrics')).toBeInTheDocument();
    });

    expect(screen.getByText('Last Schedule Generation Time')).toBeInTheDocument();
    expect(screen.getByText('1500ms')).toBeInTheDocument();
    expect(screen.getByText('Last Run Status')).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('should display error message when present in metrics', async () => {
    const dataWithError = {
      ...mockHealthData,
      metrics: {
        ...mockHealthData.metrics,
        error_message: 'Schedule generation failed'
      }
    };

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(dataWithError)
      })
    );

    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Schedule generation failed')).toBeInTheDocument();
    });
  });
}); 