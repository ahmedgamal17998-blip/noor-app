"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { storage, type Child } from "@/lib/storage";
import { STARTER_SURAHS } from "@/lib/quran-api";
import { getSurahProgress } from "@/lib/progression";
import { toPng } from "html-to-image";

export default function CertificatePage() {
  const router = useRouter();
  const params = useParams<{ childId: string; surahNum: string }>();
  const surahNum = Number(params.surahNum);
  const surah = STARTER_SURAHS.find((s) => s.number === surahNum);

  const [child, setChild] = useState<Child | null>(null);
  const [busy, setBusy] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = storage.getChild(params.childId);
    if (!c) {
      router.replace("/dashboard");
      return;
    }
    setChild(c);
  }, [params.childId, router]);

  if (!child || !surah) return null;

  const progress = getSurahProgress(child.id, surahNum);
  const dateAr = new Date().toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const generateImage = async (): Promise<string | null> => {
    if (!certRef.current) return null;
    return toPng(certRef.current, {
      pixelRatio: 2,
      backgroundColor: "#fef9e7",
    });
  };

  const download = async () => {
    setBusy(true);
    try {
      const url = await generateImage();
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `شهادة-${child.name}-${surah.name}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  const shareToWhatsapp = async () => {
    setBusy(true);
    try {
      const url = await generateImage();
      if (!url) return;
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `noor-certificate.png`, {
        type: "image/png",
      });
      const text = `بفضل الله، ${child.name} حفظ سورة ${surah.name} في تطبيق نور 🌙`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text });
      } else {
        const a = document.createElement("a");
        a.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
        a.target = "_blank";
        a.click();
      }
    } catch {
      // user cancelled
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen px-5 py-5 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-5">
        <Link
          href={`/child/${child.id}`}
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <h1 className="font-bold text-masjid-dark">شهادة الحفظ 🏆</h1>
      </header>

      <div
        ref={certRef}
        className="bg-gradient-to-br from-sand to-sand-dark rounded-3xl p-6 border-4 border-double border-gold shadow-soft-lg"
      >
        <div className="text-center space-y-3">
          <div className="text-gold-dark text-xs tracking-widest font-bold">
            ﷽
          </div>

          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-masjid to-masjid-dark text-sand flex items-center justify-center text-3xl font-quran shadow-soft">
              ن
            </div>
          </div>

          <h2 className="text-xs text-masjid-dark/70 font-bold tracking-widest">
            تطبيق نــور
          </h2>

          <div className="border-t-2 border-b-2 border-dashed border-gold/40 py-4 my-3">
            <p className="text-sm text-masjid-dark/70 mb-1">شهادة حفظ</p>
            <h1 className="font-quran text-4xl text-masjid-dark mb-2">
              سورة {surah.name}
            </h1>
            <p className="text-sm text-masjid-dark/70">
              ({surah.numberOfAyahs} آيات)
            </p>
          </div>

          <p className="text-sm text-masjid-dark">تُمنح هذه الشهادة لـ</p>
          <h2 className="text-3xl font-bold text-masjid">{child.name}</h2>
          <p className="text-xs text-masjid-dark/70 leading-relaxed px-4">
            بمناسبة إتمام حفظ سورة {surah.name} كاملة
            {progress.stars === 3 && " بإتقان"}
          </p>

          <div className="flex justify-center gap-1 py-2">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={
                  i <= progress.stars ? "text-2xl" : "text-2xl opacity-20"
                }
              >
                ⭐
              </span>
            ))}
          </div>

          <div className="text-xs text-masjid-dark/60 pt-2">{dateAr}</div>
        </div>
      </div>

      <div className="space-y-2 mt-5">
        <button
          onClick={shareToWhatsapp}
          disabled={busy}
          className="w-full bg-success text-white font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95 transition-transform disabled:opacity-50"
        >
          {busy ? "...جاري التجهيز" : "📱 شارك على واتساب"}
        </button>
        <button
          onClick={download}
          disabled={busy}
          className="w-full bg-white border-2 border-masjid/20 text-masjid-dark font-bold py-4 rounded-3xl active:scale-95 transition-transform disabled:opacity-50"
        >
          ⬇️ تحميل الشهادة
        </button>
      </div>
    </main>
  );
}
