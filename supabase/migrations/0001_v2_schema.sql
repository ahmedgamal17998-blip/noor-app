-- ════════════════════════════════════════════════════════════════════
-- Noor v2 — Character Building App Schema
-- ────────────────────────────────────────────────────────────────────
-- This migration is idempotent: safe to run multiple times.
-- It extends existing v1 tables (mothers, children) and adds 13 new tables.
-- Apply in Supabase SQL Editor: Dashboard → SQL Editor → New query → paste → Run
-- ════════════════════════════════════════════════════════════════════

-- ──────── EXTENSIONS ────────
create extension if not exists "uuid-ossp";

-- ════════════════════════════════════════
-- 1. AUTH & USERS — extend existing v1 tables
-- ════════════════════════════════════════

-- mothers: v1 had (id, name, email, created_at)
-- v2 adds: full_name, phone, city, parent_password, subscription_*, updated_at
do $$ begin
  if exists (select 1 from information_schema.tables where table_name = 'mothers') then
    alter table mothers add column if not exists full_name text;
    alter table mothers add column if not exists phone text;
    alter table mothers add column if not exists city text;
    alter table mothers add column if not exists parent_password text;
    alter table mothers add column if not exists subscription_plan text default 'free';
    alter table mothers add column if not exists subscription_status text default 'trial';
    alter table mothers add column if not exists trial_ends_at timestamptz;
    alter table mothers add column if not exists updated_at timestamptz default now();
    -- back-fill full_name from name if it exists
    update mothers set full_name = coalesce(full_name, name) where full_name is null;
  else
    create table mothers (
      id uuid primary key default gen_random_uuid(),
      email text unique not null,
      name text,
      full_name text not null,
      phone text,
      city text,
      parent_password text,
      subscription_plan text default 'free',
      subscription_status text default 'trial',
      trial_ends_at timestamptz,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  end if;
end $$;

-- children: v1 had (id, mother_id, name, age, total_xp, created_at)
-- v2 adds: gender, avatar_config, school_schedule, current_streak, longest_streak, last_active_at
alter table children add column if not exists gender text;
alter table children add column if not exists avatar_config jsonb default '{}'::jsonb;
alter table children add column if not exists school_schedule jsonb;
alter table children add column if not exists current_streak int default 0;
alter table children add column if not exists longest_streak int default 0;
alter table children add column if not exists last_active_at timestamptz;

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text default 'admin',
  permissions jsonb default '{}'::jsonb,
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now()
);

-- ════════════════════════════════════════
-- 2. CONTENT (Admin-Managed)
-- ════════════════════════════════════════

create table if not exists surahs (
  id uuid primary key default gen_random_uuid(),
  surah_number int unique not null,
  name_arabic text not null,
  name_english text,
  total_ayahs int not null,
  revelation_type text,
  level_order int not null,
  is_active boolean default true,
  required_plan text default 'basic',
  created_at timestamptz default now()
);
create index if not exists idx_surahs_level on surahs(level_order) where is_active;

create table if not exists ayahs (
  id uuid primary key default gen_random_uuid(),
  surah_id uuid references surahs(id) on delete cascade,
  ayah_number int not null,
  text_arabic text not null,
  text_with_tashkeel text not null,
  audio_url text,
  audio_url_repeat text,
  unique(surah_id, ayah_number)
);
create index if not exists idx_ayahs_surah on ayahs(surah_id, ayah_number);

