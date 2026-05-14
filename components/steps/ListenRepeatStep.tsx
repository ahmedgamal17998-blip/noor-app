"use client";

import { useEffect, useRef, useState } from "react";
import type { SurahStep, Ayah } from "@/lib/db/types";
import { feedbackSuccess, feedbackTap } from "@/lib/feedback";
import { StepVideo } from "./StepVideo";

export function ListenRepeatStep({
  step,
  ayahs,
  alreadyDone,
  onComplete,
}: {
  step: SurahStep;
  ayahs: Ayah[];
  alreadyDone: number;
  onComplete: () => void;
}) {
  const [round, setRound] = useState(alreadyDone);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"listening" | "repeating" | "done">("listening");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const idxRef = useRef(0);
  const roundRef = useRef(alreadyDone);

  const target = step.required_completion_count;
  const ayah = ayahs[idx];

  // Single audio element; iOS-safe: src change re-uses the unlocked element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onEnded = () => setPhase("repeating");
    const onError = () => setPhase("repeating");
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const play = () => {
    if (!ayah?.audio_url || !audioRef.current) return;
    feedbackTap();
    setPhase("listening");
    audioRef.current.src = ayah.audio_url;
    void audioRef.current.play().catch(() => setPhase("repeating"));
  };

  const nextAyah = () => {
    feedbackTap();
    if (idx + 1 < ayahs.length) {
      setIdx(idx + 1);
      setPhase("listening");
    } else {
      const newRound = round + 1;
      setRound(newRound);
      if (newRound >= target) {
        feedbackSuccess();
        setPhase("done");
        onComplete();
      } else {
        setIdx(0);
        setPhase("listening");
      }
    }
  };

  if (!ayah) {
    return <p className="text-masjid-dark/60">جاري التحميل...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-5xl mb-2">🎤</div>
        <h2 className="text-xl font-bold text-masjid-dark">{step.step_title}</h2>
        <p className="text-xs text-masjid-dark/60 mt-1">
          الجولة {round + 1} من {target} · الآية {idx + 1} من {ayahs.length}
        </p>
      </div>

      <StepVideo url={step.video_url} />

      <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-gold/20 relative">
        <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gold text-white font-bold flex items-center justify-center shadow-soft text-sm">
          {ayah.ayah_number}
        </span>
        <p dir="rtl" className="font-quran text-3xl leading-loose text-center text-masjid-dark">
          {ayah.text_with_tashkeel}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        {phase === "listening" && (
          <button
            onClick={play}
            className="bg-masjid text-sand font-bold px-8 py-4 rounded-full text-lg active:scale-95 touch-manipulation select-none"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            🔊 اسمع
          </button>
        )}
        {phase === "repeating" && (
          <>
            <p className="text-center text-sm text-masjid-dark/70">
              دلوقتي رددها بصوت عالي 🗣️
            </p>
            <div className="flex gap-2">
              <button
                onClick={play}
                className="bg-white border-2 border-masjid/20 text-masjid-dark font-bold px-5 py-3 rounded-full active:scale-95 touch-manipulation select-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                🔊 إعادة
              </button>
              <button
                onClick={nextAyah}
                className="bg-success text-white font-bold px-6 py-3 rounded-full active:scale-95 touch-manipulation select-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                ✓ رددت
              </button>
            </div>
          </>
        )}
        {phase === "done" && <p className="text-success font-bold">ما شاء الله! ✨</p>}
      </div>
    </div>
  );
}
