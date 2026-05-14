"use client";

import Link from "next/link";
import type { Child } from "@/lib/storage";

const avatars = ["🌙", "⭐", "✨", "🌟", "💫", "☀️"];

export function ChildCard({
  child,
  todayAyahs,
  taskConfirmed,
}: {
  child: Child;
  todayAyahs: number;
  taskConfirmed: boolean;
}) {
  const avatar = avatars[child.name.charCodeAt(0) % avatars.length];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-soft border border-masjid/5">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kid-yellow/40 to-gold/40 flex items-center justify-center text-3xl shrink-0">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-masjid-dark truncate">
            {child.name}
          </h3>
          <p className="text-xs text-masjid-dark/60">{child.age} سنين</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Stat icon="⭐" label="XP" value={child.totalXP} />
            <Stat icon="📖" label="النهارده" value={todayAyahs} />
            <span className="text-base">{taskConfirmed ? "✅" : "🎯"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/child/${child.id}/journey`}
          className="bg-gradient-to-l from-masjid to-masjid-dark text-sand text-sm font-bold py-3 rounded-2xl text-center active:scale-95 transition-transform"
        >
          🎮 رحلة {child.name}
        </Link>
        <Link
          href={`/dashboard/child/${child.id}`}
          className="bg-white border-2 border-masjid/20 text-masjid-dark text-sm font-bold py-3 rounded-2xl text-center active:scale-95 transition-transform"
        >
          📊 إحصائيات
        </Link>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <span className="text-xs bg-sand-dark/60 px-2 py-1 rounded-full font-semibold text-masjid-dark">
      {icon} {value} {label}
    </span>
  );
}
