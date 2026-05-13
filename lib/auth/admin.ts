"use client";

import { supabase, getCurrentSession } from "@/lib/supabase";
import type { Admin } from "@/lib/db/types";

const ADMIN_KEY = "noor.admin.email";

export async function checkIsAdmin(): Promise<Admin | null> {
  if (!supabase) return null;
  const session = await getCurrentSession();
  if (!session) return null;
  const email = session.user.email;
  if (!email) return null;
  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .eq("is_active", true)
    .maybeSingle();
  if (data) {
    try {
      localStorage.setItem(ADMIN_KEY, email);
    } catch {
      /* ignore */
    }
  }
  return data as Admin | null;
}

export function clearAdminCache() {
  try {
    localStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
}
