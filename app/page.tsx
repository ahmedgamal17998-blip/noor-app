"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentSession } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void getCurrentSession().then((session) => {
      if (session) {
        router.replace("/dashboard");
      } else {
        setChecked(true);
      }
    });
  }, [router]);

  if (!checked) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-masjid font-bold text-xl">نــور</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-10 max-w-md mx-auto">
      <header className="w-full flex justify-center pt-6">
        <div className="text-gold text-sm font-semibold tracking-widest">﷽</div>
      </header>

      <section className="flex flex-col items-center gap-6 text-center flex-1 justify-center">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-masjid/20 rounded-full" />
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-masjid to-masjid-dark flex items-center justify-center shadow-soft-lg">
            <span className="font-quran text-6xl text-sand leading-none pt-2">ن</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-extrabold text-masjid-dark">نــور</h1>
          <p className="text-lg text-masjid font-semibold">
            تطبيق تشكيل شخصية الطفل المسلم
          </p>
          <p className="text-sm text-masjid-dark/70 max-w-xs leading-relaxed">
            رحلة تفاعلية من القرآن للحياة — استماع، قصة، فهم، تطبيق
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center pt-2">
          <Badge color="bg-kid-yellow/20 text-amber-700">📖 ٦ خطوات</Badge>
          <Badge color="bg-kid-pink/20 text-pink-700">🎯 مهام عملية</Badge>
          <Badge color="bg-kid-sky/20 text-blue-700">🎨 أفاتار</Badge>
          <Badge color="bg-kid-mint/20 text-emerald-700">👩 متابعة ماما</Badge>
        </div>
      </section>

      <div className="w-full flex flex-col gap-3 pb-6">
        <Link
          href="/signup"
          className="w-full bg-masjid text-sand font-bold py-4 rounded-3xl text-center shadow-soft-lg active:scale-95 transition-transform"
        >
          ابدئي رحلتك الآن
        </Link>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="flex-1 bg-white border-2 border-masjid/20 text-masjid-dark font-bold py-3 rounded-3xl text-center active:scale-95"
          >
            عندي حساب
          </Link>
          <Link
            href="/pricing"
            className="flex-1 bg-white border-2 border-gold/30 text-gold-dark font-bold py-3 rounded-3xl text-center active:scale-95"
          >
            الأسعار
          </Link>
        </div>
        <p className="text-xs text-center text-masjid-dark/50 pt-2">
          صُنع بحب لأمهات وأطفال الأمة الإسلامية
        </p>
      </div>
    </main>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${color}`}>
      {children}
    </span>
  );
}
