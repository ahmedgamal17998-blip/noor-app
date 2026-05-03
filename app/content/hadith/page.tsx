import Link from "next/link";
import { HADITH_FOR_KIDS } from "@/lib/islamic-content";

export default function HadithListPage() {
  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-5">
        <Link
          href="/content"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <h1 className="font-bold text-masjid-dark">💬 أحاديث للأطفال</h1>
      </header>

      <div className="space-y-3">
        {HADITH_FOR_KIDS.map((h, i) => (
          <article
            key={h.id}
            className="bg-white rounded-3xl p-5 shadow-soft border border-kid-mint/30"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-kid-mint/30 text-masjid-dark text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-xs text-masjid-dark/60">قال رسول الله ﷺ:</p>
            </div>
            <p
              dir="rtl"
              className="font-quran text-xl leading-loose text-center text-masjid-dark mb-3 px-2"
            >
              {h.text}
            </p>
            <p className="text-xs text-masjid-dark/60 text-center mb-4">
              {h.source} · رواه {h.narrator}
            </p>
            <div className="bg-gold/10 rounded-2xl p-3 border border-gold/20">
              <p className="text-xs font-bold text-gold-dark mb-1">
                💡 يعني إيه؟
              </p>
              <p className="text-sm text-masjid-dark leading-relaxed">
                {h.forKids}
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
