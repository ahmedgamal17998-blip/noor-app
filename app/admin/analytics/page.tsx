"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Analytics = {
  signupsByMonth: Array<{ month: string; count: number }>;
  completionByPlan: Array<{ plan: string; count: number }>;
  surahCompletionRate: number;
  totalActivities: number;
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    if (!supabase) return;
    const [mothers, progress, stepCompl] = await Promise.all([
      supabase.from("mothers").select("created_at, subscription_plan"),
      supabase.from("child_surah_progress").select("is_completed"),
      supabase.from("step_completions").select("id", { count: "exact", head: true }),
    ]);

    // Group by month
    const monthMap = new Map<string, number>();
    ((mothers.data ?? []) as Array<{ created_at: string }>).forEach((m) => {
      const month = m.created_at.slice(0, 7);
      monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
    });
    const signupsByMonth = Array.from(monthMap.entries())
      .sort()
      .map(([month, count]) => ({ month, count }));

    // Plan distribution
    const planMap = new Map<string, number>();
    ((mothers.data ?? []) as Array<{ subscription_plan: string }>).forEach((m) => {
      const plan = m.subscription_plan ?? "free";
      planMap.set(plan, (planMap.get(plan) ?? 0) + 1);
    });
    const completionByPlan = Array.from(planMap.entries()).map(([plan, count]) => ({
      plan,
      count,
    }));

    const totalSurahsAttempted = (progress.data ?? []).length;
    const completedCount = ((progress.data ?? []) as Array<{ is_completed: boolean }>).filter(
      (p) => p.is_completed,
    ).length;
    const surahCompletionRate =
      totalSurahsAttempted > 0
        ? Math.round((completedCount / totalSurahsAttempted) * 100)
        : 0;

    setData({
      signupsByMonth,
      completionByPlan,
      surahCompletionRate,
      totalActivities: stepCompl.count ?? 0,
    });
  };

  if (!data) {
    return <p className="text-masjid-dark/60">جاري التحميل...</p>;
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-masjid-dark">📊 الإحصائيات</h1>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-masjid/5">
          <p className="text-xs text-masjid-dark/60">معدل إكمال السور</p>
          <p className="text-3xl font-bold text-masjid-dark mt-2">
            {data.surahCompletionRate}%
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-masjid/5">
          <p className="text-xs text-masjid-dark/60">إجمالي النشاطات</p>
          <p className="text-3xl font-bold text-masjid-dark mt-2">
            {data.totalActivities}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-soft border border-masjid/5">
        <h2 className="font-bold text-masjid-dark mb-3">📅 الاشتراكات بالشهر</h2>
        {data.signupsByMonth.length === 0 ? (
          <p className="text-sm text-masjid-dark/60">لسه مفيش بيانات كافية</p>
        ) : (
          <div className="space-y-2">
            {data.signupsByMonth.map((m) => {
              const max = Math.max(...data.signupsByMonth.map((x) => x.count));
              const pct = (m.count / max) * 100;
              return (
                <div key={m.month}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-masjid-dark/70">{m.month}</span>
                    <span className="font-bold text-masjid-dark">{m.count}</span>
                  </div>
                  <div className="h-2 bg-sand-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-masjid"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-soft border border-masjid/5">
        <h2 className="font-bold text-masjid-dark mb-3">💎 توزيع الخطط</h2>
        <div className="grid grid-cols-3 gap-2">
          {data.completionByPlan.map((p) => (
            <div key={p.plan} className="text-center bg-sand rounded-2xl p-3">
              <p className="text-xs text-masjid-dark/60">{p.plan}</p>
              <p className="text-2xl font-bold text-masjid-dark mt-1">{p.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
