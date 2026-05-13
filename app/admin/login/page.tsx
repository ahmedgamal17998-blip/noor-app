"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseEnabled, sendOtp, verifyOtp } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/auth/admin";

type Step = "email" | "otp";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await sendOtp(email.trim());
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    setStep("otp");
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length < 6) return;
    setBusy(true);
    setError(null);
    const { error, session } = await verifyOtp(email.trim(), otp.trim());
    if (error || !session) {
      setError(error ?? "كود غير صحيح");
      setBusy(false);
      return;
    }
    const admin = await checkIsAdmin();
    setBusy(false);
    if (!admin) {
      setError("الإيميل ده مش admin");
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
          <p className="text-sm opacity-70 mt-1">تسجيل دخول للإدارة</p>
        </div>

        {!isSupabaseEnabled && (
          <div className="bg-wrong/20 border border-wrong/40 rounded-2xl p-4 text-sm">
            ⚠️ Supabase env vars غير مظبوطة. ضيفي NEXT_PUBLIC_SUPABASE_URL +
            NEXT_PUBLIC_SUPABASE_ANON_KEY في Vercel.
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={submitEmail} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@admin.com"
              className="w-full bg-white text-masjid-dark border-2 border-white/20 rounded-2xl px-4 py-3 focus:outline-none"
              autoFocus
            />
            {error && <p className="text-wrong text-xs">{error}</p>}
            <button
              type="submit"
              disabled={!email.trim() || busy || !isSupabaseEnabled}
              className="w-full bg-gold text-masjid-dark font-bold py-3 rounded-2xl disabled:opacity-50"
            >
              {busy ? "..." : "ابعتي الكود"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitOtp} className="space-y-3">
            <p className="text-sm opacity-70 text-center">
              بعتنا كود لـ {email}
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="w-full bg-white text-masjid-dark border-2 border-white/20 rounded-2xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none"
              autoFocus
            />
            {error && <p className="text-wrong text-xs">{error}</p>}
            <button
              type="submit"
              disabled={otp.trim().length < 6 || busy}
              className="w-full bg-gold text-masjid-dark font-bold py-3 rounded-2xl disabled:opacity-50"
            >
              {busy ? "..." : "تأكيد"}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-xs opacity-70 hover:opacity-100"
            >
              تغيير الإيميل
            </button>
          </form>
        )}

        <p className="text-xs opacity-50 text-center mt-8">
          الـ admin يضاف يدوياً عن طريق Supabase SQL Editor:
          <br />
          <code className="block mt-1 bg-black/20 p-2 rounded text-[10px]">
            insert into admins (email, full_name) values (&apos;you@x.com&apos;,
            &apos;Name&apos;);
          </code>
        </p>
      </div>
    </main>
  );
}
