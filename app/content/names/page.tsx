"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ASMA_NAMES, getTodayName, type AsmaName } from "@/lib/asmaul-husna";

export default function AsmaulHusnaPage() {
  const [today, setToday] = useState<AsmaName | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setToday(getTodayName());
  }, []);

  const filtered = search.trim()
    ? ASMA_NAMES.filter(
        (n) => n.arabic.includes(search) || n.meaning.includes(search),
      )
    : ASMA_NAMES;

  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-5">
        <Link
          href="/content"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div>
          <h1 className="font-bold text-masjid-dark">✨ أسماء الله الحسنى</h1>
          <p className="text-xs text-masjid-dark/60">٩٩ اسم</p>
        </div>
      </header>

      {today && (
        <section className="bg-gradient-to-br from-gold to-gold-dark text-white rounded-3xl p-6 shadow-soft-lg mb-5 relative overflow-hidden">
          <div className="absolute -top-4 -left-4 text-8xl opacity-10">✨</div>
          <p className="text-xs opacity-80 mb-2 font-semibold relative">
            اسم اليوم · {today.index} من ٩٩
          </p>
          <p className="font-quran text-4xl text-center my-3 relative">
            {today.arabic}
          </p>
          <p className="text-center text-sm relative leading-relaxed">
            {today.meaning}
          </p>
        </section>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 ابحث عن اسم"
        className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-3 mb-4 focus:border-masjid focus:outline-none"
      />

      <section className="space-y-2">
        {filtered.map((n) => (
          <div
            key={n.index}
            className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-soft border border-masjid/5"
          >
            <div className="w-10 h-10 rounded-full bg-masjid/10 text-masjid-dark text-xs font-bold flex items-center justify-center shrink-0">
              {n.index}
            </div>
            <div className="flex-1">
              <p className="font-quran text-2xl text-masjid-dark leading-tight">
                {n.arabic}
              </p>
              <p className="text-xs text-masjid-dark/70 mt-0.5">{n.meaning}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-masjid-dark/50 py-8">
            مفيش نتائج لـ &ldquo;{search}&rdquo;
          </p>
        )}
      </section>
    </main>
  );
}
