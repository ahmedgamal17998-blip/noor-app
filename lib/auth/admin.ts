"use client";

import { supabase, getCurrentSession } from "@/lib/supabase";
import type { Admin } from "@/lib/db/types";

const ADMIN_KEY = "noor.admin.email";

export async function checkIsAdmin(): Promise<Admin | null> {
  if (!supabase) return null;
  const session = await getCurrentSession();
  if (!session) return null;

  // Use RPC with SECURITY DEFINER to bypass RLS safely
  // (queries admins joined to auth.users via auth.uid())
  const { data, error } = await supabase.rpc("get_my_admin_role");

  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  const adminRow = Array.isArray(data) ? data[0] : data;
  if (!adminRow?.email) return null;

  try {
    localStorage.setItem(ADMIN_KEY, adminRow.email);
  } catch {
    /* ignore */
  }

  return {
    id: adminRow.id,
    email: adminRow.email,
    full_name: adminRow.full_name,
    role: adminRow.role,
    permissions: {},
    is_active: adminRow.is_active,
    last_login_at: null,
    created_at: new Date().toISOString(),
  } as Admin;
}

/**
 * Try to bootstrap the current user as the first admin/owner.
 * Returns true if user is now an active admin, false otherwise.
 * Safe to call multiple times (idempotent).
 */
export async function tryBootstrapAdmin(fullName?: string): Promise<boolean> {
  if (!supabase) return false;
  const session = await getCurrentSession();
  if (!session) return false;
  const { data, error } = await supabase.rpc("bootstrap_admin_if_first", {
    p_full_name: fullName ?? null,
  });
  if (error) return false;
  return Boolean(data);
}

export function clearAdminCache() {
  try {
    localStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
}
