-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text
);

-- Create shift types table
create table shift_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Insert the four main shift types
insert into shift_types (name, description) values
  ('Early Shift', 'Early morning shift starting between 3AM and 7AM'),
  ('Day Shift', 'Day shift starting between 7AM and 11AM'),
  ('Swing Shift', 'Swing shift starting between 1PM and 3PM'),
  ('Graveyard', 'Night shift starting between 9PM and 11PM');

-- Create shifts table
create table shifts (
  id uuid primary key default uuid_generate_v4(),
  shift_type_id uuid references shift_types(id) not null,
  start_time time not null,
  end_time time not null,
  duration_hours integer not null,
  duration_category text check (duration_category in ('4 hours', '10 hours', '12 hours')) not null
);

-- Create employees table
create table employees (
  id uuid references auth.users on delete cascade primary key,
  employee_role text not null check (employee_role in ('Dispatcher', 'Shift Supervisor', 'Management')),
  user_role text not null check (user_role in ('Employee', 'Manager', 'Admin')),
  weekly_hours_scheduled integer default 0,
  default_shift_type_id uuid references shift_types(id)
);

-- Create schedules table
create table schedules (
  id uuid primary key default uuid_generate_v4(),
  week_start_date date not null,
  day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  shift_id uuid references shifts(id) not null,
  employee_id uuid references employees(id) not null,
  schedule_status text not null default 'Draft' check (schedule_status in ('Draft', 'Published'))
);

-- Create time off requests table
create table time_off_requests (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Denied')),
  request_date timestamp with time zone default now(),
  manager_notes text
);

-- Create staffing requirements table
create table staffing_requirements (
  id uuid primary key default uuid_generate_v4(),
  period_name text not null,
  start_time time not null,
  end_time time not null,
  minimum_employees integer not null
);

-- Initial Staffing Requirements Data
insert into staffing_requirements (period_name, start_time, end_time, minimum_employees) values
  ('Early Morning', '05:00:00', '09:00:00', 6),
  ('Day', '09:00:00', '21:00:00', 8),
  ('Evening', '21:00:00', '01:00:00', 7),
  ('Night', '01:00:00', '05:00:00', 6);

-- Create example shifts for each type
do $$
declare
  early_id uuid;
  day_id uuid;
  swing_id uuid;
  grave_id uuid;
begin
  -- Get the shift type IDs
  select id into early_id from shift_types where name = 'Early Shift';
  select id into day_id from shift_types where name = 'Day Shift';
  select id into swing_id from shift_types where name = 'Swing Shift';
  select id into grave_id from shift_types where name = 'Graveyard';

  -- Insert shifts for each type
  -- Early Shifts
  insert into shifts (shift_type_id, start_time, end_time, duration_hours, duration_category) values
    (early_id, '05:00:00', '09:00:00', 4, '4 hours'),
    (early_id, '03:00:00', '13:00:00', 10, '10 hours'),
    (early_id, '03:00:00', '15:00:00', 12, '12 hours');

  -- Day Shifts
  insert into shifts (shift_type_id, start_time, end_time, duration_hours, duration_category) values
    (day_id, '09:00:00', '13:00:00', 4, '4 hours'),
    (day_id, '07:00:00', '17:00:00', 10, '10 hours'),
    (day_id, '07:00:00', '19:00:00', 12, '12 hours');

  -- Swing Shifts
  insert into shifts (shift_type_id, start_time, end_time, duration_hours, duration_category) values
    (swing_id, '13:00:00', '17:00:00', 4, '4 hours'),
    (swing_id, '15:00:00', '01:00:00', 10, '10 hours'),
    (swing_id, '15:00:00', '03:00:00', 12, '12 hours');

  -- Graveyard Shifts
  insert into shifts (shift_type_id, start_time, end_time, duration_hours, duration_category) values
    (grave_id, '21:00:00', '01:00:00', 4, '4 hours'),
    (grave_id, '21:00:00', '07:00:00', 10, '10 hours'),
    (grave_id, '21:00:00', '09:00:00', 12, '12 hours');
