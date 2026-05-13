-- ════════════════════════════════════════════════════════════════════
-- Noor v2 — Admin Helpers & Auto-Bootstrap
-- ────────────────────────────────────────────────────────────────────
-- Why: The admins table has RLS enabled, but no SELECT policy exists.
--      This means `checkIsAdmin` from the anon-key client returns null
--      even when the user IS in the admins table. We solve this with
--      SECURITY DEFINER functions that safely bypass RLS for the
--      authenticated user's own record only.
--
-- Also adds: bootstrap function for first-time owner setup so users
-- never have to write SQL again.
-- ════════════════════════════════════════════════════════════════════

-- ──────── 1. Get current user's admin role (RLS-safe) ────────
create or replace function public.get_my_admin_role()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  return query
  select a.id, a.email, a.full_name, a.role, a.is_active
  from admins a
  inner join auth.users u on lower(u.email) = lower(a.email)
  where u.id = auth.uid()
    and a.is_active = true;
end;
$$;

grant execute on function public.get_my_admin_role to authenticated;
grant execute on function public.get_my_admin_role to anon;

-- ──────── 2. Ensure-admin-on-signup (idempotent) ────────
-- Called from admin signup flow. If the signed-in user's email already
-- exists in admins → no-op. If not → adds them (only if no admins exist
-- yet — first-user-becomes-owner pattern). Otherwise returns false.
create or replace function public.bootstrap_admin_if_first(p_full_name text)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  user_email text;
  admin_count int;
  user_id uuid;
begin
  user_id := auth.uid();
  if user_id is null then
    return false;
  end if;

  select email into user_email from auth.users where id = user_id;
  if user_email is null then
    return false;
  end if;

  -- Already an admin? Nothing to do.
  if exists (select 1 from admins where lower(email) = lower(user_email) and is_active) then
    return true;
  end if;

  -- No admins exist at all? You become the first owner.
  select count(*) into admin_count from admins where is_active;
  if admin_count = 0 then
    insert into admins (email, full_name, role, is_active)
    values (user_email, coalesce(p_full_name, 'Owner'), 'super_admin', true)
    on conflict (email) do update set
      role = 'super_admin',
      is_active = true,
      full_name = excluded.full_name;
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.bootstrap_admin_if_first(text) to authenticated;

-- ──────── 3. Auto-confirm email for new signups (DEV/MVP convenience) ────────
-- If Confirm Email is on in Supabase Auth, this trigger auto-confirms
-- so users can log in immediately. Remove in v2.1 when we add proper
-- email confirmation UX.
create or replace function public.auto_confirm_email()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_auto_confirm_email on auth.users;
create trigger trg_auto_confirm_email
  before insert on auth.users
  for each row
  execute function public.auto_confirm_email();

-- ──────── 4. Reset password for existing owner (one-time fix) ────────
-- For users who exist in auth.users but have a password that wasn't
-- properly bcrypt-encoded by our previous SQL.
do $$
declare
  target_email text := 'ahmedgamal17998@gmail.com';
  target_password text := 'Capitano98!';
  user_id uuid;
begin
  select id into user_id from auth.users where lower(email) = lower(target_email);

  if user_id is not null then
    -- Reset password using Supabase's bcrypt
    update auth.users
    set encrypted_password = crypt(target_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = user_id;

    -- Ensure identity record exists
    if not exists (select 1 from auth.identities where user_id = user_id and provider = 'email') then
      insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      values (
        gen_random_uuid(),
        user_id,
        jsonb_build_object('sub', user_id::text, 'email', target_email),
        'email',
        target_email,
        now(), now(), now()
      );
    end if;
  end if;
end $$;

-- ──────── DONE ────────
-- After running this migration:
-- 1. The "ahmedgamal17998@gmail.com" user's password is reset to "Capitano98!"
-- 2. Any future signup will auto-confirm their email
-- 3. The admin check works via RPC (bypassing RLS safely)
-- 4. First user to sign up at /admin/login automatically becomes owner
