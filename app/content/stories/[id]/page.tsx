import Link from "next/link";
import { notFound } from "next/navigation";
import { PROPHET_STORIES } from "@/lib/islamic-content";

export default function StoryReaderPage({
  params,
}: {
  params: { id: string };
}) {
  const story = PROPHET_STORIES.find((s) => s.id === params.id);
  if (!story) notFound();

  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-5">
        <Link
          href="/content/stories"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <h1 className="font-bold text-masjid-dark text-sm">
          {story.prophetName}
        </h1>
      </header>

      <div className="text-center mb-6">
        <div className="inline-flex w-24 h-24 rounded-full bg-gradient-to-br from-kid-sky/40 to-kid-sky/10 items-center justify-center text-6xl shadow-soft">
          {story.emoji}
        </div>
        <h2 className="text-2xl font-bold text-masjid-dark mt-3">
          {story.prophetName}
        </h2>
        <p className="text-masjid font-semibold">{story.title}</p>
      </div>

      <article className="space-y-3 mb-5">
        {story.paragraphs.map((p, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 shadow-soft border border-masjid/5"
          >
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gold text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-masjid-dark leading-relaxed text-sm">{p}</p>
            </div>
          </div>
        ))}
      </article>

      <section className="bg-gradient-to-br from-gold/30 to-gold/10 rounded-3xl p-5 border-2 border-gold/30">
        <p className="text-xs font-bold text-gold-dark mb-2 tracking-widest">
          🌟 الدرس المستفاد
        </p>
        <p className="text-masjid-dark font-semibold leading-relaxed">
          {story.lesson}
        </p>
      </section>
    </main>
  );
}

export function generateStaticParams() {
  return PROPHET_STORIES.map((s) => ({ id: s.id }));
}
