-- Drop existing policies
drop policy if exists "Employees can view their own employee record." on employees;
drop policy if exists "Managers and Admins can view all employees." on employees;
drop policy if exists "Managers and Admins can insert employees." on employees;
drop policy if exists "Managers and Admins can update employees." on employees;
drop policy if exists "Managers and Admins can delete employees." on employees;

-- Create new policies that avoid accessing auth.users
create policy "Employees can view their own employee record."
on employees
for select
using (auth.uid() = id);

create policy "Managers and Admins can view all employees."
on employees
for select
using (
  exists (
    select 1
    from employees as e
    where e.id = auth.uid()
    and e.user_role in ('Manager', 'Admin')
  )
);

create policy "Managers and Admins can insert employees."
on employees
for insert
with check (
  exists (
    select 1
    from employees as e
    where e.id = auth.uid()
    and e.user_role in ('Manager', 'Admin')
  )
);

create policy "Managers and Admins can update employees."
on employees
for update
using (
  exists (
    select 1
    from employees as e
    where e.id = auth.uid()
    and e.user_role in ('Manager', 'Admin')
  )
);

create policy "Managers and Admins can delete employees."
on employees
for delete
using (
  exists (
    select 1
    from employees as e
    where e.id = auth.uid()
    and e.user_role in ('Manager', 'Admin')
  )
); 