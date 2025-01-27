import { SchedulerMonitor } from '@/services/scheduler/monitor';
import { createClient } from '@/utils/supabase/server';
import { mockClient } from '@/lib/test-utils';

// Mock Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn()
}));

describe('SchedulerMonitor', () => {
  let monitor: SchedulerMonitor;
  let mockSupabase: ReturnType<typeof mockClient>;

  beforeEach(() => {
    mockSupabase = mockClient();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    monitor = new SchedulerMonitor();
  });

  describe('checkHealth', () => {
    it('should report healthy status when all metrics are good', async () => {
      // Mock healthy metrics
      mockSupabase.from.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          data: table === 'daily_coverage' ? [] :
                table === 'schedules' ? [] :
                table === 'scheduler_metrics' ? [{
                  generation_time: 60,
                  status: 'success',
                  created_at: new Date().toISOString()
                }] : [],
          error: null
        }),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({
          data: {
            generation_time: 60,
            status: 'success'
          },
          error: null
        })
      }));

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      });

      const health = await monitor.checkHealth();

      expect(health.status).toBe('healthy');
      expect(health.metrics.coverage_deficit).toBe(0);
      expect(health.metrics.overtime_violations).toBe(0);
      expect(health.metrics.pattern_errors).toBe(0);
      expect(health.alerts).toHaveLength(0);
    });

    it('should report degraded status with warnings', async () => {
      // Mock metrics with warnings
      mockSupabase.from.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          data: table === 'daily_coverage' ? [{
            date: '2025-01-01',
            coverage_status: 'Under',
            actual_coverage: 1,
            supervisor_count: 0,
            staffing_requirements: {
              start_time: '07:00:00',
              end_time: '19:00:00',
              minimum_employees: 2
            }
          }] :
          table === 'schedules' ? [] :
          table === 'scheduler_metrics' ? [{
            generation_time: 200,
            status: 'success',
            created_at: new Date().toISOString()
          }] : [],
          error: null
        }),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({
          data: {
            generation_time: 200,
            status: 'success'
          },
          error: null
        })
      }));

      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null
      });

      const health = await monitor.checkHealth();

      expect(health.status).toBe('degraded');
      expect(health.alerts).toContain('WARNING: Coverage deficit on 2025-01-01 during 07:00:00-19:00:00');
      expect(health.alerts).toContain('WARNING: No supervisor coverage on 2025-01-01 during 07:00:00-19:00:00');
    });

    it('should report critical status with severe issues', async () => {
      // Mock critical metrics
      mockSupabase.from.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnValue({
          data: table === 'daily_coverage' ? [
            { coverage_status: 'Under' },
            { coverage_status: 'Under' },
            { coverage_status: 'Under' }
          ] :
          table === 'schedules' ? [
            { id: '1' },
            { id: '2' }
          ] :
          table === 'scheduler_metrics' ? [{
            generation_time: 400,
            status: 'failure',
            error_message: 'Schedule generation failed',
            created_at: new Date().toISOString()
          }] : [],
          error: null
        }),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({
          data: {
            generation_time: 400,
            status: 'failure',
            error_message: 'Schedule generation failed'
          },
          error: null
        })
      }));

      mockSupabase.rpc.mockResolvedValue({
        data: [{ id: '1' }],
        error: null
      });

      const health = await monitor.checkHealth();

      expect(health.status).toBe('critical');
      expect(health.metrics.coverage_deficit).toBe(3);
      expect(health.metrics.overtime_violations).toBe(2);
      expect(health.metrics.pattern_errors).toBe(1);
      expect(health.metrics.schedule_generation_time).toBe(400);
      expect(health.metrics.last_run_status).toBe('failure');
      expect(health.alerts).toContain('CRITICAL: 3 coverage deficits found');
      expect(health.alerts).toContain('CRITICAL: Schedule generation taking too long (400s)');
    });
  });

  describe('recordMetrics', () => {
    it('should record metrics successfully', async () => {
      const startTime = Date.now() - 5000; // 5 seconds ago
      const endTime = Date.now();

      mockSupabase.from.mockImplementation((table: string) => ({
        insert: jest.fn().mockReturnValue({
          data: {
            id: 'new-metric',
            generation_time: 5,
            status: 'success',
            created_at: new Date().toISOString()
          },
          error: null
        })
      }));

      await monitor.recordMetrics(startTime, endTime, 'success');

      expect(mockSupabase.from).toHaveBeenCalledWith('scheduler_metrics');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        generation_time: expect.any(Number),
        status: 'success',
        error_message: undefined,
        created_at: expect.any(String)
      });
    });

    it('should handle errors when recording metrics', async () => {
      const startTime = Date.now() - 5000;
      const endTime = Date.now();
      const testError = new Error('Test error');

      mockSupabase.from.mockImplementation((table: string) => ({
        insert: jest.fn().mockReturnValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await monitor.recordMetrics(startTime, endTime, 'failure', testError);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to record scheduler metrics:',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });
}); 