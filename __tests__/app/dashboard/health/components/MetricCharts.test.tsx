import { render, screen } from '@testing-library/react';
import MetricCharts from '@/app/dashboard/health/components/MetricCharts';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

const mockHistory = [
  {
    timestamp: '2024-03-01T10:00:00Z',
    coverage_deficit: 2,
    pattern_errors: 1,
    overtime_violations: 1,
    schedule_generation_time: 1500
  },
  {
    timestamp: '2024-03-01T11:00:00Z',
    coverage_deficit: 1,
    pattern_errors: 0,
    overtime_violations: 0,
    schedule_generation_time: 1200
  }
];

describe('MetricCharts', () => {
  it('should render all chart sections', () => {
    render(<MetricCharts history={mockHistory} />);

    expect(screen.getByText('Coverage Deficit Trend')).toBeInTheDocument();
    expect(screen.getByText('Pattern and Overtime Violations')).toBeInTheDocument();
    expect(screen.getByText('Generation Time History')).toBeInTheDocument();
    expect(screen.getByText('Metric Summary')).toBeInTheDocument();
  });

  it('should render all chart components', () => {
    render(<MetricCharts history={mockHistory} />);

    expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    expect(screen.getAllByTestId('line-chart')).toHaveLength(2);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should calculate and display correct metric summaries', () => {
    render(<MetricCharts history={mockHistory} />);

    // Average Generation Time
    expect(screen.getByText('1350ms')).toBeInTheDocument();

    // Total Violations
    expect(screen.getByText('2')).toBeInTheDocument(); // 1 pattern + 1 overtime

    // Peak Coverage Deficit
    expect(screen.getByText('2')).toBeInTheDocument();

    // Current Trend
    expect(screen.getByText('Improving')).toBeInTheDocument();
  });

  it('should handle empty history', () => {
    render(<MetricCharts history={[]} />);

    expect(screen.getByText('Coverage Deficit Trend')).toBeInTheDocument();
    expect(screen.getByText('0ms')).toBeInTheDocument(); // Average Generation Time
    expect(screen.getByText('0')).toBeInTheDocument(); // Total Violations
  });

  it('should handle single data point', () => {
    const singleHistory = [mockHistory[0]];
    render(<MetricCharts history={singleHistory} />);

    expect(screen.getByText('1500ms')).toBeInTheDocument(); // Generation Time
    expect(screen.getByText('2')).toBeInTheDocument(); // Pattern + Overtime Violations
  });

  it('should handle degrading trend', () => {
    const degradingHistory = [
      {
        timestamp: '2024-03-01T10:00:00Z',
        coverage_deficit: 1,
        pattern_errors: 0,
        overtime_violations: 0,
        schedule_generation_time: 1000
      },
      {
        timestamp: '2024-03-01T11:00:00Z',
        coverage_deficit: 2,
        pattern_errors: 1,
        overtime_violations: 1,
        schedule_generation_time: 1500
      }
    ];

    render(<MetricCharts history={degradingHistory} />);
    expect(screen.getByText('Degrading')).toBeInTheDocument();
  });

  it('should render chart axes and grids', () => {
    render(<MetricCharts history={mockHistory} />);

    expect(screen.getAllByTestId('x-axis')).toHaveLength(3);
    expect(screen.getAllByTestId('y-axis')).toHaveLength(3);
    expect(screen.getAllByTestId('cartesian-grid')).toHaveLength(3);
  });

  it('should render tooltips and legend', () => {
    render(<MetricCharts history={mockHistory} />);

    expect(screen.getAllByTestId('tooltip')).toHaveLength(3);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('should handle large numbers in metrics', () => {
    const largeNumberHistory = [
      {
        timestamp: '2024-03-01T10:00:00Z',
        coverage_deficit: 1000,
        pattern_errors: 500,
        overtime_violations: 500,
        schedule_generation_time: 5000
      }
    ];

    render(<MetricCharts history={largeNumberHistory} />);
    expect(screen.getByText('5000ms')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('should handle zero values in metrics', () => {
    const zeroValueHistory = [
      {
        timestamp: '2024-03-01T10:00:00Z',
        coverage_deficit: 0,
        pattern_errors: 0,
        overtime_violations: 0,
        schedule_generation_time: 0
      }
    ];

    render(<MetricCharts history={zeroValueHistory} />);
    expect(screen.getByText('0ms')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(2); // Coverage Deficit and Total Violations
  });
}); 