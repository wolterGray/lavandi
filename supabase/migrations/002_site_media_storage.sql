-- Supabase Storage for site CMS images (run in SQL Editor after 001_site_content.sql)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site_media_public_read" on storage.objects;
create policy "site_media_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'site-media');

drop policy if exists "site_media_authenticated_insert" on storage.objects;
create policy "site_media_authenticated_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'site-media');

drop policy if exists "site_media_authenticated_update" on storage.objects;
create policy "site_media_authenticated_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'site-media')
  with check (bucket_id = 'site-media');

drop policy if exists "site_media_authenticated_delete" on storage.objects;
create policy "site_media_authenticated_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'site-media');
