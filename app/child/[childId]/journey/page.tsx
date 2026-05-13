"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getActiveSurahs, getAllChildProgress } from "@/lib/db/queries";
import type { Surah, ChildSurahProgress, Child } from "@/lib/db/types";

type SurahWithProgress = Surah & {
  progress: ChildSurahProgress | null;
  isUnlocked: boolean;
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
    let prevCompleted = true;
    const merged: SurahWithProgress[] = surahs.map((s) => {
      const p = progressMap.get(s.id) ?? null;
      const isUnlocked = prevCompleted;
      prevCompleted = p?.is_completed ?? false;
      return { ...s, progress: p, isUnlocked };
    });
    setItems(merged);
    setLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-masjid font-bold animate-pulse">جاري التحميل...</div>
      </main>
    );
  }

  if (!child) return null;

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
          <p className="text-xs text-gold-dark font-bold">⭐ {child.total_xp} XP</p>
        </div>
        <Link
          href={`/child/${child.id}/avatar`}
          className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center"
        >
          🎨
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-soft">
          <p className="text-5xl mb-3">📖</p>
          <p className="font-bold text-masjid-dark">المنصة لسه فاضية</p>
          <p className="text-sm text-masjid-dark/60 mt-2">
            الـ admin محتاج يضيف سور ومحتوى من /admin/surahs
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s, i) => (
            <SurahCard key={s.id} item={s} index={i} childId={child.id} />
          ))}
        </div>
      )}
    </main>
  );
}

function SurahCard({
  item,
  index,
  childId,
}: {
  item: SurahWithProgress;
  index: number;
  childId: string;
}) {
  const completed = item.progress?.is_completed ?? false;
  const inProgress =
    item.progress && !completed ? item.progress.current_step : 0;

  const inner = (
    <div
      className={`rounded-3xl p-4 shadow-soft border-2 transition-all ${
        !item.isUnlocked
          ? "bg-sand-dark/30 border-masjid/5 opacity-60"
          : completed
            ? "bg-gradient-to-br from-gold/20 to-gold/5 border-gold/30"
            : inProgress > 0
              ? "bg-gradient-to-br from-masjid/10 to-sand border-masjid/30"
              : "bg-white border-masjid/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
            !item.isUnlocked
              ? "bg-sand-dark text-masjid-dark/40"
              : completed
                ? "bg-gold text-white"
                : "bg-masjid text-sand"
          }`}
        >
          {!item.isUnlocked ? "🔒" : completed ? "✓" : index + 1}
        </div>
        <div className="flex-1">
          <p className="font-quran text-2xl text-masjid-dark leading-tight">
            {item.name_arabic}
          </p>
          <p className="text-xs text-masjid-dark/60">
            {item.total_ayahs} آية
            {completed && " · ✅ تمت"}
            {inProgress > 0 && ` · في الخطوة ${inProgress}`}
          </p>
        </div>
        {item.isUnlocked && (
          <span className="text-2xl">{completed ? "🏆" : "▶️"}</span>
        )}
      </div>
    </div>
  );

  if (!item.isUnlocked) return inner;

  return (
    <Link
      href={`/child/${childId}/surah/${item.surah_number}`}
      className="block active:scale-[0.98] transition-transform"
    >
      {inner}
    </Link>
  );
}
