"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getTodayDhikr, getTodayTaskSuggestion, type Dhikr } from "@/lib/azkar";
import { getTodayVerse, type DailyVerse } from "@/lib/daily-verse";
import { feedbackTap, feedbackSuccess } from "@/lib/feedback";

export default function TodayPage() {
  const [dhikr, setDhikr] = useState<Dhikr | null>(null);
  const [task, setTask] = useState<string>("");
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [count, setCount] = useState(0);
  const [verseLoading, setVerseLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setDhikr(getTodayDhikr());
    setTask(getTodayTaskSuggestion());
    setVerse(getTodayVerse());
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (!dhikr) return null;

  const dateAr = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const target = dhikr.count;
  const reachedTarget = count >= target;

  const tap = () => {
    feedbackTap();
    setCount((c) => {
      const next = c + 1;
      if (next === target) feedbackSuccess();
      return next;
    });
  };

  const reset = () => {
    setCount(0);
  };

  const playVerse = () => {
    if (!verse) return;
    if (audioRef.current) audioRef.current.pause();
    setVerseLoading(true);
    const audio = new Audio(verse.audio);
    audioRef.current = audio;
    audio.onended = () => setVerseLoading(false);
    audio.onerror = () => setVerseLoading(false);
    audio.play().catch(() => setVerseLoading(false));
  };

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

      {verse && (
        <section className="bg-white rounded-3xl p-5 shadow-soft border border-masjid/10 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-masjid-dark">📖 آية اليوم</h2>
            <button
              onClick={playVerse}
              disabled={verseLoading}
              className="bg-masjid/10 text-masjid-dark text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform disabled:opacity-60"
            >
              {verseLoading ? "🔊 شغّال..." : "🔊 اسمع"}
            </button>
          </div>
          <p
            dir="rtl"
            className="font-quran text-2xl leading-loose text-center text-masjid-dark"
          >
            {verse.text}
          </p>
          <p className="text-xs text-masjid-dark/60 text-center mt-3">
            سورة {verse.surahName} · آية {verse.ayahNumber}
          </p>
        </section>
      )}

      <section className="bg-gradient-to-br from-gold to-gold-dark text-white rounded-3xl p-6 shadow-soft-lg mb-4 relative overflow-hidden">
        <div className="absolute -top-6 -left-6 text-9xl opacity-10">📿</div>
        <p className="text-xs opacity-80 mb-2 font-semibold relative">
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

        <div className="relative flex flex-col items-center gap-3 mt-2">
          <button
            onClick={tap}
            disabled={reachedTarget}
            className={`w-32 h-32 rounded-full bg-white/20 backdrop-blur border-4 border-white/40 flex flex-col items-center justify-center active:scale-90 transition-transform shadow-lg ${
              reachedTarget ? "opacity-70" : ""
            }`}
            aria-label="اضغطي للعد"
          >
            <span className="text-4xl font-bold leading-none">{count}</span>
            <span className="text-xs opacity-80 mt-1">/ {target}</span>
          </button>

          {reachedTarget ? (
            <button
              onClick={reset}
              className="text-xs font-bold bg-white text-gold-dark px-4 py-2 rounded-full active:scale-95 transition-transform"
            >
              ✓ خلصت — ابدأ من جديد
            </button>
          ) : (
            <p className="text-xs opacity-90">اضغطي على الدائرة لعدّ كل مرة</p>
          )}
        </div>
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
