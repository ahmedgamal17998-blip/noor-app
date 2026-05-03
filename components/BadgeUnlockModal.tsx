"use client";

import type { Badge } from "@/lib/badges";

export function BadgeUnlockModal({
  badges,
  onClose,
}: {
  badges: Badge[];
  onClose: () => void;
}) {
  if (badges.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gold to-gold-dark text-white rounded-4xl p-8 max-w-sm w-full shadow-soft-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-5xl animate-bounce">
          🎉
        </div>
        <p className="text-center text-sm opacity-80 mt-6 mb-2">
          ما شاء الله! كسبت شارة جديدة
        </p>
        <h2 className="text-center text-2xl font-bold mb-6">شارة جديدة!</h2>

        <div className="space-y-4 mb-6">
          {badges.map((b) => (
            <div
              key={b.id}
              className="bg-white/15 backdrop-blur rounded-3xl p-4 flex items-center gap-3 border border-white/20"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-4xl shrink-0 shadow-soft">
                {b.emoji}
              </div>
              <div>
                <h3 className="font-bold text-lg">{b.name}</h3>
                <p className="text-xs opacity-80">{b.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-white text-gold-dark font-bold py-3 rounded-3xl active:scale-95 transition-transform"
        >
          استمر في الرحلة 🌙
        </button>
      </div>
    </div>
  );
}
