"use client";

import Link from "next/link";
import type { SurahProgress } from "@/lib/progression";
import { STARTER_SURAHS } from "@/lib/quran-api";

export function JourneyMap({
  childId,
  progress,
}: {
  childId: string;
  progress: SurahProgress[];
}) {
  return (
    <div className="relative py-4">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <pattern
            id="dots"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="5" cy="5" r="1.5" fill="#0d7a3f" opacity="0.2" />
          </pattern>
        </defs>
      </svg>

      <ol className="relative space-y-8">
        {progress.map((p, i) => {
          const surah = STARTER_SURAHS.find((s) => s.number === p.surahNumber);
          if (!surah) return null;
          const side = i % 2 === 0 ? "right" : "left";
          return (
            <li
              key={p.surahNumber}
              className={`relative flex ${
                side === "right" ? "justify-start" : "justify-end"
              }`}
            >
              {i < progress.length - 1 && (
                <span
                  className={`absolute top-16 ${
                    side === "right" ? "right-10" : "left-10"
                  } w-0.5 h-12 bg-gradient-to-b from-gold/40 to-masjid/30 border-r-2 border-dashed border-masjid/30`}
                />
              )}

              <Stage
                childId={childId}
                progress={p}
                name={surah.name}
                ayahCount={surah.numberOfAyahs}
              />
            </li>
          );
        })}

        <li className="text-center pt-4">
          <span className="text-4xl">🕌</span>
          <p className="text-xs text-masjid-dark/60 font-bold mt-1">
            ينعَم اللهُ بحفاظِه
          </p>
        </li>
      </ol>
    </div>
  );
}

function Stage({
  childId,
  progress,
  name,
  ayahCount,
}: {
  childId: string;
  progress: SurahProgress;
  name: string;
  ayahCount: number;
}) {
  const locked = !progress.isUnlocked;
  const surahHref = `/child/${childId}/surah/${progress.surahNumber}`;

  const inner = (
    <>
      <div
        className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-soft-lg shrink-0 ${
          progress.isComplete
            ? "bg-gradient-to-br from-gold to-gold-dark text-white"
            : progress.attempted > 0
              ? "bg-gradient-to-br from-masjid to-masjid-dark text-sand"
              : "bg-white border-4 border-masjid/20 text-masjid-dark"
        }`}
      >
        {locked ? (
          <span className="text-3xl">🔒</span>
        ) : (
          <span className="font-bold text-lg">{progress.surahNumber}</span>
        )}
        {progress.stars > 0 && !locked && (
          <span className="absolute -top-2 -left-2 bg-white rounded-full px-2 py-0.5 text-xs font-bold shadow-soft border border-gold/30">
            {"⭐".repeat(progress.stars)}
          </span>
        )}
      </div>

      <div
        className={`bg-white rounded-2xl p-3 shadow-soft border ${
          progress.isComplete ? "border-gold/40" : "border-masjid/10"
        } min-w-[140px]`}
      >
        <p className="font-quran text-2xl text-masjid-dark leading-tight">
          {name}
        </p>
        <p className="text-xs text-masjid-dark/60">
          {locked
            ? "🔒 احفظ نص اللي قبلها"
            : `${progress.correct}/${ayahCount} آيات`}
        </p>
      </div>
    </>
  );

  return (
    <div className={`flex items-center gap-3 ${locked ? "opacity-60" : ""}`}>
      {locked ? (
        <div className="flex items-center gap-3 cursor-not-allowed">{inner}</div>
      ) : (
        <Link
          href={surahHref}
          className="flex items-center gap-3 active:scale-95 transition-transform"
        >
          {inner}
        </Link>
      )}
      {progress.isComplete && (
        <Link
          href={`/child/${childId}/certificate/${progress.surahNumber}`}
          className="text-xs bg-gold/20 text-gold-dark font-bold px-2 py-1 rounded-full whitespace-nowrap"
        >
          🏆
        </Link>
      )}
    </div>
  );
}
