-- Drop existing policies
drop policy if exists "Enable read access for authenticated users" on employees;
drop policy if exists "Users can update their own record" on employees;
drop policy if exists "Managers and admins can manage all records" on employees;

-- Enable RLS
alter table employees enable row level security;

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
on employees for all
using (
  (auth.jwt() ->> 'user_role')::text in ('Manager', 'Admin')
); 