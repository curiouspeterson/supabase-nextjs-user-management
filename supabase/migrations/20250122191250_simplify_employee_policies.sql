-- Drop existing policies
drop policy if exists "Employees can view their own employee record." on employees;
drop policy if exists "Managers and Admins can view all employees." on employees;
drop policy if exists "Managers and Admins can insert employees." on employees;
drop policy if exists "Managers and Admins can update employees." on employees;
drop policy if exists "Managers and Admins can delete employees." on employees;

-- Create a single policy for viewing records
create policy "Enable read access for authenticated users"
on employees
for select
using (true);

-- Create a policy for users to view and update their own records
create policy "Users can update their own record"
on employees
for update
using (auth.uid() = id);

-- Create a policy for managers/admins to manage all records
create policy "Managers and admins can manage all records"
on employees
for all
using (
  auth.uid() in (
    select id from employees 
    where user_role in ('Manager', 'Admin')
    and id != employees.id -- Prevent recursion by excluding the current record
  )
); 