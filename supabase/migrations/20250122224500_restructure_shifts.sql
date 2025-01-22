-- Drop existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Recreate the function with updated metadata handling
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_error text;
begin
  -- First create a profile (required by employee foreign key constraint)
  begin
    insert into public.profiles (id, full_name, avatar_url, updated_at)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      coalesce(new.raw_user_meta_data->>'avatar_url', null),
      now()
    );
  exception when others then
    get stacked diagnostics v_error = message_text;
    raise warning 'Error creating profile: %', v_error;
    raise exception 'Profile creation failed: %', v_error;
  end;
  
  -- Then create an employee record with values from metadata
  begin
    insert into public.employees (
      id,
      employee_role,
      user_role,
      weekly_hours_scheduled,
      default_shift_type_id
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'employee_role', 'Dispatcher'),
      coalesce(new.raw_user_meta_data->>'user_role', 'Employee'),
      coalesce((new.raw_user_meta_data->>'weekly_hours_scheduled')::integer, 40),
      coalesce((new.raw_user_meta_data->>'default_shift_type_id')::uuid, 
        (select id from shift_types where name = 'Day Shift'))
    );
  exception when others then
    get stacked diagnostics v_error = message_text;
    raise warning 'Error creating employee: %', v_error;
    raise exception 'Employee creation failed: %', v_error;
  end;
  
  return new;
exception
  when others then
    -- Log the error details with full context
    get stacked diagnostics v_error = message_text;
    raise warning 'Error in handle_new_user trigger: % (User ID: %, Email: %)', 
      v_error, new.id, new.email;
    raise;
end;
$$;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 