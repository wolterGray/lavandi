-- Site images stored in Postgres (base64), referenced from site_content as dbimg:<id>

create table if not exists public.site_images (
  id text primary key,
  folder text not null default 'uploads',
  mime_type text not null,
  data_base64 text not null,
  size_bytes integer,
  updated_at timestamptz not null default now()
);

comment on table public.site_images is 'Binary image payloads for nuarr.pl CMS (referenced by dbimg:<id> in site_content)';

alter table public.site_images enable row level security;

drop policy if exists "site_images_public_read" on public.site_images;
create policy "site_images_public_read"
  on public.site_images
  for select
  to anon, authenticated
  using (true);

drop policy if exists "site_images_authenticated_write" on public.site_images;
create policy "site_images_authenticated_write"
  on public.site_images
  for all
  to authenticated
  using (true)
  with check (true);
