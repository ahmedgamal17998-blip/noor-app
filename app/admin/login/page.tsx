"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseEnabled, signInWithPassword, signUpWithPassword } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/auth/admin";

type Mode = "login" | "signup";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    setBusy(true);
    setError(null);

    const action = mode === "signup" ? signUpWithPassword : signInWithPassword;
    const { error, session } = await action(email.trim(), password);

    if (error || !session) {
      setError(error ?? "حصلت مشكلة");
      setBusy(false);
      return;
    }

    const admin = await checkIsAdmin();
    setBusy(false);
    if (!admin) {
      setError(
        "الإيميل ده مش admin. أضيفيه في جدول admins في Supabase:\ninsert into admins (email, full_name, role) values ('" +
          email.trim() +
          "', 'Name', 'super_admin');",
      );
      return;
    }
    router.replace("/admin");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-masjid-dark text-sand p-6">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-2">🌙</div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm opacity-70 mt-1">
            {mode === "login" ? "تسجيل دخول" : "إنشاء حساب admin جديد"}
          </p>
        </div>

        {!isSupabaseEnabled && (
          <div className="bg-wrong/20 border border-wrong/40 rounded-2xl p-4 text-sm">
            ⚠️ Supabase env vars غير مظبوطة.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs opacity-70">الإيميل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@admin.com"
              className="w-full bg-white text-masjid-dark border-2 border-white/20 rounded-2xl px-4 py-3 focus:outline-none mt-1"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs opacity-70">كلمة السر (٦ حروف على الأقل)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white text-masjid-dark border-2 border-white/20 rounded-2xl px-4 py-3 focus:outline-none mt-1"
            />
          </div>
          {error && (
            <pre className="text-wrong text-xs whitespace-pre-wrap bg-wrong/10 p-2 rounded-lg">
              {error}
            </pre>
          )}
          <button
            type="submit"
            disabled={!email.trim() || password.length < 6 || busy || !isSupabaseEnabled}
            className="w-full bg-gold text-masjid-dark font-bold py-3 rounded-2xl disabled:opacity-50"
          >
            {busy ? "..." : mode === "login" ? "دخول" : "إنشاء حساب"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="w-full text-xs opacity-70 hover:opacity-100 py-2"
          >
            {mode === "login"
              ? "ملكيش حساب admin؟ سجلي حساب جديد"
              : "عندك حساب؟ سجلي دخول"}
          </button>
        </form>

        <div className="text-xs opacity-50 text-center mt-8 space-y-2">
          <p>قبل ما تسجلي دخول، لازم تضيفي الإيميل بتاعك في جدول admins:</p>
          <code className="block bg-black/20 p-2 rounded text-[10px] whitespace-pre-wrap">
            insert into admins (email, full_name, role){"\n"}
            values (&apos;you@x.com&apos;, &apos;Name&apos;, &apos;super_admin&apos;);
          </code>
        </div>
      </div>
    </main>
  );
}
