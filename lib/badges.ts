"use client";

import { storage } from "./storage";
import { STARTER_SURAHS } from "./quran-api";

export type Badge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  check: (childId: string) => boolean;
};

export const BADGES: Badge[] = [
  {
    id: "first_session",
    name: "أول جلسة",
    description: "أول مرة تسجّل آية",
    emoji: "🎤",
    check: (childId) =>
      storage.getSessions(childId).filter((s) => s.isCorrect).length >= 1,
  },
  {
    id: "five_ayahs",
    name: "خمس آيات",
    description: "حفظ ٥ آيات صحيحة",
    emoji: "📖",
    check: (childId) =>
      storage.getSessions(childId).filter((s) => s.isCorrect).length >= 5,
  },
  {
    id: "ten_ayahs",
    name: "عشر آيات",
    description: "حفظ ١٠ آيات صحيحة",
    emoji: "📚",
    check: (childId) =>
      storage.getSessions(childId).filter((s) => s.isCorrect).length >= 10,
  },
  {
    id: "first_surah",
    name: "صائد السور",
    description: "حفظ سورة كاملة",
    emoji: "🏆",
    check: (childId) => completedSurahsCount(childId) >= 1,
  },
  {
    id: "three_surahs",
    name: "حافظ متوسّع",
    description: "حفظ ٣ سور كاملة",
    emoji: "🌟",
    check: (childId) => completedSurahsCount(childId) >= 3,
  },
  {
    id: "five_in_day",
    name: "يوم نشيط",
    description: "٥ آيات صح في يوم واحد",
    emoji: "⚡",
    check: (childId) => maxAyahsInOneDay(childId) >= 5,
  },
  {
    id: "task_streak_3",
    name: "متواصل",
    description: "تنفيذ مهمة ٣ أيام متتالية",
    emoji: "🔥",
    check: (childId) => taskStreak(childId) >= 3,
  },
  {
    id: "perfect_ayah",
    name: "إتقان",
    description: "آية بدقة ١٠٠٪",
    emoji: "💎",
    check: (childId) =>
      storage.getSessions(childId).some((s) => s.accuracy >= 1),
  },
];

function completedSurahsCount(childId: string): number {
  const sessions = storage.getSessions(childId).filter((s) => s.isCorrect);
  const surahsAyahs: Record<number, Set<number>> = {};
  sessions.forEach((s) => {
    surahsAyahs[s.surahNumber] = surahsAyahs[s.surahNumber] ?? new Set();
    surahsAyahs[s.surahNumber].add(s.ayahNumber);
  });

  return STARTER_SURAHS.filter(
    (s) => (surahsAyahs[s.number]?.size ?? 0) >= s.numberOfAyahs,
  ).length;
}

function maxAyahsInOneDay(childId: string): number {
  const byDay: Record<string, number> = {};
  storage
    .getSessions(childId)
    .filter((s) => s.isCorrect)
    .forEach((s) => {
      const day = new Date(s.createdAt).toISOString().slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + 1;
    });
  return Math.max(0, ...Object.values(byDay));
}

function taskStreak(childId: string): number {
  // Read tasks via a shared key — duplicate of storage logic for simplicity
  const raw =
    typeof window !== "undefined" ? localStorage.getItem("noor.tasks") : null;
  if (!raw) return 0;
  let tasks: Array<{ childId: string; date: string; isConfirmed: boolean }>;
  try {
    tasks = JSON.parse(raw);
  } catch {
    return 0;
  }
  const dates = tasks
    .filter((t) => t.childId === childId && t.isConfirmed)
    .map((t) => t.date)
    .sort()
    .reverse();
  if (dates.length === 0) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export function getEarnedBadges(childId: string): Badge[] {
  return BADGES.filter((b) => b.check(childId));
}

export function getNewBadges(
  childId: string,
  before: Set<string>,
): Badge[] {
  return getEarnedBadges(childId).filter((b) => !before.has(b.id));
}
