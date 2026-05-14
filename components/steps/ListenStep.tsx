"use client";

import { useEffect, useRef, useState } from "react";
import type { SurahStep, Ayah } from "@/lib/db/types";
import { feedbackSuccess } from "@/lib/feedback";
import { StepVideo } from "./StepVideo";

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
  // Use refs so audio callbacks (which run outside user gesture) see fresh values
  const idxRef = useRef(0);
  const playedRef = useRef(alreadyDone);
  const targetRef = useRef(step.required_completion_count);
  const ayahsRef = useRef<Ayah[]>(ayahs);

  const target = step.required_completion_count;
  const ayah = ayahs[currentAyahIdx];

  // Sync refs with props/state
  useEffect(() => {
    ayahsRef.current = ayahs;
  }, [ayahs]);
  useEffect(() => {
    targetRef.current = step.required_completion_count;
  }, [step.required_completion_count]);

  // Create a single Audio element on mount.
  // iOS Safari requires audio to be "unlocked" via user gesture, but subsequent
  // src changes on the SAME element are allowed (this is the fix for the mobile bug).
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
      const nextIdx = idxRef.current + 1;
      const allAyahs = ayahsRef.current;
      if (nextIdx < allAyahs.length) {
        idxRef.current = nextIdx;
        setCurrentAyahIdx(nextIdx);
        const next = allAyahs[nextIdx];
        if (next?.audio_url && audioRef.current) {
          audioRef.current.src = next.audio_url;
          void audioRef.current.play().catch(() => finishOneRound());
        } else {
          finishOneRound();
        }
      } else {
        finishOneRound();
      }
    };
    const handleError = () => finishOneRound();

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishOneRound = () => {
    setPlaying(false);
    const newCount = playedRef.current + 1;
    playedRef.current = newCount;
    setPlayedCount(newCount);
    if (newCount >= targetRef.current) {
      feedbackSuccess();
      onComplete();
    }
  };

  const playAll = () => {
    if (!audioRef.current || ayahsRef.current.length === 0) return;
    const first = ayahsRef.current[0];
    if (!first?.audio_url) {
      finishOneRound();
      return;
    }
    idxRef.current = 0;
    setCurrentAyahIdx(0);
    setPlaying(true);
    audioRef.current.src = first.audio_url;
    void audioRef.current.play().catch((err) => {
      // Most likely iOS blocking — still mark one round to avoid stuck UI
      console.warn("audio play failed:", err);
      finishOneRound();
    });
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

      <StepVideo url={step.video_url} />

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
            className="bg-masjid text-sand font-bold px-8 py-4 rounded-full text-lg active:scale-95 touch-manipulation select-none"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            ▶️ تشغيل
          </button>
        ) : (
          <button
            onClick={stop}
            className="bg-wrong text-white font-bold px-8 py-4 rounded-full text-lg active:scale-95 touch-manipulation select-none"
            style={{ WebkitTapHighlightColor: "transparent" }}
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
