-- Add timezone validation function
CREATE OR REPLACE FUNCTION public.is_valid_timezone(p_timezone text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN p_timezone IN (SELECT name FROM pg_timezone_names);
END;
$$;

-- Drop existing constraints if they exist
ALTER TABLE "public"."scheduler_config" DROP CONSTRAINT IF EXISTS "scheduler_config_valid_timezone";
ALTER TABLE "public"."schedules" DROP CONSTRAINT IF EXISTS "valid_timezone";

-- Add timezone validation constraints
ALTER TABLE "public"."scheduler_config" ADD CONSTRAINT "scheduler_config_valid_timezone" 
    CHECK (is_valid_timezone(timezone)) NOT VALID;
ALTER TABLE "public"."scheduler_config" VALIDATE CONSTRAINT "scheduler_config_valid_timezone";

ALTER TABLE "public"."schedules" ADD CONSTRAINT "valid_timezone" 
    CHECK (is_valid_timezone(timezone)) NOT VALID;
ALTER TABLE "public"."schedules" VALIDATE CONSTRAINT "valid_timezone"; 