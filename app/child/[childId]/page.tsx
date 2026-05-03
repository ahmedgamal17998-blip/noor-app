"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { storage, type Child } from "@/lib/storage";
import { STARTER_SURAHS } from "@/lib/quran-api";

export default function ChildSurahPickerPage() {
  const router = useRouter();
  const params = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);

  useEffect(() => {
    const c = storage.getChild(params.childId);
    if (!c) {
      router.replace("/dashboard");
      return;
    }
    setChild(c);
  }, [params.childId, router]);

  if (!child) return null;

  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div className="text-center flex-1">
          <h1 className="font-bold text-masjid-dark">أهلاً {child.name}!</h1>
          <p className="text-xs text-gold-dark font-semibold">
            ⭐ {child.totalXP} XP
          </p>
        </div>
        <div className="w-10" />
      </header>

      <section className="bg-gradient-to-br from-masjid to-masjid-dark text-sand rounded-3xl p-5 mb-6 shadow-soft-lg">
        <p className="text-sm opacity-80">اختار سورة وابدأ التلاوة</p>
        <p className="text-xl font-bold mt-1">يلا نحفظ سورة جديدة 📖</p>
      </section>

      <div className="space-y-2">
        {STARTER_SURAHS.map((surah) => (
          <Link
            key={surah.number}
            href={`/child/${child.id}/surah/${surah.number}`}
            className="flex items-center bg-white rounded-2xl p-4 shadow-soft border border-masjid/5 active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center font-bold text-gold-dark shrink-0">
              {surah.number}
            </div>
            <div className="flex-1 mr-4">
              <h3 className="font-quran text-2xl text-masjid-dark leading-tight">
                {surah.name}
              </h3>
              <p className="text-xs text-masjid-dark/60">
                {surah.numberOfAyahs} آيات
              </p>
            </div>
            <span className="text-2xl text-masjid">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
