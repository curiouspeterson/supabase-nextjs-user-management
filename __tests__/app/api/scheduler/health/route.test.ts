import { GET } from '@/app/api/scheduler/health/route';
import { SchedulerMonitor } from '@/services/scheduler/monitor';

// Mock SchedulerMonitor
jest.mock('@/services/scheduler/monitor');

describe('Health Check API', () => {
  let mockMonitor: jest.Mocked<SchedulerMonitor>;

  beforeEach(() => {
    mockMonitor = new SchedulerMonitor() as jest.Mocked<SchedulerMonitor>;
    (SchedulerMonitor as jest.Mock).mockImplementation(() => mockMonitor);
  });

  it('should return 200 for healthy status', async () => {
    const mockHealth = {
      status: 'healthy',
      metrics: {
        coverage_deficit: 0,
        overtime_violations: 0,
        pattern_errors: 0,
        schedule_generation_time: 60,
        last_run_status: 'success'
      },
      coverage: {},
      alerts: []
    };

    mockMonitor.checkHealth.mockResolvedValue(mockHealth);

    const response = await GET(new Request('http://localhost/api/scheduler/health'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockHealth);
  });

  it('should return 429 for degraded status', async () => {
    const mockHealth = {
      status: 'degraded',
      metrics: {
        coverage_deficit: 1,
        overtime_violations: 0,
        pattern_errors: 0,
        schedule_generation_time: 200,
        last_run_status: 'success'
      },
      coverage: {},
      alerts: ['WARNING: Coverage deficit detected']
    };

    mockMonitor.checkHealth.mockResolvedValue(mockHealth);

    const response = await GET(new Request('http://localhost/api/scheduler/health'));
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data).toEqual(mockHealth);
  });

  it('should return 500 for critical status', async () => {
    const mockHealth = {
      status: 'critical',
      metrics: {
        coverage_deficit: 3,
        overtime_violations: 2,
        pattern_errors: 1,
        schedule_generation_time: 400,
        last_run_status: 'failure'
      },
      coverage: {},
      alerts: ['CRITICAL: Multiple coverage deficits detected']
    };

    mockMonitor.checkHealth.mockResolvedValue(mockHealth);

    const response = await GET(new Request('http://localhost/api/scheduler/health'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual(mockHealth);
  });

  it('should handle errors gracefully', async () => {
    const testError = new Error('Test error');
    mockMonitor.checkHealth.mockRejectedValue(testError);

    const response = await GET(new Request('http://localhost/api/scheduler/health'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      status: 'critical',
      error: 'Test error'
    });
  });
}); 