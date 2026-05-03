import Link from "next/link";

export default function ContentHubPage() {
  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div>
          <h1 className="font-bold text-masjid-dark">📚 المكتبة الإسلامية</h1>
          <p className="text-xs text-masjid-dark/60">قصص وأحاديث وفقه للأطفال</p>
        </div>
      </header>

      <section className="space-y-3">
        <Tile
          href="/content/stories"
          gradient="from-kid-sky/30 to-kid-sky/10"
          emoji="📖"
          title="قصص الأنبياء"
          desc="تعرّف على أنبياء الله وسير حياتهم"
        />
        <Tile
          href="/content/hadith"
          gradient="from-kid-mint/40 to-kid-mint/10"
          emoji="💬"
          title="أحاديث للأطفال"
          desc="كلام النبي ﷺ بأسلوب بسيط"
        />
        <Tile
          href="/content/fiqh"
          gradient="from-kid-pink/30 to-kid-pink/10"
          emoji="🕌"
          title="فقه الصغار"
          desc="وضوء، صلاة، آداب يومية"
        />
        <Tile
          href="/today"
          gradient="from-gold/30 to-gold/10"
          emoji="📿"
          title="درس اليوم"
          desc="ذكر يومي + مهمة عملية"
        />
      </section>
    </main>
  );
}

function Tile({
  href,
  gradient,
  emoji,
  title,
  desc,
}: {
  href: string;
  gradient: string;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className={`block bg-gradient-to-br ${gradient} rounded-3xl p-5 shadow-soft border border-masjid/5 active:scale-[0.98] transition-transform`}
    >
      <div className="flex items-center gap-4">
        <div className="text-5xl">{emoji}</div>
        <div className="flex-1">
          <h3 className="font-bold text-masjid-dark">{title}</h3>
          <p className="text-xs text-masjid-dark/70 mt-1">{desc}</p>
        </div>
        <span className="text-2xl text-masjid">←</span>
      </div>
    </Link>
  );
}
