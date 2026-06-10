-- NUAR public site CMS (works alongside your existing CRM tables in the same Supabase project)
-- Run in Supabase SQL Editor or via CLI: supabase db push

create table if not exists public.site_content (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.site_content is 'Published overrides for nuarr.pl landing page CMS';

insert into public.site_content (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_content enable row level security;

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "site_content_authenticated_write" on public.site_content;
create policy "site_content_authenticated_write"
  on public.site_content
  for all
  to authenticated
  using (true)
  with check (true);

-- Optional: grant CRM admins access by creating users in Supabase Auth
-- Authentication → Users → Add user (same emails as your CRM team)
