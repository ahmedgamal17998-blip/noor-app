import Link from "next/link";
import { PROPHET_STORIES } from "@/lib/islamic-content";

export default function StoriesListPage() {
  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-5">
        <Link
          href="/content"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <h1 className="font-bold text-masjid-dark">📖 قصص الأنبياء</h1>
      </header>

      <div className="space-y-3">
        {PROPHET_STORIES.map((s) => (
          <Link
            key={s.id}
            href={`/content/stories/${s.id}`}
            className="flex items-center gap-4 bg-white rounded-3xl p-4 shadow-soft border border-masjid/5 active:scale-[0.98] transition-transform"
          >
            <div className="w-16 h-16 rounded-full bg-kid-sky/20 flex items-center justify-center text-3xl shrink-0">
              {s.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-masjid-dark truncate">
                {s.prophetName}
              </h3>
              <p className="text-xs text-masjid-dark/60">{s.shortDesc}</p>
            </div>
            <span className="text-xl text-masjid">←</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
