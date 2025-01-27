export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  metrics: {
    coverage_deficit: number;
    overtime_violations: number;
    pattern_errors: number;
    schedule_generation_time: number;
    last_run_status: string;
    error_message?: string;
  };
  coverage: Array<{
    date: string;
    periods: {
      start_time: string;
      end_time: string;
      required: number;
      actual: number;
      supervisors: number;
    }[];
  }>;
  alerts: string[];
}

export interface HealthDashboardProps {
  initialData: HealthStatus;
} 