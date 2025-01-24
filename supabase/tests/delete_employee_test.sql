BEGIN;

-- Create a test user
INSERT INTO auth.users (id, email)
VALUES ('test-user-id', 'test@example.com');

-- Create profile
INSERT INTO public.profiles (id, full_name)
VALUES ('test-user-id', 'Test User');

-- Create employee
INSERT INTO public.employees (id, employee_role, user_role)
VALUES ('test-user-id', 'Dispatcher', 'Employee');

-- Test the deletion
SELECT public.delete_employee_transaction('test-user-id'::uuid);

-- Verify deletion
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.employees WHERE id = 'test-user-id'::uuid
  ) THEN
    RAISE EXCEPTION 'Employee record still exists';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = 'test-user-id'::uuid
  ) THEN
    RAISE EXCEPTION 'Profile record still exists';
  END IF;
END;
$$;

ROLLBACK; 