"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  storage,
  type Child,
  type Session,
  type DailyTask,
} from "@/lib/storage";
import { getTodayTaskSuggestion } from "@/lib/azkar";
import { STARTER_SURAHS } from "@/lib/quran-api";

export default function MomChildDetailPage() {
  const router = useRouter();
  const params = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [task, setTask] = useState<DailyTask | null>(null);

  const refresh = () => {
    const c = storage.getChild(params.childId);
    if (!c) {
      router.replace("/dashboard");
      return;
    }
    setChild(c);
    setSessions(storage.getSessions(c.id));
    let t = storage.getTodayTask(c.id);
    if (!t) {
      t = storage.setTodayTask(c.id, getTodayTaskSuggestion());
    }
    setTask(t);
  };

  useEffect(() => {
    refresh();
  }, [params.childId]);

  const confirm = () => {
    if (!child) return;
    storage.confirmTodayTask(child.id);
    refresh();
  };

  if (!child || !task) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter(
    (s) => new Date(s.createdAt).toISOString().slice(0, 10) === today,
  );
  const todayCorrect = todaySessions.filter((s) => s.isCorrect).length;

  const mistakeCount: Record<string, number> = {};
  sessions.forEach((s) =>
    s.mistakes.forEach((m) => {
      mistakeCount[m] = (mistakeCount[m] ?? 0) + 1;
    }),
  );
  const topMistakes = Object.entries(mistakeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const surahCount: Record<number, number> = {};
  sessions
    .filter((s) => s.isCorrect)
    .forEach((s) => {
      surahCount[s.surahNumber] = (surahCount[s.surahNumber] ?? 0) + 1;
    });

  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-xl text-masjid-dark">
            {child.name}
          </h1>
          <p className="text-xs text-masjid-dark/60">
            {child.age} سنين · ⭐ {child.totalXP} XP
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatBox icon="📖" label="آيات النهارده" value={todayCorrect} />
        <StatBox
          icon="✅"
          label="إجمالي الجلسات"
          value={sessions.filter((s) => s.isCorrect).length}
        />
      </div>

      <section className="bg-white rounded-3xl p-5 shadow-soft mb-4 border border-gold/20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-masjid-dark">🎯 مهمة اليوم</h2>
          {task.isConfirmed && (
            <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-bold">
              ✓ تمّت
            </span>
          )}
        </div>
        <p className="text-masjid-dark mb-4 leading-relaxed">{task.taskText}</p>
        {!task.isConfirmed ? (
          <button
            onClick={confirm}
            className="w-full bg-masjid text-sand font-bold py-3 rounded-2xl active:scale-95 transition-transform"
          >
            تأكيد إن {child.name} نفّذها
          </button>
        ) : (
          <p className="text-xs text-masjid-dark/60 text-center">
            ما شاء الله، تمّت اليوم 🌟
          </p>
        )}
      </section>

      {topMistakes.length > 0 && (
        <section className="bg-white rounded-3xl p-5 shadow-soft mb-4 border border-wrong/10">
          <h2 className="font-bold text-masjid-dark mb-3">
            🔍 الكلمات اللي بتتلخبط فيها
          </h2>
          <div className="flex flex-wrap gap-2">
            {topMistakes.map(([word, count]) => (
              <span
                key={word}
                className="font-quran text-xl bg-wrong/10 text-wrong px-3 py-1 rounded-2xl"
              >
                {word} <span className="text-xs">×{count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {Object.keys(surahCount).length > 0 && (
        <section className="bg-white rounded-3xl p-5 shadow-soft mb-4">
          <h2 className="font-bold text-masjid-dark mb-3">📚 السور اللي حفظ منها</h2>
          <div className="space-y-2">
            {Object.entries(surahCount).map(([num, count]) => {
              const surah = STARTER_SURAHS.find(
                (s) => s.number === Number(num),
              );
              if (!surah) return null;
              const pct = Math.min(
                100,
                Math.round((count / surah.numberOfAyahs) * 100),
              );
              return (
                <div key={num}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-quran text-lg text-masjid-dark">
                      {surah.name}
                    </span>
                    <span className="text-xs text-masjid-dark/60">
                      {count}/{surah.numberOfAyahs} آيات ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-sand-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-gold to-masjid"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Link
        href={`/child/${child.id}`}
        className="block w-full bg-gradient-to-l from-masjid to-masjid-dark text-sand font-bold py-4 rounded-3xl text-center shadow-soft-lg active:scale-95 transition-transform"
      >
        ابدأ جلسة جديدة لـ{child.name} 🎤
      </Link>
    </main>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-masjid-dark">{value}</div>
      <div className="text-xs text-masjid-dark/60">{label}</div>
    </div>
  );
}
