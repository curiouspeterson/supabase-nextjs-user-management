-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.delete_employee_transaction(uuid);

-- Create the delete_employee_transaction function
CREATE OR REPLACE FUNCTION public.delete_employee_transaction(p_employee_id uuid)
RETURNS void AS $$
BEGIN
    -- Start transaction
    -- Delete time off requests first (they reference auth.users)
    DELETE FROM public.time_off_requests 
    WHERE employee_id = p_employee_id 
       OR reviewed_by = p_employee_id;
    
    -- Delete the employee (schedules will be deleted via ON DELETE CASCADE)
    DELETE FROM public.employees WHERE id = p_employee_id;
    
    -- If we get here, all deletes were successful
    -- Transaction will be automatically committed
EXCEPTION WHEN OTHERS THEN
    -- If any error occurs, the transaction will be rolled back automatically
    RAISE EXCEPTION 'Failed to delete employee: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_employee_transaction(uuid) TO authenticated;

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
