"use client";

import { useEffect, useRef, useState } from "react";
import type { SurahStep, Ayah } from "@/lib/db/types";
import { feedbackSuccess } from "@/lib/feedback";

export function ListenStep({
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
  const [playedCount, setPlayedCount] = useState(alreadyDone);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const target = step.required_completion_count;
  const ayah = ayahs[currentAyahIdx];

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const playAll = () => {
    if (ayahs.length === 0) return;
    setCurrentAyahIdx(0);
    setPlaying(true);
    playAt(0);
  };

  const playAt = (idx: number) => {
    const a = ayahs[idx];
    if (!a || !a.audio_url) {
      finishOneRound();
      return;
    }
    const audio = new Audio(a.audio_url);
    audioRef.current = audio;
    audio.onended = () => {
      if (idx + 1 < ayahs.length) {
        setCurrentAyahIdx(idx + 1);
        playAt(idx + 1);
      } else {
        finishOneRound();
      }
    };
    audio.onerror = () => finishOneRound();
    void audio.play();
  };

  const finishOneRound = () => {
    setPlaying(false);
    const newCount = playedCount + 1;
    setPlayedCount(newCount);
    if (newCount >= target) {
      feedbackSuccess();
      onComplete();
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-6xl mb-3">🔊</div>
        <h2 className="text-xl font-bold text-masjid-dark">{step.step_title}</h2>
        {step.step_description && (
          <p className="text-sm text-masjid-dark/60 mt-1">{step.step_description}</p>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-soft border border-masjid/10 text-center">
        <p className="text-xs text-masjid-dark/60 mb-2">
          {playedCount} من {target} مرات
        </p>
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: target }).map((_, i) => (
            <span
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < playedCount
                  ? "bg-success text-white"
                  : "bg-sand-dark text-masjid-dark/40"
              }`}
            >
              {i < playedCount ? "✓" : i + 1}
            </span>
          ))}
        </div>

        {playing && ayah && (
          <p dir="rtl" className="font-quran text-xl leading-loose text-masjid mb-3">
            {ayah.text_with_tashkeel}
          </p>
        )}

        {!playing ? (
          <button
            onClick={playAll}
            className="bg-masjid text-sand font-bold px-8 py-4 rounded-full text-lg active:scale-95"
          >
            ▶️ تشغيل
          </button>
        ) : (
          <button
            onClick={stop}
            className="bg-wrong text-white font-bold px-8 py-4 rounded-full text-lg active:scale-95"
          >
            ⏹️ إيقاف
          </button>
        )}
      </div>

      <p className="text-center text-sm text-masjid-dark/60">
        اسمع بتركيز وحاول تردد في قلبك مع التلاوة 🤍
      </p>
    </div>
  );
}
