"use client";

import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

const ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function setParentPassword(plain: string): Promise<boolean> {
  if (!supabase) return false;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return false;
  const hash = await hashPassword(plain);
  const { error } = await supabase
    .from("mothers")
    .update({ parent_password: hash })
    .eq("id", session.session.user.id);
  return !error;
}

export async function verifyParentPassword(plain: string): Promise<boolean> {
  if (!supabase) return false;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return false;
  const { data } = await supabase
    .from("mothers")
    .select("parent_password")
    .eq("id", session.session.user.id)
    .maybeSingle();
  if (!data?.parent_password) return false;
  return bcrypt.compare(plain, data.parent_password);
}

export async function hasParentPassword(): Promise<boolean> {
  if (!supabase) return false;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return false;
  const { data } = await supabase
    .from("mothers")
    .select("parent_password")
    .eq("id", session.session.user.id)
    .maybeSingle();
  return Boolean(data?.parent_password);
}
