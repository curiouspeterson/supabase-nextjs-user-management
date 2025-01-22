-- Create tables for the 911 dispatch scheduling system

-- Employees Table (extends profiles)
create table employees (
  id uuid references auth.users not null primary key,
  employee_role text not null check (employee_role in ('Dispatcher', 'Shift Supervisor', 'Management')),
  user_role text not null check (user_role in ('Employee', 'Manager', 'Admin')),
  weekly_hours_scheduled integer default 0,
  constraint fk_profile foreign key (id) references profiles(id)
);

-- Shifts Table
create table shifts (
  id uuid primary key default uuid_generate_v4(),
  shift_name text not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  duration_hours integer not null
);

-- Schedules Table
create table schedules (
  id uuid primary key default uuid_generate_v4(),
  week_start_date date not null,
  day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  shift_id uuid references shifts (id) not null,
  employee_id uuid references employees (id) not null,
  schedule_status text not null default 'Draft' check (schedule_status in ('Draft', 'Published')),
  unique (week_start_date, day_of_week, employee_id)
);

-- Time Off Requests Table
create table time_off_requests (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees (id) not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Denied')),
  request_date timestamp with time zone default timezone('utc'::text, now()),
  manager_notes text
);

-- Staffing Requirements Table
create table staffing_requirements (
  id uuid primary key default uuid_generate_v4(),
  period_name text not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  minimum_employees integer not null
);

-- Row Level Security Policies

-- Employees table policies
alter table employees enable row level security;

create policy "Employees can view their own employee record." on employees
  for select using (auth.uid() = id);

create policy "Managers and Admins can CRUD employees." on employees
  for all using (
    exists (
      select 1 from employees where id = auth.uid() and user_role in ('Manager', 'Admin')
    )
  );

-- Shifts table policies
alter table shifts enable row level security;

create policy "Shifts are viewable by everyone." on shifts
  for select using (true);

create policy "Managers and Admins can CRUD shifts." on shifts
  for all using (
    exists (
      select 1 from employees where id = auth.uid() and user_role in ('Manager', 'Admin')
    )
  );

-- Schedules table policies
alter table schedules enable row level security;

create policy "Employees can view their own schedule." on schedules
  for select using (employee_id = auth.uid());

create policy "Managers and Admins can CRUD schedules." on schedules
  for all using (
    exists (
      select 1 from employees where id = auth.uid() and user_role in ('Manager', 'Admin')
    )
  );

-- Time Off Requests table policies
alter table time_off_requests enable row level security;

create policy "Employees can view their own time off requests." on time_off_requests
  for select using (employee_id = auth.uid());

create policy "Employees can insert their own time off requests." on time_off_requests
  for insert with check (employee_id = auth.uid());

create policy "Managers and Admins can CRUD all time off requests." on time_off_requests
  for all using (
    exists (
      select 1 from employees where id = auth.uid() and user_role in ('Manager', 'Admin')
    )
  );

-- Staffing Requirements table policies
alter table staffing_requirements enable row level security;

create policy "Staffing requirements are viewable by everyone." on staffing_requirements
  for select using (true);

create policy "Managers and Admins can CRUD staffing requirements." on staffing_requirements
  for all using (
    exists (
      select 1 from employees where id = auth.uid() and user_role in ('Manager', 'Admin')
    )
  );

-- Initial Shifts Data
insert into shifts (shift_name, start_time, end_time, duration_hours) values
  ('Day Shift Early (4 hours)', '05:00:00', '09:00:00', 4),
  ('Day Shift Early (10 hours)', '05:00:00', '15:00:00', 10),
  ('Day Shift Early (12 hours)', '05:00:00', '17:00:00', 12),
  ('Day Shift (4 hours)', '09:00:00', '13:00:00', 4),
  ('Day Shift (10 hours)', '09:00:00', '19:00:00', 10),
  ('Day Shift (12 hours)', '09:00:00', '21:00:00', 12),
  ('Swing Shift (4 hours)', '13:00:00', '17:00:00', 4),
  ('Swing Shift (10 hours)', '15:00:00', '01:00:00', 10),
  ('Swing Shift (12 hours)', '15:00:00', '03:00:00', 12),
  ('Graveyards (4 hours)', '01:00:00', '05:00:00', 4),
  ('Graveyards (10 hours)', '19:00:00', '05:00:00', 10),
  ('Graveyards (12 hours)', '17:00:00', '05:00:00', 12);

-- Initial Staffing Requirements Data
insert into staffing_requirements (period_name, start_time, end_time, minimum_employees) values
  ('Early Morning', '05:00:00', '09:00:00', 6),
  ('Day', '09:00:00', '21:00:00', 8),
  ('Evening', '21:00:00', '01:00:00', 7),
  ('Night', '01:00:00', '05:00:00', 6);

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
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.employees (id, employee_role, user_role)
  values (new.id, 'Dispatcher', 'Employee');
  
  return new;
end;
$$ language plpgsql security definer; 