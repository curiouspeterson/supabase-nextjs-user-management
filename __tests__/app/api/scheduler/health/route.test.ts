import { GET } from '@/app/api/scheduler/health/route';
import { SchedulerMonitor } from '@/services/scheduler/monitor';
import { NextResponse } from 'next/server';

// Mock the SchedulerMonitor class
jest.mock('@/services/scheduler/monitor');

describe('Health Check API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 for healthy status', async () => {
    const mockHealth = {
      status: 'healthy',
      metrics: {
        coverage_deficit: 0,
        overtime_violations: 0,
        pattern_errors: 0,
        schedule_generation_time: 60,
        last_run_status: 'success',
        error_message: null
      },
      coverage: [],
      alerts: []
    };

    (SchedulerMonitor as jest.Mock).mockImplementation(() => ({
      checkHealth: jest.fn().mockResolvedValue(mockHealth)
    }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockHealth);
  });

  it('should return 429 for degraded status', async () => {
    const mockHealth = {
      status: 'degraded',
      metrics: {
        coverage_deficit: 1,
        overtime_violations: 2,
        pattern_errors: 1,
        schedule_generation_time: 120,
        last_run_status: 'success',
        error_message: null
      },
      coverage: [],
      alerts: ['Warning: Coverage deficit detected']
    };

    (SchedulerMonitor as jest.Mock).mockImplementation(() => ({
      checkHealth: jest.fn().mockResolvedValue(mockHealth)
    }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data).toEqual(mockHealth);
  });

  it('should return 500 for critical status', async () => {
    const mockHealth = {
      status: 'critical',
      metrics: {
        coverage_deficit: 3,
        overtime_violations: 5,
        pattern_errors: 2,
        schedule_generation_time: 300,
        last_run_status: 'error',
        error_message: 'Critical error detected'
      },
      coverage: [],
      alerts: ['Critical: Multiple violations detected']
    };

    (SchedulerMonitor as jest.Mock).mockImplementation(() => ({
      checkHealth: jest.fn().mockResolvedValue(mockHealth)
    }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual(mockHealth);
  });

  it('should handle errors gracefully', async () => {
    (SchedulerMonitor as jest.Mock).mockImplementation(() => ({
      checkHealth: jest.fn().mockRejectedValue(new Error('Test error'))
    }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      status: 'critical',
      metrics: {
        coverage_deficit: 0,
        overtime_violations: 0,
        pattern_errors: 0,
        schedule_generation_time: 0,
        last_run_status: 'error',
        error_message: 'Health check failed'
      },
      coverage: [],
      alerts: ['Health check system error']
    });
  });
}); 