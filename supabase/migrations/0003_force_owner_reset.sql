-- ════════════════════════════════════════════════════════════════════
-- 0003: Force-reset broken owner account + add resilience helpers
-- ────────────────────────────────────────────────────────────────────
-- Why: The previous SQL attempts created an auth.users row with a
--      password hash that Supabase Auth doesn't accept. Easiest fix:
--      delete the broken row so signup can recreate it cleanly via
--      Supabase's own (correct) hashing.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ──────── 1. RPC to force-reset any broken admin auth account ────────
-- Safe: only works if the target email is already in the admins table
-- (i.e. an authorized owner who needs to recover their broken signup).
create or replace function public.force_reset_admin_account(p_email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid;
begin
  if not exists (select 1 from admins where lower(email) = lower(p_email)) then
    raise exception 'Email not in admins table';
  end if;

  select id into uid from auth.users where lower(email) = lower(p_email);
  if uid is not null then
    delete from auth.identities where user_id = uid;
    delete from auth.users where id = uid;
  end if;
end;
$$;

grant execute on function public.force_reset_admin_account(text) to anon, authenticated;

-- ──────── 2. ONE-TIME: clean up the broken owner row right now ────────
do $$
declare
  uid uuid;
  target_email text := 'ahmedgamal17998@gmail.com';
begin
  select id into uid from auth.users where lower(email) = lower(target_email);
  if uid is not null then
    delete from auth.identities where user_id = uid;
    delete from auth.users where id = uid;
    raise notice 'Deleted broken auth.users row for %', target_email;
  else
    raise notice 'No broken auth.users row found for %', target_email;
  end if;
end $$;

-- ──────── 3. Ensure admins row still exists ────────
insert into admins (email, full_name, role, is_active)
values ('ahmedgamal17998@gmail.com', 'Ahmed Gamal', 'super_admin', true)
on conflict (email) do update set role = 'super_admin', is_active = true;

-- ──────── 4. Verify ────────
select
  'After running this, sign up via /admin/login (NOT login). Supabase will create the user with the correct hash.' as next_step,
  (select count(*) from auth.users where lower(email) = 'ahmedgamal17998@gmail.com') as broken_rows_remaining,
  (select count(*) from admins where lower(email) = 'ahmedgamal17998@gmail.com' and is_active) as admin_row_ok;