create table if not exists surah_stories (
  id uuid primary key default gen_random_uuid(),
  surah_id uuid references surahs(id) on delete cascade,
  title text not null,
  reason_of_revelation text,
  story_text text not null,
  story_image_url text,
  story_audio_url text,
  story_video_url text,
  meaning_simplified text,
  age_range text default '5-12',
  language text default 'ar',
  is_active boolean default true,
  created_by uuid references admins(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists life_missions (
  id uuid primary key default gen_random_uuid(),
  surah_id uuid references surahs(id) on delete cascade,
  title text not null,
  description text not null,
  target_audience text default 'with_mother',
  difficulty text default 'easy',
  xp_reward int default 10,
  display_order int default 0,
  is_active boolean default true,
  created_by uuid references admins(id),
  created_at timestamptz default now()
);

create table if not exists comprehension_questions (
  id uuid primary key default gen_random_uuid(),
  surah_id uuid references surahs(id) on delete cascade,
  question_text text not null,
  correct_answer text not null,
  options jsonb,
  question_type text default 'open',
  xp_reward int default 5,
  is_active boolean default true
);

-- ════════════════════════════════════════
-- 3. JOURNEY BUILDER
-- ════════════════════════════════════════

create table if not exists surah_steps (
  id uuid primary key default gen_random_uuid(),
  surah_id uuid references surahs(id) on delete cascade,
  step_number int not null,
  step_type text not null,
  -- valid types: 'listen', 'story', 'listen_repeat', 'recite_to_mom',
  --              'tell_story', 'life_mission', 'comprehension', 'ai_recite'
  step_title text not null,
  step_description text,
  config jsonb default '{}'::jsonb,
  required_completion_count int default 1,
  requires_mother_approval boolean default false,
  xp_reward int default 10,
  display_order int not null,
  is_active boolean default true,
  unique(surah_id, step_number)
);
create index if not exists idx_steps_surah_order on surah_steps(surah_id, display_order);

-- ════════════════════════════════════════
-- 4. PROGRESS TRACKING
-- ════════════════════════════════════════

create table if not exists child_surah_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  surah_id uuid references surahs(id) on delete cascade,
  current_step int default 1,
  is_completed boolean default false,
  started_at timestamptz default now(),
  completed_at timestamptz,
  total_xp_earned int default 0,
  unique(child_id, surah_id)
);
create index if not exists idx_progress_child on child_surah_progress(child_id);

create table if not exists step_completions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  step_id uuid references surah_steps(id) on delete cascade,
  completion_count int default 1,
  approved_by_mother boolean default false,
  approved_at timestamptz,
  xp_earned int default 0,
  completed_at timestamptz default now()
);
create index if not exists idx_step_compl_child on step_completions(child_id, step_id);

create table if not exists mission_completions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  mission_id uuid references life_missions(id) on delete cascade,
  mother_note text,
  is_confirmed boolean default false,
  confirmed_at timestamptz,
  xp_earned int default 0,
  created_at timestamptz default now()
);
create index if not exists idx_mission_compl_child on mission_completions(child_id);

-- ════════════════════════════════════════
-- 5. GAMIFICATION
-- ════════════════════════════════════════

create table if not exists avatar_items (
  id uuid primary key default gen_random_uuid(),
  item_type text not null,           -- head | body | accessory | background
  item_name text not null,
  item_image_url text not null,
  xp_cost int not null,
  gender text default 'both',
  category text default 'islamic',
  is_active boolean default true
);

create table if not exists child_avatar_items (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  item_id uuid references avatar_items(id) on delete cascade,
  purchased_at timestamptz default now(),
  unique(child_id, item_id)
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  achievement_type text not null,
  title text not null,
  description text,
  badge_image_url text,
  unlocked_at timestamptz default now()
);
create index if not exists idx_ach_child on achievements(child_id);

-- ════════════════════════════════════════
-- 6. COMMUNITY
-- ════════════════════════════════════════

create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid references mothers(id) on delete cascade,
  content text not null,
  category text default 'general',
  likes_count int default 0,
  is_pinned boolean default false,
  is_hidden boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_posts_recent on community_posts(created_at desc) where not is_hidden;

create table if not exists community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  mother_id uuid references mothers(id) on delete cascade,
  content text not null,
  is_hidden boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_comments_post on community_comments(post_id);

create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  mother_id uuid references mothers(id) on delete cascade,
  unique(post_id, mother_id)
);

-- ════════════════════════════════════════
-- 7. CLEANUP: drop v1 tables that v2 replaces
-- ════════════════════════════════════════
-- v1 'sessions' (recording sessions) replaced by 'step_completions'
-- v1 'daily_tasks' replaced by 'mission_completions'
-- Keeping them commented for safety; uncomment if you want clean slate:
-- drop table if exists sessions;
-- drop table if exists daily_tasks;

-- ════════════════════════════════════════
-- 8. ROW LEVEL SECURITY (basic policies)
-- ════════════════════════════════════════

