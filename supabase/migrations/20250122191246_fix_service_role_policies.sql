-- Drop existing policies if they exist
drop policy if exists "Service role can manage profiles" on profiles;
drop policy if exists "Service role can manage employees" on employees;

-- Add policy for service role to manage profiles
create policy "Service role can manage profiles"
on profiles
for all
using (auth.jwt() ->> 'role' = 'service_role')
with check (auth.jwt() ->> 'role' = 'service_role');

-- Add policy for service role to manage employees
create policy "Service role can manage employees"
on employees
for all
using (auth.jwt() ->> 'role' = 'service_role')
with check (auth.jwt() ->> 'role' = 'service_role'); 