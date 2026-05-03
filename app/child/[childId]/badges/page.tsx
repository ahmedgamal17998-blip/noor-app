"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { storage, type Child } from "@/lib/storage";
import { BADGES, getEarnedBadges, type Badge } from "@/lib/badges";

export default function BadgesPage() {
  const router = useRouter();
  const params = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [earned, setEarned] = useState<Set<string>>(new Set());

  useEffect(() => {
    const c = storage.getChild(params.childId);
    if (!c) {
      router.replace("/dashboard");
      return;
    }
    setChild(c);
    setEarned(new Set(getEarnedBadges(c.id).map((b) => b.id)));
  }, [params.childId, router]);

  if (!child) return null;

  return (
    <main className="min-h-screen px-5 py-5 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-5">
        <Link
          href={`/child/${child.id}`}
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div>
          <h1 className="font-bold text-masjid-dark">شارات {child.name} 🏅</h1>
          <p className="text-xs text-masjid-dark/60">
            {earned.size} من {BADGES.length}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {BADGES.map((b) => (
          <BadgeCard key={b.id} badge={b} earned={earned.has(b.id)} />
        ))}
      </div>
    </main>
  );
}

function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <div
      className={`rounded-3xl p-4 text-center border-2 ${
        earned
          ? "bg-gradient-to-br from-gold/30 to-gold/10 border-gold/40 shadow-soft"
          : "bg-white border-masjid/10 opacity-60"
      }`}
    >
      <div className="text-4xl mb-2">{earned ? badge.emoji : "🔒"}</div>
      <h3 className="font-bold text-masjid-dark text-sm">{badge.name}</h3>
      <p className="text-xs text-masjid-dark/60 mt-1 leading-tight">
        {badge.description}
      </p>
    </div>
  );
}
