"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isSupabaseEnabled, sendOtp, verifyOtp } from "@/lib/supabase";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setErr(null);
    if (!isSupabaseEnabled) {
      setErr("Supabase غير مظبوط");
      setBusy(false);
      return;
    }
    const { error } = await sendOtp(email.trim());
    setBusy(false);
    if (error) {
      setErr(error);
      return;
    }
    setStep("otp");
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setBusy(true);
    setErr(null);
    const { error, session } = await verifyOtp(email.trim(), otp);
    setBusy(false);
    if (error || !session) {
      setErr(error ?? "كود غلط");
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

      {step === "email" ? (
        <form onSubmit={submitEmail} className="space-y-3 flex-1 flex flex-col">
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
          {err && <p className="text-xs text-wrong">{err}</p>}
          <button
            type="submit"
            disabled={!email.trim() || busy}
            className="mt-auto w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg disabled:opacity-50"
          >
            {busy ? "..." : "ابعتي الكود"}
          </button>
          <p className="text-center text-xs text-masjid-dark/60">
            ملكيش حساب؟{" "}
            <Link href="/signup" className="text-masjid font-bold">
              سجلي حساب جديد
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="space-y-3 flex-1 flex flex-col">
          <p className="text-sm text-masjid-dark/70 text-center">
            بعتنا كود ٦ أرقام لـ <b>{email}</b>
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="000000"
            className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-4 text-center text-3xl tracking-widest focus:border-masjid focus:outline-none"
            autoFocus
          />
          {err && <p className="text-xs text-wrong">{err}</p>}
          <button
            type="submit"
            disabled={otp.length < 6 || busy}
            className="mt-auto w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg disabled:opacity-50"
          >
            {busy ? "..." : "تأكيد"}
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-xs text-masjid-dark/60 py-2"
          >
            تغيير الإيميل
          </button>
        </form>
      )}
    </main>
  );
}
