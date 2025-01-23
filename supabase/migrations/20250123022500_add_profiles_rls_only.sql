-- Drop existing RLS policies if they exist
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

-- Enable RLS
alter table if exists profiles enable row level security;

-- Create policy to allow users to select their own profile
create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

-- Create policy to allow users to update their own profile
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Create policy to allow users to insert their own profile
create policy "Users can insert own profile"
on profiles for insert
with check (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role; 