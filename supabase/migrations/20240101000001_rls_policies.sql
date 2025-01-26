-- Enable RLS
alter table public.profiles enable row level security;
alter table public.employees enable row level security;
alter table public.shift_types enable row level security;
alter table public.shifts enable row level security;
alter table public.schedules enable row level security;
alter table public.time_off_requests enable row level security;
alter table public.staffing_requirements enable row level security;
alter table public.shift_patterns enable row level security;
alter table public.employee_patterns enable row level security;
alter table public.daily_coverage enable row level security;

-- Drop ALL existing policies
drop policy if exists "employee_base_access" on public.employees;
drop policy if exists "profile_access" on public.profiles;
drop policy if exists "shift_types_access" on public.shift_types;
drop policy if exists "shifts_access" on public.shifts;
drop policy if exists "schedule_access" on public.schedules;
drop policy if exists "time_off_access" on public.time_off_requests;
drop policy if exists "staffing_access" on public.staffing_requirements;
drop policy if exists "pattern_access" on public.shift_patterns;
drop policy if exists "employee_pattern_access" on public.employee_patterns;
drop policy if exists "coverage_access" on public.daily_coverage;

-- Create role check function
create or replace function auth.check_role(required_roles text[])
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- During signup/initial auth, allow self-access
  if auth.uid() = current_setting('request.jwt.claims')::json->>'sub' then
    return true;
  end if;
  
  -- Check role from JWT
  return (
    select (current_setting('request.jwt.claims')::json->>'role') = any(required_roles)
  );
end;
$$;

-- Employee policies split by operation
create policy "employees_self_read"
on public.employees
for select
to authenticated
using (auth.uid() = id);

create policy "employees_admin_read"
on public.employees
for select
to authenticated
using (auth.check_role(array['Manager', 'Admin', 'Supervisor']));

create policy "employees_self_insert"
on public.employees
for insert
to authenticated
with check (auth.uid() = id);

create policy "employees_self_update"
on public.employees
for update
to authenticated
using (auth.uid() = id);

create policy "employees_admin_write"
on public.employees
for all
to authenticated
using (auth.check_role(array['Manager', 'Admin']));

-- Profile policies
create policy "profiles_self_access"
on public.profiles
for all
to authenticated
using (auth.uid() = id);

-- Shift management policies
create policy "shift_types_read"
on public.shift_types
for select
to authenticated
using (true);

create policy "shift_types_write"
on public.shift_types
for insert
to authenticated
with check (auth.check_role(array['Manager', 'Admin']));

create policy "shifts_read"
on public.shifts
for select
to authenticated
using (true);

create policy "shifts_write"
on public.shifts
for all
to authenticated
using (auth.check_role(array['Manager', 'Admin']));

-- Schedule policies
create policy "schedules_self_read"
on public.schedules
for select
to authenticated
using (employee_id = auth.uid());

create policy "schedules_admin_access"
on public.schedules
for all
to authenticated
using (auth.check_role(array['Manager', 'Admin']));

-- Time off request policies
create policy "time_off_self_read"
on public.time_off_requests
for select
to authenticated
using (employee_id = auth.uid());

create policy "time_off_admin_access"
on public.time_off_requests
for all
to authenticated
using (auth.check_role(array['Manager', 'Admin']));

-- Staffing requirements
create policy "staffing_read"
on public.staffing_requirements
for select
to authenticated
using (true);

create policy "staffing_write"
on public.staffing_requirements
for all
to authenticated
using (auth.check_role(array['Manager', 'Admin']));

-- Pattern management
create policy "patterns_read"
on public.shift_patterns
for select
to authenticated
using (true);

create policy "patterns_write"
on public.shift_patterns
for all
to authenticated
using (auth.check_role(array['Manager', 'Admin']));

create policy "employee_patterns_self_read"
on public.employee_patterns
for select
to authenticated
using (employee_id = auth.uid());

create policy "employee_patterns_admin_access"
on public.employee_patterns
for all
to authenticated
using (auth.check_role(array['Manager', 'Admin']));

-- Coverage management
create policy "coverage_read"
on public.daily_coverage
for select
to authenticated
using (true);

create policy "coverage_write"
on public.daily_coverage
for all
to authenticated
using (auth.check_role(array['Manager', 'Admin'])); 