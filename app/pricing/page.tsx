import Link from "next/link";

const PLANS = [
  {
    name: "مجاناً",
    price: "٠ ج.م",
    period: "للأبد",
    color: "from-sand to-sand-dark/30",
    features: [
      "طفل واحد",
      "السور الأساسية (٦ سور)",
      "خطوة استماع وقصة",
      "متابعة بسيطة من ماما",
    ],
    cta: "ابدئي مجاناً",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "أساسية",
    price: "٤٩ ج.م",
    period: "/شهر",
    color: "from-masjid to-masjid-dark",
    features: [
      "٣ أطفال",
      "كل السور المتاحة",
      "الـ ٦ خطوات الكاملة",
      "أفاتار قابل للتخصيص",
      "مجتمع الأمهات",
      "متابعة تفصيلية",
    ],
    cta: "اشتركي الآن",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "بريميوم",
    price: "٩٩ ج.م",
    period: "/شهر",
    color: "from-gold to-gold-dark",
    features: [
      "أطفال غير محدودين",
      "محتوى حصري",
      "قصص مرئية + صوتية",
      "أسئلة فهم متقدمة",
      "تقارير شهرية",
      "دعم مباشر",
    ],
    cta: "اشتركي الآن",
    href: "/signup",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen px-5 py-8 max-w-2xl mx-auto">
      <header className="text-center mb-8">
        <div className="text-5xl mb-3">🌙</div>
        <h1 className="text-3xl font-bold text-masjid-dark">الأسعار</h1>
        <p className="text-sm text-masjid-dark/60 mt-2">
          اختاري الخطة المناسبة لعائلتك
        </p>
      </header>

      <div className="space-y-4">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`rounded-3xl p-6 shadow-soft border-2 ${
              p.highlighted ? "border-gold" : "border-transparent"
            } bg-gradient-to-br ${p.color} ${
              p.highlighted ? "text-white" : "text-masjid-dark"
            }`}
          >
            {p.highlighted && (
              <span className="inline-block bg-gold text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                ⭐ الأكثر شعبية
              </span>
            )}
            <div className="flex items-baseline gap-2 mb-3">
              <h2 className="text-2xl font-bold">{p.name}</h2>
              <span className="text-3xl font-bold">{p.price}</span>
              <span className="text-sm opacity-70">{p.period}</span>
            </div>
            <ul className="space-y-1 mb-4">
              {p.features.map((f) => (
                <li key={f} className="text-sm flex items-center gap-2">
                  <span>✅</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={p.href}
              className={`block w-full text-center font-bold py-3 rounded-2xl active:scale-95 transition-transform ${
                p.highlighted
                  ? "bg-white text-gold-dark"
                  : "bg-masjid text-sand"
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-masjid-dark/60 mt-6">
        كل الخطط فيها فترة تجريبية مجانية ٧ أيام
      </p>

      <p className="text-center mt-8">
        <Link href="/" className="text-masjid font-bold underline text-sm">
          ← العودة للرئيسية
        </Link>
      </p>
    </main>
  );
}
