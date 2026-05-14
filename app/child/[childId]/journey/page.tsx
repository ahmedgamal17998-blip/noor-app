"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getActiveSurahs,
  getAllChildProgress,
  getSurahSteps,
  getStepCompletions,
} from "@/lib/db/queries";
import type {
  Surah,
  ChildSurahProgress,
  Child,
  SurahStep,
  StepCompletion,
} from "@/lib/db/types";

type SurahWithProgress = Surah & {
  progress: ChildSurahProgress | null;
  isUnlocked: boolean;
  stepsTotal: number;
  stepsCompleted: number;
};

export default function ChildJourneyPage() {
  const router = useRouter();
  const params = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [items, setItems] = useState<SurahWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, [params.childId]);

  const load = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data: c } = await supabase
      .from("children")
      .select("*")
      .eq("id", params.childId)
      .maybeSingle();
    if (!c) {
      router.replace("/dashboard");
      return;
    }
    setChild(c as Child);

    const [surahs, progress] = await Promise.all([
      getActiveSurahs(),
      getAllChildProgress(params.childId),
    ]);

    const progressMap = new Map(progress.map((p) => [p.surah_id, p]));

    // Per surah, count steps + completed steps for accurate progress
    const merged: SurahWithProgress[] = await Promise.all(
      surahs.map(async (s, idx) => {
        const p = progressMap.get(s.id) ?? null;
        const steps: SurahStep[] = await getSurahSteps(s.id);
        const completions: StepCompletion[] = await getStepCompletions(
          params.childId,
          s.id,
        );
        const completedIds = new Set(
          completions.filter((c) => c.approved_by_mother).map((c) => c.step_id),
        );
        const stepsCompleted = steps.filter((st) => completedIds.has(st.id)).length;
        return {
          ...s,
          progress: p,
          stepsTotal: steps.length,
          stepsCompleted,
          isUnlocked: idx === 0, // we'll fill below
        };
      }),
    );

    // Unlock logic: first surah always open; next opens when previous is complete
    let prevCompleted = true;
    for (const m of merged) {
      m.isUnlocked = prevCompleted;
      prevCompleted = m.progress?.is_completed ?? false;
    }

    setItems(merged);
    setLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sand">
        <div className="text-masjid font-bold animate-pulse">جاري التحميل...</div>
      </main>
    );
  }

  if (!child) return null;

  const completedSurahs = items.filter((s) => s.progress?.is_completed).length;

  return (
    <main className="min-h-screen px-5 py-5 max-w-md mx-auto bg-gradient-to-b from-sand to-sand-dark/30">
      <header className="flex items-center justify-between mb-5">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-masjid-dark">رحلة {child.name}</h1>
          <p className="text-xs text-gold-dark font-bold">⭐ {child.total_xp} XP</p>
        </div>
        <Link
          href={`/child/${child.id}/avatar`}
          className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center"
        >
          🎨
        </Link>
      </header>

      {/* Progress banner */}
      {items.length > 0 && (
        <div className="bg-gradient-to-br from-masjid to-masjid-dark text-sand rounded-3xl p-4 mb-5 shadow-soft-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs opacity-80">تقدمك في الرحلة</p>
            <p className="text-2xl font-bold">
              {completedSurahs}/{items.length}
            </p>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all"
              style={{
                width: `${(completedSurahs / items.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-soft">
          <p className="text-5xl mb-3">📖</p>
          <p className="font-bold text-masjid-dark">المنصة لسه فاضية</p>
          <p className="text-sm text-masjid-dark/60 mt-2">
            الـ admin محتاج يضيف سور ومحتوى
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s, i) => (
            <LevelCard
              key={s.id}
              item={s}
              index={i}
              childId={child.id}
              isLastUnlocked={
                s.isUnlocked &&
                (i === items.length - 1 || !items[i + 1].isUnlocked)
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}

function LevelCard({
  item,
  index,
  childId,
  isLastUnlocked,
}: {
  item: SurahWithProgress;
  index: number;
  childId: string;
  isLastUnlocked: boolean;
}) {
  const completed = item.progress?.is_completed ?? false;
  const stepsTotal = item.stepsTotal;
  const stepsDone = item.stepsCompleted;
  const inProgress = !completed && stepsDone > 0;
  const fresh = item.isUnlocked && !completed && stepsDone === 0;

  // Visual styles per state
  const bgStyle = !item.isUnlocked
    ? "bg-sand-dark/40 border-masjid-dark/10 opacity-60"
    : completed
      ? "bg-gradient-to-br from-gold/30 to-gold/5 border-gold/40 shadow-soft-lg"
      : inProgress
        ? "bg-gradient-to-br from-masjid/15 to-sand border-masjid/40 shadow-soft-lg"
        : "bg-white border-masjid/15 shadow-soft";

  const badgeStyle = !item.isUnlocked
    ? "bg-sand-dark text-masjid-dark/40"
    : completed
      ? "bg-gradient-to-br from-gold to-gold-dark text-white shadow-soft"
      : inProgress
        ? "bg-masjid text-sand"
        : "bg-gradient-to-br from-kid-yellow to-gold/60 text-masjid-dark";

  const ring =
    fresh && isLastUnlocked
      ? "ring-4 ring-gold/50 ring-offset-2 ring-offset-sand animate-pulse-slow"
      : "";

  const inner = (
    <div className={`rounded-3xl p-4 border-2 transition-all ${bgStyle} ${ring}`}>
      <div className="flex items-center gap-3">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${badgeStyle} shrink-0`}
        >
          {!item.isUnlocked ? "🔒" : completed ? "🏆" : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-quran text-2xl text-masjid-dark leading-tight">
            {item.name_arabic}
          </p>
          <p className="text-xs text-masjid-dark/60">
            {item.total_ayahs} آية
          </p>
          {/* Step progress */}
          {item.isUnlocked && stepsTotal > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: stepsTotal }).map((_, j) => (
                  <span
                    key={j}
                    className={`h-1.5 flex-1 rounded-full ${
                      j < stepsDone
                        ? completed
                          ? "bg-gold"
                          : "bg-masjid"
                        : "bg-sand-dark/40"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-masjid-dark/60 mt-1">
                {completed
                  ? "اكتمل ✨"
                  : `${stepsDone}/${stepsTotal} خطوات`}
              </p>
            </div>
          )}
        </div>
        {item.isUnlocked && (
          <span className="text-2xl shrink-0">
            {completed ? "✨" : fresh ? "✨" : "▶️"}
          </span>
        )}
      </div>
    </div>
  );

  if (!item.isUnlocked) {
    return (
      <div className="relative">
        {inner}
        <div className="absolute top-2 left-2 bg-masjid-dark/80 text-sand text-[10px] px-2 py-0.5 rounded-full font-bold">
          اقفل اللي قبلها الأول 🔒
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/child/${childId}/surah/${item.surah_number}`}
      className="block active:scale-[0.98] transition-transform"
    >
      {inner}
    </Link>
  );
}
