import { storage } from "./storage";
import { STARTER_SURAHS } from "./quran-api";

export type Level = {
  number: number;
  name: string;
  emoji: string;
  minXP: number;
};

export const LEVELS: Level[] = [
  { number: 1, name: "حافظ مبتدئ", emoji: "🌱", minXP: 0 },
  { number: 2, name: "حافظ ناشئ", emoji: "🌿", minXP: 50 },
  { number: 3, name: "حافظ نشيط", emoji: "⭐", minXP: 150 },
  { number: 4, name: "حافظ متقدم", emoji: "🌟", minXP: 300 },
  { number: 5, name: "حافظ ماهر", emoji: "✨", minXP: 500 },
  { number: 6, name: "حافظ القرآن", emoji: "🌙", minXP: 1000 },
];

export function getLevel(xp: number): Level {
  return [...LEVELS].reverse().find((l) => xp >= l.minXP) ?? LEVELS[0];
}

export function getNextLevel(xp: number): Level | null {
  const current = getLevel(xp);
  return LEVELS.find((l) => l.number === current.number + 1) ?? null;
}

export function levelProgress(xp: number): number {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const span = next.minXP - current.minXP;
  return Math.min(100, Math.round(((xp - current.minXP) / span) * 100));
}

export type SurahProgress = {
  surahNumber: number;
  attempted: number;
  correct: number;
  totalAyahs: number;
  stars: 0 | 1 | 2 | 3;
  isComplete: boolean;
  isUnlocked: boolean;
};

export function getSurahProgress(
  childId: string,
  surahNumber: number,
): SurahProgress {
  const surah = STARTER_SURAHS.find((s) => s.number === surahNumber);
  const totalAyahs = surah?.numberOfAyahs ?? 1;

  const sessions = storage.getSessions(childId).filter(
    (s) => s.surahNumber === surahNumber,
  );

  const ayahsCorrect = new Set(
    sessions.filter((s) => s.isCorrect).map((s) => s.ayahNumber),
  );
  const correct = ayahsCorrect.size;
  const attempted = new Set(sessions.map((s) => s.ayahNumber)).size;
  const completionPct = correct / totalAyahs;

  let stars: 0 | 1 | 2 | 3 = 0;
  if (completionPct >= 1) stars = 3;
  else if (completionPct >= 0.66) stars = 2;
  else if (completionPct >= 0.33) stars = 1;

  return {
    surahNumber,
    attempted,
    correct,
    totalAyahs,
    stars,
    isComplete: correct === totalAyahs,
    isUnlocked: isUnlocked(childId, surahNumber),
  };
}

function isUnlocked(childId: string, surahNumber: number): boolean {
  const idx = STARTER_SURAHS.findIndex((s) => s.number === surahNumber);
  if (idx <= 0) return true;
  const prev = STARTER_SURAHS[idx - 1];
  const prevSessions = storage
    .getSessions(childId)
    .filter((s) => s.surahNumber === prev.number && s.isCorrect);
  const prevAyahs = new Set(prevSessions.map((s) => s.ayahNumber)).size;
  return prevAyahs >= Math.ceil(prev.numberOfAyahs * 0.5);
}

export function getAllProgress(childId: string): SurahProgress[] {
  return STARTER_SURAHS.map((s) => getSurahProgress(childId, s.number));
}
