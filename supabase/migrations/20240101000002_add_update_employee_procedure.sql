-- Create function to update employee and profile in a transaction
create or replace function update_employee_and_profile(
  p_employee_id uuid,
  p_full_name text,
  p_employee_role text,
  p_user_role text,
  p_weekly_hours_scheduled integer,
  p_default_shift_type_id uuid
) returns json as $$
declare
  v_result json;
begin
  -- Start transaction
  begin
    -- Update profile
    update profiles
    set
      full_name = p_full_name,
      updated_at = now()
    where id = p_employee_id;

    -- Update employee
    update employees
    set
      employee_role = p_employee_role,
      user_role = p_user_role,
      weekly_hours_scheduled = p_weekly_hours_scheduled,
      default_shift_type_id = p_default_shift_type_id
    where id = p_employee_id;

    -- Get updated employee data
    select json_build_object(
      'employee', e.*,
      'profile', p.*,
      'shift_type', st.*
    ) into v_result
    from employees e
    left join profiles p on p.id = e.id
    left join shift_types st on st.id = e.default_shift_type_id
    where e.id = p_employee_id;

    return v_result;
  exception
    when others then
      -- Rollback is automatic on error
      raise exception 'Failed to update employee: %', SQLERRM;
  end;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
revoke execute on function update_employee_and_profile from public;
grant execute on function update_employee_and_profile to authenticated; 