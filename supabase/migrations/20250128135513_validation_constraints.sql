-- Drop existing constraints if they exist
ALTER TABLE "public"."schedules" DROP CONSTRAINT IF EXISTS "valid_business_hours";
ALTER TABLE "public"."schedules" DROP CONSTRAINT IF EXISTS "valid_schedule_dates";

-- Add business hours validation constraint
ALTER TABLE "public"."schedules" ADD CONSTRAINT "valid_business_hours" 
    CHECK (validate_business_hours(shift_start, shift_end)) NOT VALID;
ALTER TABLE "public"."schedules" VALIDATE CONSTRAINT "valid_business_hours";

-- Add schedule dates validation constraint
ALTER TABLE "public"."schedules" ADD CONSTRAINT "valid_schedule_dates" 
    CHECK (validate_date_range(period_start, period_end, false)) NOT VALID;
ALTER TABLE "public"."schedules" VALIDATE CONSTRAINT "valid_schedule_dates"; 