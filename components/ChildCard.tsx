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
    <Link
      href={`/dashboard/child/${child.id}`}
      className="block bg-white rounded-3xl p-5 shadow-soft border border-masjid/5 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kid-yellow/40 to-gold/40 flex items-center justify-center text-3xl shrink-0">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-masjid-dark truncate">
            {child.name}
          </h3>
          <p className="text-xs text-masjid-dark/60">{child.age} سنين</p>
          <div className="flex items-center gap-3 mt-2">
            <Stat icon="⭐" label="XP" value={child.totalXP} />
            <Stat icon="📖" label="النهارده" value={todayAyahs} />
          </div>
        </div>
        <div className="text-2xl">
          {taskConfirmed ? "✅" : "🎯"}
        </div>
      </div>
    </Link>
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