alter table mothers enable row level security;
alter table children enable row level security;
alter table admins enable row level security;
alter table surahs enable row level security;
alter table ayahs enable row level security;
alter table surah_stories enable row level security;
alter table life_missions enable row level security;
alter table comprehension_questions enable row level security;
alter table surah_steps enable row level security;
alter table child_surah_progress enable row level security;
alter table step_completions enable row level security;
alter table mission_completions enable row level security;
alter table avatar_items enable row level security;
alter table child_avatar_items enable row level security;
alter table achievements enable row level security;
alter table community_posts enable row level security;
alter table community_comments enable row level security;
alter table post_likes enable row level security;

-- Mother can read/update only her own row
drop policy if exists "mother self select" on mothers;
create policy "mother self select" on mothers for select using (auth.uid() = id);
drop policy if exists "mother self update" on mothers;
create policy "mother self update" on mothers for update using (auth.uid() = id);

-- Mother can read/write only her children
drop policy if exists "mother own children select" on children;
create policy "mother own children select" on children for select using (mother_id = auth.uid());
drop policy if exists "mother own children insert" on children;
create policy "mother own children insert" on children for insert with check (mother_id = auth.uid());
drop policy if exists "mother own children update" on children;
create policy "mother own children update" on children for update using (mother_id = auth.uid());
drop policy if exists "mother own children delete" on children;
create policy "mother own children delete" on children for delete using (mother_id = auth.uid());

-- Content tables (surahs/ayahs/stories/missions/steps): readable to all authenticated, writable only by admins via service_role
drop policy if exists "content public read" on surahs;
create policy "content public read" on surahs for select using (is_active);
drop policy if exists "ayahs public read" on ayahs;
create policy "ayahs public read" on ayahs for select using (true);
drop policy if exists "stories public read" on surah_stories;
create policy "stories public read" on surah_stories for select using (is_active);
drop policy if exists "missions public read" on life_missions;
create policy "missions public read" on life_missions for select using (is_active);
drop policy if exists "steps public read" on surah_steps;
create policy "steps public read" on surah_steps for select using (is_active);
drop policy if exists "questions public read" on comprehension_questions;
create policy "questions public read" on comprehension_questions for select using (is_active);
drop policy if exists "avatar items public read" on avatar_items;
create policy "avatar items public read" on avatar_items for select using (is_active);

-- Progress tracking: child rows readable by their mother
drop policy if exists "progress by mother" on child_surah_progress;
create policy "progress by mother" on child_surah_progress for all using (
  child_id in (select id from children where mother_id = auth.uid())
);
drop policy if exists "step compl by mother" on step_completions;
create policy "step compl by mother" on step_completions for all using (
  child_id in (select id from children where mother_id = auth.uid())
);
drop policy if exists "mission compl by mother" on mission_completions;
create policy "mission compl by mother" on mission_completions for all using (
  child_id in (select id from children where mother_id = auth.uid())
);
drop policy if exists "child avatar items by mother" on child_avatar_items;
create policy "child avatar items by mother" on child_avatar_items for all using (
  child_id in (select id from children where mother_id = auth.uid())
);
drop policy if exists "achievements by mother" on achievements;
create policy "achievements by mother" on achievements for all using (
  child_id in (select id from children where mother_id = auth.uid())
);

-- Community: posts readable by authenticated mothers; writable by author
drop policy if exists "posts read" on community_posts;
create policy "posts read" on community_posts for select using (not is_hidden);
drop policy if exists "posts author write" on community_posts;
create policy "posts author write" on community_posts for insert with check (mother_id = auth.uid());
drop policy if exists "posts author update" on community_posts;
create policy "posts author update" on community_posts for update using (mother_id = auth.uid());

drop policy if exists "comments read" on community_comments;
create policy "comments read" on community_comments for select using (not is_hidden);
drop policy if exists "comments author write" on community_comments;
create policy "comments author write" on community_comments for insert with check (mother_id = auth.uid());

drop policy if exists "likes own" on post_likes;
create policy "likes own" on post_likes for all using (mother_id = auth.uid());

-- ════════════════════════════════════════
-- DONE. Apply this file in Supabase SQL editor.
-- Next: run the seed script (npm run seed) once schema is live.
-- ════════════════════════════════════════
