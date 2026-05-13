import { createClient, type Session } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: "noor.auth",
        },
      })
    : null;

export const isSupabaseEnabled = Boolean(url && key);

// ════════════════════════════════════════════════════════════════
// Email + Password Auth (primary)
// ════════════════════════════════════════════════════════════════

export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<{ error: string | null; session: Session | null }> {
  if (!supabase) return { error: "Supabase غير مفعّل", session: null };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    return { error: error.message, session: null };
  }
  // If email confirmation is enabled in Supabase project, signing up
  // returns session=null. We try to immediately sign in.
  if (!data.session) {
    const signIn = await supabase.auth.signInWithPassword({ email, password });
    return { error: signIn.error?.message ?? null, session: signIn.data.session };
  }
  return { error: null, session: data.session };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ error: string | null; session: Session | null }> {
  if (!supabase) return { error: "Supabase غير مفعّل", session: null };
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error: error?.message ?? null, session: data.session };
}

// ════════════════════════════════════════════════════════════════
// Legacy OTP (kept for backward compat — not used by UI anymore)
// ════════════════════════════════════════════════════════════════

export async function sendOtp(email: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase غير مفعّل" };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  return { error: error?.message ?? null };
}

export async function verifyOtp(
  email: string,
  token: string,
): Promise<{ error: string | null; session: Session | null }> {
  if (!supabase) return { error: "Supabase غير مفعّل", session: null };
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  return { error: error?.message ?? null, session: data.session };
}

// ════════════════════════════════════════════════════════════════
// Session helpers
// ════════════════════════════════════════════════════════════════

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function onAuthChange(cb: (session: Session | null) => void) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