end;
$$;

-- Function to get user role (used in RLS policies)
create or replace function public.get_user_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_role text;
begin
  select user_role into v_user_role
  from public.employees
  where id = auth.uid();
  return v_user_role;
end;
$$;

-- Trigger to create employee record when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- First create a profile (required by employee foreign key constraint)
  insert into public.profiles (id, full_name, avatar_url, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    now()
  );
  
  -- Then create an employee record with values from metadata
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
    coalesce((new.raw_user_meta_data->>'weekly_hours_scheduled')::integer, 0),
    (new.raw_user_meta_data->>'default_shift_type_id')::uuid
  );
  
  return new;
exception
  when others then
    -- Log the error details
    raise warning 'Error in handle_new_user trigger: %', SQLERRM;
    raise;
end;
$$;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table profiles enable row level security;
alter table employees enable row level security;
alter table shifts enable row level security;
alter table schedules enable row level security;
alter table time_off_requests enable row level security;
alter table staffing_requirements enable row level security;
alter table shift_types enable row level security;

-- Base policy for authenticated users to view records
create policy "Authenticated users can view employees"
on employees for select
using (auth.role() = 'authenticated');

-- Allow users to update their own record
create policy "Users can update their own record"
on employees for update
using (auth.uid() = id);

-- Allow managers and admins to manage all records
create policy "Managers and admins can manage all records"
on employees 
for all
using (
  exists (
    select 1 from employees as e
    where e.id = auth.uid()
    and e.user_role in ('Manager', 'Admin')
  )
);

-- Profiles policies
create policy "Users can view their own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id);

create policy "Managers can view all profiles"
on profiles for select
using (
  exists (
    select 1 from employees
    where id = auth.uid()
    and user_role in ('Manager', 'Admin')
  )
);

-- Shifts policies
create policy "Anyone can view shifts"
on shifts for select
using (true);

create policy "Managers can manage shifts"
on shifts for all
using (
  exists (
    select 1 from employees
    where id = auth.uid()
    and user_role in ('Manager', 'Admin')
  )
);

-- Shift types policies
create policy "Anyone can view shift types"
on shift_types for select
using (true);

create policy "Managers can manage shift types"
on shift_types for all
using (
  exists (
    select 1 from employees
    where id = auth.uid()
    and user_role in ('Manager', 'Admin')
  )
);

-- Schedules policies
create policy "Users can view their own schedules"
on schedules for select
using (auth.uid() = employee_id);

create policy "Managers can manage all schedules"
on schedules for all
using (
  exists (
    select 1 from employees
    where id = auth.uid()
    and user_role in ('Manager', 'Admin')
  )
);

-- Time off request policies
create policy "Users can view their own time off requests"
on time_off_requests for select
using (auth.uid() = employee_id);

create policy "Users can create their own time off requests"
on time_off_requests for insert
with check (auth.uid() = employee_id);

create policy "Managers can manage all time off requests"
on time_off_requests for all
using (
  exists (
    select 1 from employees
    where id = auth.uid()
    and user_role in ('Manager', 'Admin')
  )
);

-- Staffing requirements policies
create policy "Anyone can view staffing requirements"
on staffing_requirements for select
using (true);

create policy "Managers can manage staffing requirements"
on staffing_requirements for all
using (
  exists (
    select 1 from employees
    where id = auth.uid()
    and user_role in ('Manager', 'Admin')
  )
);

-- Set up Storage!
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'avatars') then
    insert into storage.buckets (id, name)
    values ('avatars', 'avatars');
  end if;
end $$;

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Anyone can upload an avatar." on storage.objects;
create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');

drop policy if exists "Anyone can update their own avatar." on storage.objects;
create policy "Anyone can update their own avatar." on storage.objects
  for update using ( auth.uid() = owner ) with check (bucket_id = 'avatars');
