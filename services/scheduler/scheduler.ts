import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/logger';
import { AppError, DatabaseError, ValidationError } from '@/lib/errors';
import { format, parseISO, addDays, isValid } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { z } from 'zod';
import { PatternValidator } from './pattern-validator';
import type { Schedule, Employee, Department, Shift } from './types';

interface SchedulerConstraints {
  max_weekly_hours: number;
  max_consecutive_days: number;
  min_hours_between_shifts: number;
  max_daily_hours: number;
  max_overtime_hours: number;
  preferred_shift_length: number;
  max_shifts_per_day: number;
  optimization_timeout_ms: number;
  max_retry_attempts: number;
  retry_delay_ms: number;
}

interface GenerationMetrics {
  generation_time_ms: number;
  optimization_iterations: number;
  constraints_checked: number;
  errors_encountered: number;
  schedules_generated: number;
}

// Zod schema for schedule generation request
const ScheduleRequestSchema = z.object({
  department_id: z.string().uuid(),
  start_date: z.string().refine(val => isValid(parseISO(val)), {
    message: 'Invalid start date format'
  }),
  end_date: z.string().refine(val => isValid(parseISO(val)), {
    message: 'Invalid end date format'
  }),
  timezone: z.string().default('UTC')
});

export class Scheduler {
  private supabase = createClient();
  private patternValidator: PatternValidator;
  private constraints: SchedulerConstraints | null = null;
  private readonly environment: string;
  private readonly retryOptions: {
    maxAttempts: number;
    delayMs: number;
  };

  constructor(
    environment: string = process.env.NODE_ENV || 'development',
    retryOptions = { maxAttempts: 3, delayMs: 1000 }
  ) {
    this.environment = environment;
    this.patternValidator = new PatternValidator(environment);
    this.retryOptions = retryOptions;
  }

  /**
   * Initialize scheduler constraints from database
   */
  private async initializeConstraints(): Promise<void> {
    try {
      const { data: config, error } = await this.supabase.rpc(
        'get_scheduler_config',
        { 
          p_config_key: 'scheduler_constraints',
          p_environment: this.environment
        }
      );

      if (error) {
        throw new DatabaseError(`Failed to get scheduler constraints: ${error.message}`);
      }

      this.constraints = config as SchedulerConstraints;
    } catch (error) {
      logger.error('Failed to initialize scheduler constraints', {
        error,
        context: 'Scheduler.initializeConstraints'
      });
      throw new AppError('Failed to initialize scheduler', 'SCHEDULER_INIT_ERROR');
    }
  }

  /**
   * Generate a schedule for a department
   */
  public async generateSchedule(request: unknown): Promise<{
    schedule_id: string;
    metrics: GenerationMetrics;
  }> {
    try {
      // Initialize constraints if not already done
      if (!this.constraints) {
        await this.initializeConstraints();
      }

      // Validate request
      const validatedRequest = ScheduleRequestSchema.parse(request);
      const { department_id, start_date, end_date, timezone } = validatedRequest;

      // Convert dates to UTC
      const utcStartDate = zonedTimeToUtc(parseISO(start_date), timezone);
      const utcEndDate = zonedTimeToUtc(parseISO(end_date), timezone);

      // Start generation process with retry mechanism
      let attempt = 0;
      let lastError: Error | null = null;

      while (attempt < this.retryOptions.maxAttempts) {
        try {
          const startTime = performance.now();

          // Generate schedule using database function
          const { data, error } = await this.supabase.rpc(
            'generate_schedule',
            {
              p_start_date: format(utcStartDate, 'yyyy-MM-dd'),
              p_end_date: format(utcEndDate, 'yyyy-MM-dd'),
              p_department_id: department_id,
              p_environment: this.environment
            }
          );

          if (error) throw new DatabaseError(error.message);

          // Convert metrics to proper format
          const metrics: GenerationMetrics = {
            generation_time_ms: data.metrics.generation_time_ms,
            optimization_iterations: data.metrics.optimization_iterations || 0,
            constraints_checked: data.metrics.constraints_checked || 0,
            errors_encountered: data.metrics.errors_encountered || 0,
            schedules_generated: data.metrics.schedules_generated || 0
          };

          // Record success metrics
          await this.recordGenerationMetrics('success', metrics);

          return {
            schedule_id: data.schedule_id,
            metrics
          };

        } catch (error) {
          lastError = error as Error;
          logger.warn(`Schedule generation attempt ${attempt + 1} failed`, {
            error,
            context: 'Scheduler.generateSchedule',
            attempt: attempt + 1
          });

          // Record failure metrics
          await this.recordGenerationMetrics('failure', {
            error: lastError.message,
            attempt: attempt + 1
          });

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.retryOptions.delayMs));
          attempt++;
        }
      }

      // If all attempts failed, throw the last error
      throw lastError || new Error('Failed to generate schedule after all attempts');

    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Invalid schedule generation request', {
          error: error.errors,
          context: 'Scheduler.generateSchedule'
        });
        throw new ValidationError('Invalid schedule generation request');
      }

      if (error instanceof DatabaseError) {
        throw error;
      }

      logger.error('Schedule generation failed', {
        error,
        context: 'Scheduler.generateSchedule'
      });
      throw new AppError('Failed to generate schedule', 'SCHEDULE_GENERATION_ERROR');
    }
  }

  /**
   * Record generation metrics
   */
  private async recordGenerationMetrics(
    status: 'success' | 'failure',
    metrics: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.supabase.rpc('record_scheduler_metrics', {
        p_metrics_type: `schedule_generation_${status}`,
        p_metrics_value: metrics,
        p_environment: this.environment
      });
    } catch (error) {
      logger.error('Failed to record generation metrics', {
        error,
        context: 'Scheduler.recordGenerationMetrics'
      });
      // Don't throw here as this is not critical for the generation process
    }
  }

  /**
   * Optimize a generated schedule
   */
  private async optimizeSchedule(
    scheduleId: string,
    constraints: SchedulerConstraints
  ): Promise<void> {
    const startTime = performance.now();
    let iterations = 0;

    try {
      // Get current schedule
      const { data: schedule, error: scheduleError } = await this.supabase
        .from('schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (scheduleError) throw new DatabaseError(scheduleError.message);

      // Perform optimization
      while (
        performance.now() - startTime < constraints.optimization_timeout_ms &&
        iterations < 1000
      ) {
        // Optimization logic here
        iterations++;
      }

      // Record optimization metrics
      await this.recordGenerationMetrics('optimization', {
        schedule_id: scheduleId,
        iterations,
        time_ms: performance.now() - startTime
      });

    } catch (error) {
      logger.error('Schedule optimization failed', {
        error,
        context: 'Scheduler.optimizeSchedule',
        schedule_id: scheduleId
      });
      throw new AppError('Failed to optimize schedule', 'SCHEDULE_OPTIMIZATION_ERROR');
    }
  }
} 