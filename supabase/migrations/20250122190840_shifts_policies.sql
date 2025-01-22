-- Enable RLS
alter table "public"."shifts" enable row level security;

-- Create policies
create policy "Enable read access for authenticated users"
on "public"."shifts"
for select
to authenticated
using (true);

create policy "Enable insert access for authenticated users"
on "public"."shifts"
for insert
to authenticated
with check (true);

create policy "Enable update access for authenticated users"
on "public"."shifts"
for update
to authenticated
using (true);

create policy "Enable delete access for authenticated users"
on "public"."shifts"
for delete
to authenticated
using (true);
