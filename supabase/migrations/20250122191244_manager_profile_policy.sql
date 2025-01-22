-- Add policy for managers and admins to update profiles
create policy "Managers and Admins can update profiles."
on profiles
for update
using (
  exists (
    select 1 
    from employees 
    where id = auth.uid() 
    and user_role in ('Manager', 'Admin')
  )
); 