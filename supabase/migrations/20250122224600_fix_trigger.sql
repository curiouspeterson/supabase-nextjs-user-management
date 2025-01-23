-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Recreate the trigger with better error handling
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_error text;
  v_detail text;
  v_hint text;
begin
  -- Log the incoming data for debugging
  raise notice 'Creating new user with ID: %, Email: %, Metadata: %', 
    new.id, 
    new.email, 
    new.raw_user_meta_data;

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
    get stacked diagnostics 
      v_error = message_text,
      v_detail = pg_exception_detail,
      v_hint = pg_exception_hint;
    raise warning 'Error creating profile: %, Detail: %, Hint: %', 
      v_error, v_detail, v_hint;
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
      (new.raw_user_meta_data->>'default_shift_type_id')::uuid
    );
  exception when others then
    get stacked diagnostics 
      v_error = message_text,
      v_detail = pg_exception_detail,
      v_hint = pg_exception_hint;
    raise warning 'Error creating employee: %, Detail: %, Hint: %', 
      v_error, v_detail, v_hint;
    raise exception 'Employee creation failed: %', v_error;
  end;
  
  return new;
exception
  when others then
    get stacked diagnostics 
      v_error = message_text,
      v_detail = pg_exception_detail,
      v_hint = pg_exception_hint;
    raise warning 'Error in handle_new_user trigger: % (User ID: %, Email: %), Detail: %, Hint: %', 
      v_error, new.id, new.email, v_detail, v_hint;
    raise;
end;
$$;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 