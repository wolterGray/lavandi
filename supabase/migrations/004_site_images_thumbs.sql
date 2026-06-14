-- Catalog thumbnails: smaller payloads for site_images (cards use thumb, product page uses full)

alter table public.site_images
  add column if not exists thumb_base64 text,
  add column if not exists thumb_mime_type text,
  add column if not exists thumb_size_bytes integer;

comment on column public.site_images.thumb_base64 is 'WebP preview (~480px) for catalog grids; full data_base64 for product pages';
