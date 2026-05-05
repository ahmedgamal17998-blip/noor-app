"use client";

import { storage } from "./storage";
import { STARTER_SURAHS } from "./quran-api";

/**
 * Lightweight SM-2-inspired Spaced Repetition System.
 * For each (childId, surahNumber, ayahNumber) we track:
 *  - lastReviewedAt
 *  - intervalDays (next gap)
 *  - ease (0..1, weighted average of accuracy)
 *
 * Cards become "due" when (now - lastReviewedAt) >= intervalDays.
 * On a successful review, interval grows; on a wrong one, it resets to 1 day.
 *
 * Source of truth = sessions in storage. We compute SRS state on-demand
 * so we don't need a parallel persistence layer.
 */

export type ReviewCard = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  lastReviewedAt: number | null;
  intervalDays: number;
  ease: number;
  isDue: boolean;
  daysOverdue: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function nextInterval(prevDays: number, success: boolean): number {
  if (!success) return 1;
  if (prevDays <= 0) return 1;
  if (prevDays === 1) return 3;
  if (prevDays === 3) return 7;
  if (prevDays === 7) return 14;
  if (prevDays === 14) return 30;
  return Math.min(60, Math.round(prevDays * 1.8));
}

export function getReviewCards(childId: string): ReviewCard[] {
  const sessions = storage.getSessions(childId);
  if (sessions.length === 0) return [];

  // Group by (surah, ayah)
  type Group = {
    surahNumber: number;
    ayahNumber: number;
    sorted: typeof sessions;
  };
  const map = new Map<string, Group>();
  for (const s of sessions) {
    const key = `${s.surahNumber}-${s.ayahNumber}`;
    if (!map.has(key)) {
      map.set(key, {
        surahNumber: s.surahNumber,
        ayahNumber: s.ayahNumber,
        sorted: [],
      });
    }
    map.get(key)!.sorted.push(s);
  }

  const now = Date.now();
  const out: ReviewCard[] = [];

  const groups = Array.from(map.values());
  for (const g of groups) {
    g.sorted.sort((a, b) => a.createdAt - b.createdAt);

    let interval = 0;
    let ease = 0;
    let lastReviewedAt: number | null = null;

    for (const s of g.sorted) {
      ease = ease * 0.6 + (s.isCorrect ? 1 : 0) * 0.4;
      interval = nextInterval(interval, s.isCorrect);
      lastReviewedAt = s.createdAt;
    }

    const surah = STARTER_SURAHS.find((x) => x.number === g.surahNumber);
    if (!surah) continue;

    const elapsedDays = lastReviewedAt
      ? Math.floor((now - lastReviewedAt) / DAY_MS)
      : Infinity;
    const isDue = elapsedDays >= interval;
    const daysOverdue = Math.max(0, elapsedDays - interval);

    out.push({
      surahNumber: g.surahNumber,
      surahName: surah.name,
      ayahNumber: g.ayahNumber,
      lastReviewedAt,
      intervalDays: interval,
      ease,
      isDue,
      daysOverdue,
    });
  }

  // Due first, then by days overdue (most overdue first)
  out.sort((a, b) => {
    if (a.isDue !== b.isDue) return a.isDue ? -1 : 1;
    return b.daysOverdue - a.daysOverdue;
  });

  return out;
}

export function getDueCount(childId: string): number {
  return getReviewCards(childId).filter((c) => c.isDue).length;
}
