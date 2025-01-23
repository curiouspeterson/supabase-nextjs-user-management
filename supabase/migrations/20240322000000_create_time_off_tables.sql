-- Create time_off_requests table
create table if not exists time_off_requests (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references auth.users(id) not null,
  start_date date not null,
  end_date date not null,
  type text not null check (type in ('Vacation', 'Sick', 'Personal', 'Training')),
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Declined')),
  notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  submitted_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create RLS policies for time_off_requests
alter table time_off_requests enable row level security;

-- Policy for employees to view their own requests
create policy "Users can view their own time off requests"
  on time_off_requests for select
  using (auth.uid() = employee_id);

-- Policy for employees to create their own requests
create policy "Users can create their own time off requests"
  on time_off_requests for insert
  with check (auth.uid() = employee_id);

-- Policy for managers to view all requests
create policy "Managers can view all time off requests"
  on time_off_requests for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'manager'
    )
  );

-- Policy for managers to update request status
create policy "Managers can update time off request status"
  on time_off_requests for update
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'manager'
    )
  )
  with check (
    -- Only allow updating status, reviewed_by, and reviewed_at
    (
      select array_agg(name)::text[] = array['status', 'reviewed_by', 'reviewed_at']
      from jsonb_object_keys(to_jsonb(NEW) - to_jsonb(OLD)) as t(name)
    )
  );

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at timestamp
create trigger update_time_off_requests_updated_at
  before update on time_off_requests
  for each row
  execute function update_updated_at_column(); 