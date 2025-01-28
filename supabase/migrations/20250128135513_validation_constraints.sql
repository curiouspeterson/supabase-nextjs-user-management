-- Drop existing constraints if they exist
ALTER TABLE "public"."schedules" DROP CONSTRAINT IF EXISTS "valid_business_hours";
ALTER TABLE "public"."schedules" DROP CONSTRAINT IF EXISTS "valid_schedule_dates";
ALTER TABLE "public"."scheduler_config" DROP CONSTRAINT IF EXISTS "scheduler_config_valid_timezone";
ALTER TABLE "public"."schedules" DROP CONSTRAINT IF EXISTS "valid_timezone";

-- Add business hours validation constraint
ALTER TABLE "public"."schedules" ADD CONSTRAINT "valid_business_hours" 
    CHECK (validate_business_hours(shift_start::time, shift_end::time)) NOT VALID;
ALTER TABLE "public"."schedules" VALIDATE CONSTRAINT "valid_business_hours";

-- Add schedule dates validation constraint
ALTER TABLE "public"."schedules" ADD CONSTRAINT "valid_schedule_dates" 
    CHECK (validate_date_range(period_start, period_end, false)) NOT VALID;
ALTER TABLE "public"."schedules" VALIDATE CONSTRAINT "valid_schedule_dates";

-- Add timezone validation constraints
ALTER TABLE "public"."scheduler_config" ADD CONSTRAINT "scheduler_config_valid_timezone" 
    CHECK (is_valid_timezone(timezone)) NOT VALID;
ALTER TABLE "public"."scheduler_config" VALIDATE CONSTRAINT "scheduler_config_valid_timezone";

ALTER TABLE "public"."schedules" ADD CONSTRAINT "valid_timezone" 
    CHECK (is_valid_timezone(timezone)) NOT VALID;
ALTER TABLE "public"."schedules" VALIDATE CONSTRAINT "valid_timezone"; 