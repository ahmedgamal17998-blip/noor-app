-- ════════════════════════════════════════════════════════════════════
-- 0005: Storage bucket for step videos + per-step video URL column
-- ════════════════════════════════════════════════════════════════════

-- ──────── 1. Add video_url to surah_steps ────────
alter table surah_steps
  add column if not exists video_url text;

-- ──────── 2. Create public bucket for step videos ────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'step-videos',
  'step-videos',
  true,
  52428800, -- 50 MB max per file
  array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 52428800;

-- ──────── 3. Storage RLS policies ────────
-- Public read: anyone (kids, mothers) can watch
drop policy if exists "step-videos public read" on storage.objects;
create policy "step-videos public read" on storage.objects
  for select
  using (bucket_id = 'step-videos');

-- Admin write: only authenticated admins can upload/delete
drop policy if exists "step-videos admin write" on storage.objects;
create policy "step-videos admin write" on storage.objects
  for insert
  with check (
    bucket_id = 'step-videos'
    and exists (
      select 1 from public.admins a
      inner join auth.users u on lower(u.email) = lower(a.email)
      where u.id = auth.uid() and a.is_active
    )
  );

drop policy if exists "step-videos admin update" on storage.objects;
create policy "step-videos admin update" on storage.objects
  for update
  using (
    bucket_id = 'step-videos'
    and exists (
      select 1 from public.admins a
      inner join auth.users u on lower(u.email) = lower(a.email)
      where u.id = auth.uid() and a.is_active
    )
  );

drop policy if exists "step-videos admin delete" on storage.objects;
create policy "step-videos admin delete" on storage.objects
  for delete
  using (
    bucket_id = 'step-videos'
    and exists (
      select 1 from public.admins a
      inner join auth.users u on lower(u.email) = lower(a.email)
      where u.id = auth.uid() and a.is_active
    )
  );

-- ──────── Done ────────
select
  (select count(*) from storage.buckets where id = 'step-videos') as bucket_created,
  (select count(*) from storage.policies where bucket_id is null or true) as note;
