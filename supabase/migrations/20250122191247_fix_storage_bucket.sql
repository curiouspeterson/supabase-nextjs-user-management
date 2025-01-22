-- Drop the storage bucket if it exists
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload an avatar." on storage.objects;
drop policy if exists "Anyone can update their own avatar." on storage.objects;

-- Delete objects in the bucket first
delete from storage.objects where bucket_id = 'avatars';

-- Delete the storage bucket if it exists
delete from storage.buckets where id = 'avatars';

-- Create the storage bucket
insert into storage.buckets (id, name)
values ('avatars', 'avatars');

-- Set up access controls for storage
create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');

create policy "Anyone can update their own avatar." on storage.objects
  for update using ( auth.uid() = owner ) with check (bucket_id = 'avatars'); 