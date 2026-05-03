import Link from "next/link";
import { FIQH_TIPS } from "@/lib/islamic-content";

const categoryColor: Record<string, string> = {
  وضوء: "bg-kid-sky/30 text-blue-700",
  صلاة: "bg-masjid/15 text-masjid-dark",
  آداب: "bg-kid-pink/30 text-pink-700",
  صيام: "bg-gold/30 text-gold-dark",
};

export default function FiqhPage() {
  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-5">
        <Link
          href="/content"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <h1 className="font-bold text-masjid-dark">🕌 فقه الصغار</h1>
      </header>

      <div className="space-y-3">
        {FIQH_TIPS.map((tip) => (
          <details
            key={tip.id}
            className="bg-white rounded-3xl shadow-soft border border-masjid/5 overflow-hidden group"
          >
            <summary className="flex items-center gap-4 p-5 cursor-pointer list-none">
              <div className="w-14 h-14 rounded-full bg-kid-mint/30 flex items-center justify-center text-3xl shrink-0">
                {tip.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${categoryColor[tip.category]}`}
                >
                  {tip.category}
                </span>
                <h3 className="font-bold text-masjid-dark mt-1">{tip.title}</h3>
              </div>
              <span className="text-2xl text-masjid group-open:rotate-90 transition-transform">
                ←
              </span>
            </summary>
            <div className="px-5 pb-5">
              <ol className="space-y-2">
                {tip.steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 bg-sand-dark/40 rounded-2xl p-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-masjid text-sand text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-masjid-dark leading-relaxed">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
