-- ════════════════════════════════════════════════════════════════════
-- 0006: Full Mothers Community Feed
-- ────────────────────────────────────────────────────────────────────
-- Adds:
--   - post_prays  (🤲 ادعي لها reaction table)
--   - post_saves  (🔖 حفظ table)
--   - community_posts columns: topic, audience, prays_count, saves_count, scene
--   - community_comments column: likes_count
--   - RPC get_community_feed (returns posts with user's like/pray/save state +
--     top comment) — bypasses RLS safely via SECURITY DEFINER
-- ════════════════════════════════════════════════════════════════════

-- ─────── 1. Add columns to community_posts ───────
alter table community_posts add column if not exists topic text;
alter table community_posts add column if not exists audience text default 'الكل';
alter table community_posts add column if not exists prays_count int default 0;
alter table community_posts add column if not exists saves_count int default 0;
alter table community_posts add column if not exists scene text;       -- 'nursery' | 'plate' | 'duacard' | 'walk'
alter table community_posts add column if not exists author_tone int default 0;

-- ─────── 2. Add likes_count to comments ───────
alter table community_comments add column if not exists likes_count int default 0;

-- ─────── 3. New tables: post_prays + post_saves ───────
create table if not exists post_prays (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  mother_id uuid references mothers(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, mother_id)
);

create table if not exists post_saves (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  mother_id uuid references mothers(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, mother_id)
);

alter table post_prays enable row level security;
alter table post_saves enable row level security;

drop policy if exists "prays own" on post_prays;
create policy "prays own" on post_prays for all using (mother_id = auth.uid());

drop policy if exists "saves own" on post_saves;
create policy "saves own" on post_saves for all using (mother_id = auth.uid());

-- ─────── 4. Counter sync functions (triggers update counts) ───────
create or replace function public.bump_post_likes()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update community_posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update community_posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  end if;
  return null;
end; $$;

drop trigger if exists trg_post_likes on post_likes;
create trigger trg_post_likes after insert or delete on post_likes
  for each row execute function public.bump_post_likes();

create or replace function public.bump_post_prays()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update community_posts set prays_count = prays_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update community_posts set prays_count = greatest(0, prays_count - 1) where id = old.post_id;
  end if;
  return null;
end; $$;

drop trigger if exists trg_post_prays on post_prays;
create trigger trg_post_prays after insert or delete on post_prays
  for each row execute function public.bump_post_prays();

create or replace function public.bump_post_saves()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update community_posts set saves_count = saves_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update community_posts set saves_count = greatest(0, saves_count - 1) where id = old.post_id;
  end if;
  return null;
end; $$;

drop trigger if exists trg_post_saves on post_saves;
create trigger trg_post_saves after insert or delete on post_saves
  for each row execute function public.bump_post_saves();

-- ─────── 5. RPC: get_community_feed ───────
-- Returns enriched feed: posts + author info + reaction state + top comment.
-- SECURITY DEFINER so it can join admins table for verified badge.
create or replace function public.get_community_feed(
  p_category text default null,
  p_sort text default 'latest',
  p_limit int default 30
)
returns table (
  id uuid,
  mother_id uuid,
  content text,
  category text,
  topic text,
  audience text,
  scene text,
  author_tone int,
  likes_count int,
  prays_count int,
  saves_count int,
  is_pinned boolean,
  created_at timestamptz,
  author_name text,
  author_email text,
  is_verified boolean,
  badge text,
  i_liked boolean,
  i_prayed boolean,
  i_saved boolean,
  top_comment_id uuid,
  top_comment_author text,
  top_comment_text text,
  top_comment_likes int,
  top_comment_created_at timestamptz,
  comments_total int
)
language plpgsql security definer set search_path = public, auth as $$
declare
  uid uuid := auth.uid();
begin
  return query
  with comments_per_post as (
    select c.post_id,
           count(*)::int as total,
           (select c2.id from community_comments c2
              where c2.post_id = c.post_id and not c2.is_hidden
              order by coalesce(c2.likes_count, 0) desc, c2.created_at asc limit 1) as top_id
    from community_comments c
    where not c.is_hidden
    group by c.post_id
  )
  select
    p.id, p.mother_id, p.content, p.category, p.topic, p.audience, p.scene,
    coalesce(p.author_tone, 0) as author_tone,
    p.likes_count, p.prays_count, p.saves_count, p.is_pinned, p.created_at,
    coalesce(m.full_name, m.email, 'أم') as author_name,
    m.email as author_email,
    exists (select 1 from admins a where lower(a.email) = lower(m.email) and a.is_active) as is_verified,
    case
      when exists (select 1 from admins a where lower(a.email) = lower(m.email) and a.is_active) then 'مشرفة'
      else null
    end as badge,
    coalesce((select true from post_likes pl where pl.post_id = p.id and pl.mother_id = uid limit 1), false) as i_liked,
    coalesce((select true from post_prays pp where pp.post_id = p.id and pp.mother_id = uid limit 1), false) as i_prayed,
    coalesce((select true from post_saves ps where ps.post_id = p.id and ps.mother_id = uid limit 1), false) as i_saved,
    tc.id as top_comment_id,
    tcm.full_name as top_comment_author,
    tc.content as top_comment_text,
    coalesce(tc.likes_count, 0) as top_comment_likes,
    tc.created_at as top_comment_created_at,
    coalesce(cpp.total, 0) as comments_total
  from community_posts p
  left join mothers m on m.id = p.mother_id
  left join comments_per_post cpp on cpp.post_id = p.id
  left join community_comments tc on tc.id = cpp.top_id
  left join mothers tcm on tcm.id = tc.mother_id
  where not p.is_hidden
    and (p_category is null or p_category = 'all' or p.category = p_category)
  order by
    p.is_pinned desc,
    case when p_sort = 'top' then p.likes_count + p.prays_count else 0 end desc,
    p.created_at desc
  limit p_limit;
end; $$;

grant execute on function public.get_community_feed(text, text, int) to authenticated, anon;

-- ─────── 6. Recompute current counts (one-time backfill) ───────
update community_posts p
set likes_count = (select count(*) from post_likes where post_id = p.id),
    prays_count = coalesce((select count(*) from post_prays where post_id = p.id), 0),
    saves_count = coalesce((select count(*) from post_saves where post_id = p.id), 0);

-- ─────── 7. Verify ───────
select
  (select count(*) from community_posts) as posts,
  (select count(*) from post_likes) as likes,
  (select count(*) from post_prays) as prays,
  (select count(*) from post_saves) as saves,
  (select count(*) from pg_proc where proname = 'get_community_feed') as rpc_present;
