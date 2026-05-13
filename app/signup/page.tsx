"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isSupabaseEnabled, sendOtp, verifyOtp, supabase } from "@/lib/supabase";
import { setParentPassword } from "@/lib/auth/parent-password";

type Step = "info" | "otp" | "password" | "child";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    otp: "",
    parentPassword: "",
    childName: "",
    childAge: 7,
    childGender: "boy",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) return;
    setBusy(true);
    setErr(null);
    if (!isSupabaseEnabled) {
      setErr("Supabase غير مظبوط — راجعي الإعدادات");
      setBusy(false);
      return;
    }
    const { error } = await sendOtp(form.email.trim());
    setBusy(false);
    if (error) {
      setErr(error);
      return;
    }
    setStep("otp");
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.otp.length < 6) return;
    setBusy(true);
    setErr(null);
    const { error, session } = await verifyOtp(form.email.trim(), form.otp);
    if (error || !session) {
      setErr(error ?? "الكود غلط");
      setBusy(false);
      return;
    }
    if (supabase) {
      await supabase.from("mothers").upsert({
        id: session.user.id,
        email: form.email.trim(),
        full_name: form.fullName.trim(),
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
      });
    }
    setBusy(false);
    setStep("password");
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.parentPassword.length < 4) {
      setErr("كلمة السر لازم 4 حروف على الأقل");
      return;
    }
    setBusy(true);
    setErr(null);
    const ok = await setParentPassword(form.parentPassword);
    setBusy(false);
    if (!ok) {
      setErr("حصلت مشكلة في الحفظ");
      return;
    }
    setStep("child");
  };

  const submitChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.childName.trim()) return;
    setBusy(true);
    setErr(null);
    if (!supabase) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    await supabase.from("children").insert({
      mother_id: session.session.user.id,
      name: form.childName.trim(),
      age: form.childAge,
      gender: form.childGender,
    });
    setBusy(false);
    router.replace("/dashboard");
  };

  const stepIdx = ["info", "otp", "password", "child"].indexOf(step);

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 max-w-md mx-auto">
      <header className="text-center mb-6">
        <div className="text-5xl mb-2">🌙</div>
        <h1 className="text-2xl font-bold text-masjid-dark">سجّلي حسابك</h1>
        <p className="text-sm text-masjid-dark/60 mt-1">
          ابدئي رحلة طفلك مع نــور
        </p>
      </header>

      <div className="flex justify-center gap-2 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-2 w-8 rounded-full transition-all ${
              i === stepIdx ? "bg-masjid" : i < stepIdx ? "bg-success/50" : "bg-masjid/20"
            }`}
          />
        ))}
      </div>

      {step === "info" && (
        <form onSubmit={submitInfo} className="space-y-3 flex-1 flex flex-col">
          <Field label="اسمك الكامل" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
          <Field label="الإيميل" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="رقم التليفون (اختياري)" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="المدينة (اختياري)" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          {err && <p className="text-xs text-wrong">{err}</p>}
          <button
            type="submit"
            disabled={!form.fullName.trim() || !form.email.trim() || busy}
            className="mt-auto w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95 disabled:opacity-50"
          >
            {busy ? "..." : "ابعتي كود التحقق"}
          </button>
          <p className="text-center text-xs text-masjid-dark/60">
            عندك حساب؟{" "}
            <Link href="/login" className="text-masjid font-bold">
              سجلي دخول
            </Link>
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitOtp} className="space-y-3 flex-1 flex flex-col">
          <p className="text-sm text-masjid-dark/70 text-center">
            بعتنا كود ٦ أرقام لـ <b>{form.email}</b>
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
            placeholder="000000"
            className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-4 text-center text-3xl tracking-widest focus:border-masjid focus:outline-none"
            autoFocus
          />
          {err && <p className="text-xs text-wrong">{err}</p>}
          <button
            type="submit"
            disabled={form.otp.length < 6 || busy}
            className="mt-auto w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg disabled:opacity-50"
          >
            {busy ? "..." : "تأكيد"}
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} className="space-y-3 flex-1 flex flex-col">
          <div className="bg-gold/10 rounded-2xl p-4">
            <p className="text-sm text-masjid-dark font-bold">🔐 كلمة سر سرية</p>
            <p className="text-xs text-masjid-dark/70 mt-1">
              دي كلمة السر اللي هتدخليها لما الطفل يخلص خطوات التسميع والمهام. متعرفهاش له.
            </p>
          </div>
          <Field
            label="كلمة السر (4 حروف+)"
            type="password"
            value={form.parentPassword}
            onChange={(v) => setForm({ ...form, parentPassword: v })}
          />
          {err && <p className="text-xs text-wrong">{err}</p>}
          <button
            type="submit"
            disabled={form.parentPassword.length < 4 || busy}
            className="mt-auto w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg disabled:opacity-50"
          >
            {busy ? "..." : "حفظ"}
          </button>
        </form>
      )}

      {step === "child" && (
        <form onSubmit={submitChild} className="space-y-3 flex-1 flex flex-col">
          <p className="text-center text-sm text-masjid-dark/70">
            ضيفي أول طفل دلوقتي 🌙
          </p>
          <Field label="اسم الطفل" value={form.childName} onChange={(v) => setForm({ ...form, childName: v })} />
          <div>
            <label className="text-xs font-semibold text-masjid-dark/70">
              العمر: <span className="text-masjid font-bold">{form.childAge} سنين</span>
            </label>
            <input
              type="range"
              min={5}
              max={12}
              value={form.childAge}
              onChange={(e) => setForm({ ...form, childAge: Number(e.target.value) })}
              className="w-full accent-masjid mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-masjid-dark/70">النوع</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { v: "boy", label: "👦 ولد" },
                { v: "girl", label: "👧 بنت" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setForm({ ...form, childGender: o.v })}
                  className={`py-3 rounded-2xl font-bold ${
                    form.childGender === o.v
                      ? "bg-masjid text-sand"
                      : "bg-white border-2 border-masjid/10 text-masjid-dark"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!form.childName.trim() || busy}
            className="mt-auto w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg disabled:opacity-50"
          >
            {busy ? "..." : "ابدئي الرحلة 🌙"}
          </button>
        </form>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-masjid-dark/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-3 focus:border-masjid focus:outline-none mt-1"
      />
    </div>
  );
}
