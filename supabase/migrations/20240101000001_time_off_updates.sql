-- Add missing columns to time_off_requests if they don't exist
do $$ 
begin
    if not exists (select 1 from information_schema.columns 
                  where table_name = 'time_off_requests' and column_name = 'notes') then
        alter table time_off_requests add column notes text;
    end if;

    if not exists (select 1 from information_schema.columns 
                  where table_name = 'time_off_requests' and column_name = 'submitted_at') then
        alter table time_off_requests add column submitted_at timestamptz default now() not null;
    end if;

    if not exists (select 1 from information_schema.columns 
                  where table_name = 'time_off_requests' and column_name = 'created_at') then
        alter table time_off_requests add column created_at timestamptz default now() not null;
    end if;

    if not exists (select 1 from information_schema.columns 
                  where table_name = 'time_off_requests' and column_name = 'updated_at') then
        alter table time_off_requests add column updated_at timestamptz default now() not null;
    end if;
end $$;

-- Drop existing functions if they exist
drop function if exists get_time_off_requests();
drop function if exists get_users_by_ids(user_ids uuid[]);

-- Create function to get user data by IDs
create or replace function get_users_by_ids(user_ids uuid[])
returns table (
  id uuid,
  email text
)
security definer
set search_path = public
language sql
as $$
  select u.id, u.email::text
  from auth.users u
  where u.id = any(user_ids);
$$;

-- Grant execute permission on the function
revoke execute on function get_users_by_ids(uuid[]) from public;
grant execute on function get_users_by_ids(uuid[]) to authenticated;

-- Create function to get time off requests with user details
create or replace function get_time_off_requests()
returns table (
  id uuid,
  employee_id uuid,
  employee_email text,
  employee_full_name text,
  start_date date,
  end_date date,
  type text,
  status text,
  notes text,
  reviewed_by uuid,
  reviewer_email text,
  reviewer_full_name text,
  reviewed_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
) as $$
begin
  return query
  select
    r.id,
    r.employee_id,
    e.email as employee_email,
    ep.full_name as employee_full_name,
    r.start_date,
    r.end_date,
    r.type,
    r.status,
    r.notes,
    r.reviewed_by,
    rv.email as reviewer_email,
    rp.full_name as reviewer_full_name,
    r.reviewed_at,
    r.submitted_at,
    r.created_at,
    r.updated_at
  from time_off_requests r
  left join auth.users e on e.id = r.employee_id
  left join profiles ep on ep.id = r.employee_id
  left join auth.users rv on rv.id = r.reviewed_by
  left join profiles rp on rp.id = r.reviewed_by
  where (
    auth.uid() = r.employee_id
    or exists (
      select 1 from employees
      where id = auth.uid()
      and user_role in ('Manager', 'Admin')
    )
  )
  order by r.submitted_at desc;
end;
$$ language plpgsql
security definer;

-- Function to update updated_at timestamp
create or replace function update_time_off_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at timestamp
drop trigger if exists update_time_off_requests_updated_at on time_off_requests;
create trigger update_time_off_requests_updated_at
  before update on time_off_requests
  for each row
  execute function update_time_off_updated_at(); 