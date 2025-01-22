-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create a function to handle new user signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- First create a profile (required by employee foreign key constraint)
  insert into public.profiles (id, full_name, avatar_url, updated_at)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', now());
  
  -- Then create an employee record with default values
  insert into public.employees (id, employee_role, user_role, weekly_hours_scheduled)
  values (new.id, 'Dispatcher', 'Employee', 0);
  
  return new;
end;
$$;

-- Create a trigger to call this function after a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
