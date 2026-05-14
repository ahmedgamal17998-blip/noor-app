"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
  totalMothers: number;
  totalChildren: number;
  totalSurahs: number;
  totalAyahs: number;
  totalSteps: number;
  totalMissions: number;
  totalStepCompletions: number;
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [seedBusy, setSeedBusy] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const loadStats = async () => {
    if (!supabase) return;
    const [m, c, s, a, st, ms, sc] = await Promise.all([
      supabase.from("mothers").select("id", { count: "exact", head: true }),
      supabase.from("children").select("id", { count: "exact", head: true }),
      supabase.from("surahs").select("id", { count: "exact", head: true }),
      supabase.from("ayahs").select("id", { count: "exact", head: true }),
      supabase.from("surah_steps").select("id", { count: "exact", head: true }),
      supabase
        .from("life_missions")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("step_completions")
        .select("id", { count: "exact", head: true }),
    ]);
    setStats({
      totalMothers: m.count ?? 0,
      totalChildren: c.count ?? 0,
      totalSurahs: s.count ?? 0,
      totalAyahs: a.count ?? 0,
      totalSteps: st.count ?? 0,
      totalMissions: ms.count ?? 0,
      totalStepCompletions: sc.count ?? 0,
    });
  };

  useEffect(() => {
    void loadStats();
  }, []);

  const runSeedAyahs = async () => {
    if (!confirm("هتجيب آيات كل السور من alquran.cloud (ممكن ياخد دقيقتين). نكمّل؟"))
      return;
    setSeedBusy(true);
    setSeedMsg(null);
    try {
      const res = await fetch("/api/admin/seed-ayahs", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "حصلت مشكلة");
      }
      setSeedMsg(
        `✅ تم! ${data.summary.surahs_with_inserts} سورة · ${data.summary.total_ayahs_inserted} آية`,
      );
      void loadStats();
    } catch (e) {
      setSeedMsg("❌ " + (e instanceof Error ? e.message : "unknown"));
    }
    setSeedBusy(false);
  };

  const ayahsNeeded = stats && stats.totalSurahs > 0 && stats.totalAyahs < 200;
  const noSurahs = stats && stats.totalSurahs === 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-masjid-dark">لوحة التحكم</h1>
        <p className="text-sm text-masjid-dark/60">نظرة عامة على المنصة</p>
      </header>

      {noSurahs && (
        <section className="bg-wrong/10 border-2 border-wrong/40 rounded-3xl p-5">
          <p className="font-bold text-wrong mb-2">⚠️ المنصة فاضية</p>
          <p className="text-sm text-masjid-dark/80 mb-3">
            مفيش سور في الـ DB. شغّلي migration 0004 من Supabase SQL Editor الأول.
          </p>
        </section>
      )}

      {ayahsNeeded && (
        <section className="bg-gold/10 border-2 border-gold/40 rounded-3xl p-5">
          <p className="font-bold text-gold-dark mb-2">🌱 محتاج تجيبي الآيات</p>
          <p className="text-sm text-masjid-dark/80 mb-3">
            عندك {stats?.totalSurahs} سورة جاهزة لكن مفيش آيات لسه. اضغطي
            الزرار وأنا هجيب الـ {stats && stats.totalSurahs * 7} آية تلقائياً
            من alquran.cloud.
          </p>
          <button
            onClick={runSeedAyahs}
            disabled={seedBusy}
            className="bg-gold text-white font-bold px-5 py-3 rounded-2xl active:scale-95 disabled:opacity-50"
          >
            {seedBusy ? "بنحمّل..." : "🌐 جلب الآيات تلقائياً"}
          </button>
          {seedMsg && (
            <p className="mt-3 text-sm font-bold text-masjid-dark">{seedMsg}</p>
          )}
        </section>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="👩" label="عدد الأمهات" value={stats?.totalMothers} />
        <StatCard icon="👶" label="عدد الأطفال" value={stats?.totalChildren} />
        <StatCard icon="📖" label="السور النشطة" value={stats?.totalSurahs} />
        <StatCard icon="📜" label="إجمالي الآيات" value={stats?.totalAyahs} />
        <StatCard icon="🗺️" label="إجمالي الخطوات" value={stats?.totalSteps} />
        <StatCard icon="🎯" label="إجمالي المهام" value={stats?.totalMissions} />
        <StatCard
          icon="✅"
          label="خطوات منجزة"
          value={stats?.totalStepCompletions}
        />
      </section>

      <section className="bg-white rounded-3xl p-5 shadow-soft border border-masjid/5">
        <h2 className="font-bold text-masjid-dark mb-3">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <QuickLink href="/admin/surahs" icon="📖" label="إدارة السور" />
          <QuickLink href="/admin/journey-builder" icon="🗺️" label="بناء الرحلة" />
          <QuickLink href="/admin/users" icon="👥" label="المستخدمين" />
          <QuickLink href="/admin/community" icon="💬" label="مراجعة المجتمع" />
          <QuickLink href="/admin/avatar-shop" icon="🎨" label="المتجر" />
          <QuickLink href="/admin/analytics" icon="📊" label="الإحصائيات" />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft text-center border border-masjid/5">
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-masjid-dark">{value ?? "—"}</div>
      <div className="text-[10px] text-masjid-dark/60 mt-1">{label}</div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 bg-sand p-3 rounded-2xl border border-masjid/10 hover:bg-masjid/10 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-semibold text-masjid-dark">{label}</span>
    </Link>
  );
}
