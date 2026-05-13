"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isSupabaseEnabled, signInWithPassword } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    setBusy(true);
    setErr(null);
    if (!isSupabaseEnabled) {
      setErr("Supabase غير مظبوط");
      setBusy(false);
      return;
    }
    const { error, session } = await signInWithPassword(email.trim(), password);
    setBusy(false);
    if (error || !session) {
      setErr(error ?? "حصلت مشكلة");
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 max-w-md mx-auto">
      <header className="text-center mb-8">
        <div className="text-5xl mb-2">🌙</div>
        <h1 className="text-2xl font-bold text-masjid-dark">سجلي دخولك</h1>
        <p className="text-sm text-masjid-dark/60 mt-1">أهلاً بيكي تاني</p>
      </header>

      <form onSubmit={submit} className="space-y-3 flex-1 flex flex-col">
        <div>
          <label className="text-xs font-semibold text-masjid-dark/70">الإيميل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-3 focus:border-masjid focus:outline-none mt-1"
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-masjid-dark/70">كلمة السر</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-3 focus:border-masjid focus:outline-none mt-1"
          />
        </div>
        {err && <p className="text-xs text-wrong bg-wrong/10 p-2 rounded">{err}</p>}
        <button
          type="submit"
          disabled={!email.trim() || password.length < 6 || busy}
          className="mt-auto w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg disabled:opacity-50"
        >
          {busy ? "..." : "دخول"}
        </button>
        <p className="text-center text-xs text-masjid-dark/60">
          ملكيش حساب؟{" "}
          <Link href="/signup" className="text-masjid font-bold">
            سجلي حساب جديد
          </Link>
        </p>
      </form>
    </main>
  );
}
