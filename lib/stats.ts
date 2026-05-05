import { storage, type Session } from "./storage";

export type ChildStats = {
  streak: number;
  ayahsThisWeek: number;
  minutesThisWeek: number;
  totalCorrect: number;
};

const SECONDS_PER_AYAH_AVG = 25;

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function computeStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => dayKey(s.createdAt)));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getChildStats(childId: string): ChildStats {
  const sessions = storage.getSessions(childId);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = sessions.filter((s) => s.createdAt >= weekAgo);
  const ayahsThisWeek = thisWeek.filter((s) => s.isCorrect).length;
  const minutesThisWeek = Math.round(
    (thisWeek.length * SECONDS_PER_AYAH_AVG) / 60,
  );

  return {
    streak: computeStreak(sessions),
    ayahsThisWeek,
    minutesThisWeek,
    totalCorrect: sessions.filter((s) => s.isCorrect).length,
  };
}
