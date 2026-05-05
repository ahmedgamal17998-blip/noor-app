"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { Mascot } from "@/components/Mascot";
import { isSupabaseEnabled, sendOtp, verifyOtp } from "@/lib/supabase";

type Step = "mother" | "otp-email" | "otp-code" | "child";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mother");
  const [motherName, setMotherName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mother = storage.getMother();
    const children = storage.getChildren();
    if (mother && children.length > 0) {
      router.replace("/dashboard");
    } else if (mother) {
      setStep("child");
    }
  }, [router]);

  const submitMother = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motherName.trim()) return;
    if (isSupabaseEnabled) {
      setStep("otp-email");
    } else {
      storage.setMother(motherName.trim());
      setStep("child");
    }
  };

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
    setStep("otp-code");
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
    storage.setMother(motherName.trim(), email.trim());
    setBusy(false);
    setStep("child");
  };

  const skipAuth = () => {
    storage.setMother(motherName.trim(), email.trim() || undefined);
    setStep("child");
  };

  const submitChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;
    storage.addChild(childName.trim(), childAge);
    router.replace("/dashboard");
  };

  const totalSteps = isSupabaseEnabled ? 4 : 2;
  const stepIndex =
    step === "mother"
      ? 0
      : step === "otp-email"
        ? 1
        : step === "otp-code"
          ? 2
          : isSupabaseEnabled
            ? 3
            : 1;

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 max-w-md mx-auto">
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <Dot key={i} active={i === stepIndex} />
        ))}
      </div>

      {step === "mother" && (
        <form onSubmit={submitMother} className="flex-1 flex flex-col gap-6">
          <Mascot mood="happy" message="أهلاً بيكي يا أمنا! إيه اسمك؟" size="lg" />
          <Field
            label="اسمك"
            value={motherName}
            onChange={setMotherName}
            placeholder="مثال: أم أحمد"
          />
          <button
            type="submit"
            disabled={!motherName.trim()}
            className="mt-auto w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            التالي
          </button>
        </form>
      )}

      {step === "otp-email" && (
        <form onSubmit={submitEmail} className="flex-1 flex flex-col gap-6">
          <Mascot
            mood="encouraging"
            message="هنبعتلك كود على الإيميل علشان تقدري تشوفي تقدم طفلك من أي جهاز"
            size="lg"
          />
          <Field
            label="الإيميل"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="example@gmail.com"
          />
          {error && <p className="text-xs text-wrong">{error}</p>}
          <div className="mt-auto space-y-2">
            <button
              type="submit"
              disabled={!email.trim() || busy}
              className="w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              {busy ? "جاري الإرسال..." : "ابعتي الكود"}
            </button>
            <button
              type="button"
              onClick={skipAuth}
              className="w-full text-masjid-dark/60 font-semibold py-2 text-sm"
            >
              تخطّي (احفظي على الجهاز ده فقط)
            </button>
          </div>
        </form>
      )}

      {step === "otp-code" && (
        <form onSubmit={submitOtp} className="flex-1 flex flex-col gap-6">
          <Mascot
            mood="encouraging"
            message={`بعتنا كود من ٦ أرقام على ${email}`}
            size="md"
          />
          <Field
            label="الكود"
            value={otp}
            onChange={setOtp}
            placeholder="000000"
            inputMode="numeric"
            maxLength={6}
          />
          {error && <p className="text-xs text-wrong">{error}</p>}
          <div className="mt-auto space-y-2">
            <button
              type="submit"
              disabled={otp.trim().length < 6 || busy}
              className="w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              {busy ? "جاري التأكيد..." : "تأكيد"}
            </button>
            <button
              type="button"
              onClick={() => setStep("otp-email")}
              className="w-full text-masjid-dark/60 font-semibold py-2 text-sm"
            >
              تغيير الإيميل
            </button>
          </div>
        </form>
      )}

      {step === "child" && (
        <form onSubmit={submitChild} className="flex-1 flex flex-col gap-6">
          <Mascot mood="celebrating" message="هنضيف أول طفل! إيه اسمه؟" size="lg" />
          <Field
            label="اسم الطفل"
            value={childName}
            onChange={setChildName}
            placeholder="مثال: أحمد"
          />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-masjid-dark">
              العمر: <span className="text-masjid">{childAge} سنين</span>
            </label>
            <input
              type="range"
              min={5}
              max={12}
              value={childAge}
              onChange={(e) => setChildAge(Number(e.target.value))}
              className="w-full accent-masjid"
            />
            <div className="flex justify-between text-xs text-masjid-dark/60">
              <span>5</span>
              <span>12</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!childName.trim()}
            className="mt-auto w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            ابدأ الرحلة 🌙
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
  placeholder,
  type = "text",
  inputMode,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "text" | "email";
  maxLength?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-masjid-dark">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-4 text-lg focus:border-masjid focus:outline-none"
        autoFocus
      />
    </div>
  );
}

function Dot({ active }: { active: boolean }) {
  return (
    <span
      className={`h-2 w-8 rounded-full transition-all ${
        active ? "bg-masjid" : "bg-masjid/20"
      }`}
    />
  );
}
