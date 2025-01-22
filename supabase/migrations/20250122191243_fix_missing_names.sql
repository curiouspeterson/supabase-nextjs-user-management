-- Update profiles with missing names using email addresses from auth.users
update public.profiles
set full_name = (
  select email
  from auth.users
  where auth.users.id = profiles.id
)
where full_name is null;

-- Create missing profile records for any employees without them
insert into public.profiles (id, full_name, updated_at)
select 
  e.id,
  coalesce(
    (select email from auth.users where auth.users.id = e.id),
    'Employee ' || e.id::text
  ),
  now()
from public.employees e
left join public.profiles p on e.id = p.id
where p.id is null; 