"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
  totalMothers: number;
  totalChildren: number;
  totalSurahs: number;
  totalStepCompletions: number;
  totalMissions: number;
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void loadStats();
  }, []);

  const loadStats = async () => {
    if (!supabase) return;
    const [m, c, s, sc, mc] = await Promise.all([
      supabase.from("mothers").select("id", { count: "exact", head: true }),
      supabase.from("children").select("id", { count: "exact", head: true }),
      supabase.from("surahs").select("id", { count: "exact", head: true }),
      supabase.from("step_completions").select("id", { count: "exact", head: true }),
      supabase.from("mission_completions").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      totalMothers: m.count ?? 0,
      totalChildren: c.count ?? 0,
      totalSurahs: s.count ?? 0,
      totalStepCompletions: sc.count ?? 0,
      totalMissions: mc.count ?? 0,
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-masjid-dark">لوحة التحكم</h1>
        <p className="text-sm text-masjid-dark/60">نظرة عامة على المنصة</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon="👩" label="عدد الأمهات" value={stats?.totalMothers} />
        <StatCard icon="👶" label="عدد الأطفال" value={stats?.totalChildren} />
        <StatCard icon="📖" label="السور النشطة" value={stats?.totalSurahs} />
        <StatCard icon="✅" label="إجمالي الخطوات" value={stats?.totalStepCompletions} />
        <StatCard icon="🎯" label="إجمالي المهام" value={stats?.totalMissions} />
      </section>

      <section className="bg-white rounded-3xl p-5 shadow-soft border border-masjid/5">
        <h2 className="font-bold text-masjid-dark mb-3">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <QuickLink href="/admin/surahs" icon="📖" label="إدارة السور" />
          <QuickLink href="/admin/journey-builder" icon="🗺️" label="بناء الرحلة" />
          <QuickLink href="/admin/users" icon="👥" label="المستخدمين" />
          <QuickLink href="/admin/community" icon="💬" label="مراجعة المجتمع" />
          <QuickLink href="/admin/avatar-shop" icon="🎨" label="المتجر" />
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
    <div className="bg-white rounded-2xl p-5 shadow-soft text-center border border-masjid/5">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-masjid-dark">
        {value ?? "—"}
      </div>
      <div className="text-xs text-masjid-dark/60 mt-1">{label}</div>
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
