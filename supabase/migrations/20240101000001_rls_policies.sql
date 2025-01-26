-- Enable RLS on all tables
alter table public.employees enable row level security;
alter table public.profiles enable row level security;
alter table public.shifts enable row level security;
alter table public.shift_types enable row level security;
alter table public.schedules enable row level security;
alter table public.time_off_requests enable row level security;
alter table public.staffing_requirements enable row level security;
alter table public.shift_patterns enable row level security;

-- Employees table policies
create policy "employees_read_self"
on public.employees
for select
to authenticated
using (id = auth.uid());

create policy "employees_read_all_managers"
on public.employees
for select
to authenticated
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager');

create policy "employees_update_self"
on public.employees
for update
to authenticated
using (id = auth.uid());

create policy "employees_update_managers"
on public.employees
for update
to authenticated
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager');

-- Profiles table policies
create policy "profiles_read_self"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_read_all_managers"
on public.profiles
for select
to authenticated
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager');

create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (id = auth.uid());

create policy "profiles_update_managers"
on public.profiles
for update
to authenticated
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager');

-- Shifts table policies
create policy "shifts_read"
on public.shifts
for select
to authenticated
using (true);

create policy "shifts_write_managers"
on public.shifts
for all
to authenticated
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager');

-- Shift types policies
create policy "shift_types_read"
on public.shift_types
for select
to authenticated
using (true);

create policy "shift_types_write"
on public.shift_types
for all
to authenticated
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager');

-- Schedules policies
create policy "schedules_read_self"
on public.schedules
for select
to authenticated
using (employee_id = auth.uid());

create policy "schedules_read_all_managers"
on public.schedules
for select
to authenticated
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager');

create policy "schedules_write_managers"
on public.schedules
for all
to authenticated
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager');

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
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager');

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
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager');

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
using (coalesce(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'user_role', '') = 'Manager'); 