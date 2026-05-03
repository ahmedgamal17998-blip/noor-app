"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTodayDhikr, getTodayTaskSuggestion, type Dhikr } from "@/lib/azkar";

export default function TodayPage() {
  const [dhikr, setDhikr] = useState<Dhikr | null>(null);
  const [task, setTask] = useState<string>("");

  useEffect(() => {
    setDhikr(getTodayDhikr());
    setTask(getTodayTaskSuggestion());
  }, []);

  if (!dhikr) return null;

  const dateAr = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-masjid-dark">📿 درس اليوم</h1>
          <p className="text-xs text-masjid-dark/60">{dateAr}</p>
        </div>
        <div className="w-10" />
      </header>

      <section className="bg-gradient-to-br from-gold to-gold-dark text-white rounded-3xl p-6 shadow-soft-lg mb-4 relative overflow-hidden">
        <div className="absolute -top-6 -left-6 text-9xl opacity-10">📿</div>
        <p className="text-xs opacity-80 mb-2 font-semibold">
          {dhikr.category === "morning"
            ? "ذكر الصباح"
            : dhikr.category === "evening"
              ? "ذكر المساء"
              : "ذكر اليوم"}
        </p>
        <p
          dir="rtl"
          className="font-quran text-2xl leading-relaxed text-center my-4 relative"
        >
          {dhikr.text}
        </p>
        <p className="text-center text-sm font-bold relative">
          ({dhikr.count}{" "}
          {dhikr.count === 1 ? "مرة" : dhikr.count === 2 ? "مرتين" : "مرات"})
        </p>
      </section>

      <section className="bg-white rounded-3xl p-6 shadow-soft border border-masjid/10 mb-4">
        <h2 className="font-bold text-masjid-dark mb-3">🎯 مهمة اليوم</h2>
        <p className="text-masjid-dark leading-relaxed text-lg">{task}</p>
      </section>

      <section className="bg-sand-dark/40 rounded-3xl p-5 text-center">
        <p className="text-sm text-masjid-dark leading-relaxed">
          اقرأي الذكر مع طفلك، وساعديه ينفّذ المهمة، ولا تنسي تأكيد إنه نفّذها من
          داشبوردك 🌙
        </p>
      </section>
    </main>
  );
}
