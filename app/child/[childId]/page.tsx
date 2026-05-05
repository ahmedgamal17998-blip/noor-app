"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { storage, type Child, type Session } from "@/lib/storage";
import {
  getAllProgress,
  getLevel,
  getNextLevel,
  levelProgress,
  type SurahProgress,
} from "@/lib/progression";
import { getEarnedBadges } from "@/lib/badges";
import { JourneyMap } from "@/components/JourneyMap";
import { STARTER_SURAHS } from "@/lib/quran-api";

export default function ChildJourneyPage() {
  const router = useRouter();
  const params = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [progress, setProgress] = useState<SurahProgress[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [lastSession, setLastSession] = useState<Session | null>(null);

  useEffect(() => {
    const c = storage.getChild(params.childId);
    if (!c) {
      router.replace("/dashboard");
      return;
    }
    setChild(c);
    setProgress(getAllProgress(c.id));
    setBadgeCount(getEarnedBadges(c.id).length);
    setLastSession(storage.getLastSession(c.id));
  }, [params.childId, router]);

  if (!child) return null;

  const level = getLevel(child.totalXP);
  const nextLevel = getNextLevel(child.totalXP);
  const progressPct = levelProgress(child.totalXP);

  return (
    <main className="min-h-screen px-5 py-5 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-4">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-masjid-dark">رحلة {child.name}</h1>
        </div>
        <Link
          href={`/child/${child.id}/badges`}
          className="w-10 h-10 rounded-full bg-gold/20 shadow-soft flex items-center justify-center relative"
        >
          🏅
          {badgeCount > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gold text-white text-xs font-bold flex items-center justify-center">
              {badgeCount}
            </span>
          )}
        </Link>
      </header>

      <section className="bg-gradient-to-br from-masjid to-masjid-dark text-sand rounded-3xl p-5 mb-5 shadow-soft-lg relative overflow-hidden">
        <div className="absolute -top-4 -left-4 text-7xl opacity-10">
          {level.emoji}
        </div>
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs opacity-80">المستوى الحالي</p>
              <h2 className="text-xl font-bold">
                {level.emoji} {level.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">الـ XP</p>
              <p className="text-2xl font-bold">⭐ {child.totalXP}</p>
            </div>
          </div>
          {nextLevel && (
            <>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gold transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs opacity-80 mt-1">
                {nextLevel.minXP - child.totalXP} XP لـ {nextLevel.name}
              </p>
            </>
          )}
        </div>
      </section>

      {lastSession && (() => {
        const surah = STARTER_SURAHS.find(
          (s) => s.number === lastSession.surahNumber,
        );
        if (!surah) return null;
        return (
          <Link
            href={`/child/${child.id}/surah/${lastSession.surahNumber}`}
            className="block bg-gradient-to-l from-gold to-gold-dark text-white rounded-3xl p-4 mb-5 shadow-soft active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">▶️</div>
              <div className="flex-1">
                <p className="text-xs opacity-80">كملي من آخر جلسة</p>
                <p className="font-bold font-quran text-xl">{surah.name}</p>
                <p className="text-xs opacity-90">
                  آخر آية: {lastSession.ayahNumber}
                </p>
              </div>
            </div>
          </Link>
        );
      })()}

      <h2 className="font-bold text-masjid-dark mb-3 px-1">
        🗺️ خريطة الرحلة
      </h2>

      <JourneyMap childId={child.id} progress={progress} />
    </main>
  );
}
