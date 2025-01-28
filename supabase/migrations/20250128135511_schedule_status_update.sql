-- Create new schedule_status type
CREATE TYPE public.schedule_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'CANCELLED');

-- Update existing values to match new enum
UPDATE public.schedules
SET status = CASE 
    WHEN UPPER(status) = 'DRAFT' THEN 'DRAFT'
    WHEN UPPER(status) = 'PUBLISHED' THEN 'PUBLISHED'
    WHEN UPPER(status) = 'PENDING' THEN 'PENDING'
    WHEN UPPER(status) = 'APPROVED' THEN 'APPROVED'
    WHEN UPPER(status) = 'CANCELLED' THEN 'CANCELLED'
    ELSE 'DRAFT'
END;

-- Handle column type change
ALTER TABLE public.schedules ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.schedules 
    ALTER COLUMN status TYPE public.schedule_status 
    USING CASE 
        WHEN UPPER(status) = 'DRAFT' THEN 'DRAFT'::public.schedule_status
        WHEN UPPER(status) = 'PUBLISHED' THEN 'PUBLISHED'::public.schedule_status
        WHEN UPPER(status) = 'PENDING' THEN 'PENDING'::public.schedule_status
        WHEN UPPER(status) = 'APPROVED' THEN 'APPROVED'::public.schedule_status
        WHEN UPPER(status) = 'CANCELLED' THEN 'CANCELLED'::public.schedule_status
        ELSE 'DRAFT'::public.schedule_status
    END;
ALTER TABLE public.schedules ALTER COLUMN status SET DEFAULT 'DRAFT'::public.schedule_status;

-- Update the validation function
CREATE OR REPLACE FUNCTION public.validate_schedule_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Define valid status transitions
    IF OLD.status = 'DRAFT'::public.schedule_status AND 
       NEW.status NOT IN ('PENDING'::public.schedule_status, 'CANCELLED'::public.schedule_status) THEN
        RAISE EXCEPTION 'Invalid status transition from DRAFT to %', NEW.status;
    END IF;

    IF OLD.status = 'PENDING'::public.schedule_status AND 
       NEW.status NOT IN ('APPROVED'::public.schedule_status, 'CANCELLED'::public.schedule_status) THEN
        RAISE EXCEPTION 'Invalid status transition from PENDING to %', NEW.status;
    END IF;

    IF OLD.status = 'APPROVED'::public.schedule_status AND 
       NEW.status NOT IN ('PUBLISHED'::public.schedule_status, 'CANCELLED'::public.schedule_status) THEN
        RAISE EXCEPTION 'Invalid status transition from APPROVED to %', NEW.status;
    END IF;

    IF OLD.status = 'PUBLISHED'::public.schedule_status AND 
       NEW.status != 'CANCELLED'::public.schedule_status THEN
        RAISE EXCEPTION 'Published schedule can only be cancelled';
    END IF;

    IF OLD.status = 'CANCELLED'::public.schedule_status THEN
        RAISE EXCEPTION 'Cancelled schedule cannot be modified';
    END IF;

    RETURN NEW;
END;
$function$;

-- Add trigger for validation function
DROP TRIGGER IF EXISTS validate_schedule_status_transition_trigger ON public.schedules;
CREATE TRIGGER validate_schedule_status_transition_trigger
    BEFORE UPDATE OF status
    ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_schedule_status_transition(); 