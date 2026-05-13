"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Surah } from "@/lib/db/types";

export default function JourneyBuilderHubPage() {
  const [surahs, setSurahs] = useState<Array<Surah & { steps_count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    if (!supabase) return;
    const { data: surahsData } = await supabase
      .from("surahs")
      .select("*")
      .eq("is_active", true)
      .order("level_order");

    const ids = ((surahsData ?? []) as Surah[]).map((s) => s.id);
    const counts: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: stepsData } = await supabase
        .from("surah_steps")
        .select("surah_id");
      ((stepsData ?? []) as Array<{ surah_id: string }>).forEach((s) => {
        counts[s.surah_id] = (counts[s.surah_id] ?? 0) + 1;
      });
    }
    setSurahs(
      ((surahsData ?? []) as Surah[]).map((s) => ({
        ...s,
        steps_count: counts[s.id] ?? 0,
      })),
    );
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-masjid-dark">🗺️ بناء الرحلة</h1>
        <p className="text-sm text-masjid-dark/60">
          اختاري سورة لتصميم خطوات الطفل الـ ٦
        </p>
      </header>

      <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4">
        <p className="text-sm text-masjid-dark font-semibold mb-1">💡 الرحلة المثالية:</p>
        <p className="text-xs text-masjid-dark/70 leading-relaxed">
          1️⃣ استماع ٣× → 2️⃣ قصة → 3️⃣ استماع وترديد ٢× → 4️⃣ تسميع لماما 🔐 →
          5️⃣ احكي القصة لماما 🔐 → 6️⃣ مهمة الحياة 🔐
        </p>
      </div>

      {loading ? (
        <p className="text-masjid-dark/60">جاري التحميل...</p>
      ) : (
        <div className="space-y-2">
          {surahs.map((s) => (
            <Link
              key={s.id}
              href={`/admin/surahs/${s.id}?tab=steps`}
              className="block bg-white rounded-2xl p-4 shadow-soft border border-masjid/5 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-quran text-lg text-masjid-dark">{s.name_arabic}</p>
                  <p className="text-xs text-masjid-dark/60">
                    #{s.surah_number} · {s.total_ayahs} آية
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-bold ${
                      s.steps_count === 6
                        ? "text-success"
                        : s.steps_count > 0
                          ? "text-gold-dark"
                          : "text-masjid-dark/40"
                    }`}
                  >
                    {s.steps_count}/6
                  </p>
                  <p className="text-xs text-masjid-dark/60">خطوات</p>
                </div>
              </div>
            </Link>
          ))}
          {surahs.length === 0 && (
            <p className="text-center text-masjid-dark/60 py-8">
              مفيش سور. روحي{" "}
              <Link href="/admin/surahs" className="text-masjid font-bold underline">
                إضافة سور
              </Link>{" "}
              الأول.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
