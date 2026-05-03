"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { Mascot } from "@/components/Mascot";

type Step = "mother" | "child";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mother");
  const [motherName, setMotherName] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState(7);

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
    storage.setMother(motherName.trim());
    setStep("child");
  };

  const submitChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;
    storage.addChild(childName.trim(), childAge);
    router.replace("/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col px-6 py-8 max-w-md mx-auto">
      <div className="flex justify-center gap-2 mb-8">
        <Dot active={step === "mother"} />
        <Dot active={step === "child"} />
      </div>

      {step === "mother" ? (
        <form onSubmit={submitMother} className="flex-1 flex flex-col gap-6">
          <Mascot
            mood="happy"
            message="أهلاً بيكي يا أمنا! إيه اسمك؟"
            size="lg"
          />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-masjid-dark">
              اسمك
            </label>
            <input
              type="text"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              placeholder="مثال: أم أحمد"
              className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-4 text-lg focus:border-masjid focus:outline-none"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!motherName.trim()}
            className="mt-auto w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            التالي
          </button>
        </form>
      ) : (
        <form onSubmit={submitChild} className="flex-1 flex flex-col gap-6">
          <Mascot
            mood="celebrating"
            message="هنضيف أول طفل! إيه اسمه؟"
            size="lg"
          />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-masjid-dark">
              اسم الطفل
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="مثال: أحمد"
              className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-4 text-lg focus:border-masjid focus:outline-none"
              autoFocus
            />
          </div>
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

function Dot({ active }: { active: boolean }) {
  return (
    <span
      className={`h-2 w-8 rounded-full transition-all ${
        active ? "bg-masjid" : "bg-masjid/20"
      }`}
    />
  );
}
