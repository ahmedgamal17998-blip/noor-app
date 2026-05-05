"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { storage, type Child } from "@/lib/storage";
import { getReviewCards, type ReviewCard } from "@/lib/srs";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [cards, setCards] = useState<ReviewCard[]>([]);

  useEffect(() => {
    const c = storage.getChild(params.childId);
    if (!c) {
      router.replace("/dashboard");
      return;
    }
    setChild(c);
    setCards(getReviewCards(c.id));
  }, [params.childId, router]);

  if (!child) return null;

  const due = cards.filter((c) => c.isDue);
  const upcoming = cards.filter((c) => !c.isDue);

  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-5">
        <Link
          href={`/child/${child.id}`}
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div>
          <h1 className="font-bold text-masjid-dark">🔁 المراجعة الذكية</h1>
          <p className="text-xs text-masjid-dark/60">
            {due.length > 0
              ? `${due.length} آية محتاجة مراجعة النهارده`
              : "كله متراجع، أحسنت!"}
          </p>
        </div>
      </header>

      {cards.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 shadow-soft text-center">
          <p className="text-5xl mb-3">📖</p>
          <p className="text-masjid-dark font-bold mb-2">لسه ما بدأتش</p>
          <p className="text-sm text-masjid-dark/60 mb-4">
            لما تخلص أول آية في أي سورة، هتلاقيها هنا للمراجعة بنظام التكرار
            المتباعد.
          </p>
          <Link
            href={`/child/${child.id}`}
            className="inline-block bg-masjid text-sand font-bold px-6 py-3 rounded-2xl active:scale-95 transition-transform"
          >
            ابدأ سورة
          </Link>
        </div>
      ) : (
        <>
          {due.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-masjid-dark/70 mb-2 px-1">
                🔥 محتاجة مراجعة دلوقتي ({due.length})
              </h2>
              <div className="space-y-2">
                {due.map((c) => (
                  <ReviewItem key={`${c.surahNumber}-${c.ayahNumber}`} childId={child.id} card={c} />
                ))}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-masjid-dark/70 mb-2 px-1">
                📅 لسه عندها وقت ({upcoming.length})
              </h2>
              <div className="space-y-2">
                {upcoming.map((c) => (
                  <ReviewItem
                    key={`${c.surahNumber}-${c.ayahNumber}`}
                    childId={child.id}
                    card={c}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function ReviewItem({ childId, card }: { childId: string; card: ReviewCard }) {
  const easePct = Math.round(card.ease * 100);
  return (
    <Link
      href={`/child/${childId}/surah/${card.surahNumber}`}
      className={`block rounded-2xl p-4 shadow-soft border active:scale-[0.98] transition-transform ${
        card.isDue
          ? "bg-gold/10 border-gold/30"
          : "bg-white border-masjid/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-quran text-xl text-masjid-dark">
            {card.surahName}
          </p>
          <p className="text-xs text-masjid-dark/60">
            آية {card.ayahNumber} · إتقان {easePct}%
          </p>
        </div>
        <div className="text-right">
          {card.isDue ? (
            <>
              <p className="text-xs font-bold text-gold-dark">🔥 الآن</p>
              {card.daysOverdue > 0 && (
                <p className="text-[10px] text-wrong">
                  متأخر {card.daysOverdue} يوم
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-masjid-dark/60">
              كل {card.intervalDays} يوم
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
