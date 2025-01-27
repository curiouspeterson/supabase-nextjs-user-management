import { SchedulerMonitor } from '@/services/scheduler/monitor';
import { createClient } from '@/utils/supabase/server';
import type { SchedulerMetrics, CoverageReport } from '@/services/scheduler/types';

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockMetrics.healthy,
              error: null
            }))
          })),
          limit: jest.fn(() => ({
            data: mockCoverage,
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        error: null
      })),
      gte: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => ({
            data: mockCoverage,
            error: null
          }))
        }))
      }))
    }))
  }))
}));

// Mock data
const mockMetrics = {
  healthy: {
    coverage_deficit: 0,
    overtime_violations: 0,
    pattern_errors: 0,
    schedule_generation_time: 60,
    last_run_status: 'success',
    error_message: null
  } as SchedulerMetrics,
  degraded: {
    coverage_deficit: 1,
    overtime_violations: 2,
    pattern_errors: 1,
    schedule_generation_time: 120,
    last_run_status: 'success',
    error_message: null
  } as SchedulerMetrics,
  critical: {
    coverage_deficit: 3,
    overtime_violations: 5,
    pattern_errors: 2,
    schedule_generation_time: 300,
    last_run_status: 'error',
    error_message: 'Test error'
  } as SchedulerMetrics
};

const mockCoverage: CoverageReport[] = [
  {
    date: '2024-03-20',
    periods: {
      '1': {
        required: 3,
        actual: 3,
        supervisors: 1,
        overtime: 0
      },
      '2': {
        required: 4,
        actual: 2,
        supervisors: 0,
        overtime: 2
      }
    }
  }
];

describe('SchedulerMonitor', () => {
  let monitor: SchedulerMonitor;
  const mockSupabase = createClient();

  beforeEach(() => {
    jest.clearAllMocks();
    monitor = new SchedulerMonitor();
  });

  describe('checkHealth', () => {
    it('should return healthy status when all metrics are good', async () => {
      (mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockMetrics.healthy,
                error: null
              }))
            }))
          }))
        }))
      }));

      const result = await monitor.checkHealth();
      expect(result.status).toBe('healthy');
      expect(result.metrics).toEqual(mockMetrics.healthy);
      expect(result.alerts).toHaveLength(1); // Warning for period 2 with no supervisor
    });

    it('should return degraded status when metrics show warnings', async () => {
      (mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockMetrics.degraded,
                error: null
              }))
            }))
          }))
        }))
      }));

      const result = await monitor.checkHealth();
      expect(result.status).toBe('degraded');
      expect(result.metrics).toEqual(mockMetrics.degraded);
      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('should return critical status when metrics exceed thresholds', async () => {
      (mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockMetrics.critical,
                error: null
              }))
            }))
          }))
        }))
      }));

      const result = await monitor.checkHealth();
      expect(result.status).toBe('critical');
      expect(result.metrics).toEqual(mockMetrics.critical);
      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('should handle database errors gracefully', async () => {
      (mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(() => ({
                data: null,
                error: new Error('Database error')
              }))
            }))
          }))
        }))
      }));

      const result = await monitor.checkHealth();
      expect(result.status).toBe('critical');
      expect(result.metrics.error_message).toBe('Failed to fetch metrics');
    });
  });

  describe('recordMetrics', () => {
    it('should successfully record metrics', async () => {
      const metrics: Partial<SchedulerMetrics> = {
        coverage_deficit: 1,
        overtime_violations: 2,
        pattern_errors: 0,
        last_run_status: 'success'
      };

      await expect(monitor.recordMetrics(metrics)).resolves.not.toThrow();
    });

    it('should handle database errors when recording metrics', async () => {
      (mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
        insert: jest.fn(() => ({
          error: new Error('Database error')
        }))
      }));

      const metrics: Partial<SchedulerMetrics> = {
        coverage_deficit: 1,
        last_run_status: 'error'
      };

      await expect(monitor.recordMetrics(metrics)).rejects.toThrow('Failed to record metrics');
    });
  });
}); 