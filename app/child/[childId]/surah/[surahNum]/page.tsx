"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { storage, type Child } from "@/lib/storage";
import { fetchSurah, STARTER_SURAHS, type Ayah } from "@/lib/quran-api";
import {
  ColoredAyah,
  ayahToWords,
  type WordResult,
} from "@/components/ColoredAyah";
import { RecordButton } from "@/components/RecordButton";
import { Mascot } from "@/components/Mascot";
import { BadgeUnlockModal } from "@/components/BadgeUnlockModal";
import { compareTranscript } from "@/lib/compare-text";
import { getEarnedBadges, getNewBadges, type Badge } from "@/lib/badges";
import { feedbackSuccess, feedbackError } from "@/lib/feedback";

type Phase = "loading" | "ready" | "playing" | "recorded" | "celebrating";

export default function ReadingPage() {
  const router = useRouter();
  const params = useParams<{ childId: string; surahNum: string }>();
  const surahNum = Number(params.surahNum);

  const [child, setChild] = useState<Child | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [words, setWords] = useState<WordResult[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [xpGained, setXpGained] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [memMode, setMemMode] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const surah = STARTER_SURAHS.find((s) => s.number === surahNum);
  const current = ayahs[idx];

  useEffect(() => {
    return () => {
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const c = storage.getChild(params.childId);
    if (!c) {
      router.replace("/dashboard");
      return;
    }
    setChild(c);

    fetchSurah(surahNum)
      .then((a) => {
        setAyahs(a);
        const correctSet = new Set(
          storage
            .getSessions(params.childId)
            .filter((s) => s.surahNumber === surahNum && s.isCorrect)
            .map((s) => s.ayahNumber),
        );
        const resumeIdx = a.findIndex((ay) => !correctSet.has(ay.numberInSurah));
        const startIdx = resumeIdx >= 0 ? resumeIdx : 0;
        setIdx(startIdx);
        setWords(ayahToWords(a[startIdx]?.text ?? ""));
        setPhase("ready");
      })
      .catch(() => setFeedback("مشكلة في تحميل السورة، حاول تاني"));
  }, [params.childId, surahNum, router]);

  useEffect(() => {
    if (current && phase === "ready") {
      setWords(ayahToWords(current.text));
      setXpGained(0);
      setFeedback("");
    }
  }, [current, phase]);

  const playAudio = () => {
    if (!current) return;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(current.audio);
    audioRef.current = audio;
    setPhase("playing");
    audio.play().catch(() => setFeedback("مشكلة في تشغيل الصوت"));
    audio.onended = () => setPhase("ready");
    audio.onerror = () => setPhase("ready");
  };

  const handleRecording = async (blob: Blob) => {
    if (!current || !child) return;

    try {
      const form = new FormData();
      form.append("audio", blob, "recitation.webm");
      form.append("ayahText", current.text);
      form.append("preferQuran", "true");

      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        if (data?.code === "no_api_key") {
          // Mock for dev: assume 70% correct
          const fakeTranscript = current.text
            .split(/\s+/)
            .filter(() => Math.random() > 0.3)
            .join(" ");
          applyResult(current.text, fakeTranscript, true);
          return;
        }
        throw new Error(data?.error || "transcribe failed");
      }

      applyResult(current.text, data.transcript, false);
    } catch {
      setFeedback("حصلت مشكلة، حاول تاني");
      setPhase("ready");
    }
  };

  const applyResult = (ayahText: string, transcript: string, mock: boolean) => {
    const result = compareTranscript(ayahText, transcript);
    setWords(result.words);

    const before = new Set(getEarnedBadges(child!.id).map((b) => b.id));

    if (result.isCorrect) {
      feedbackSuccess();
      const xp = memMode ? 20 : 10;
      storage.addXP(child!.id, xp);
      storage.addSession({
        childId: child!.id,
        surahNumber: surahNum,
        ayahNumber: current!.numberInSurah,
        isCorrect: true,
        accuracy: result.accuracy,
        mistakes: result.mistakes,
        xpEarned: xp,
      });
      setXpGained(xp);
      setFeedback(mock ? "أحسنت! (تجريبي)" : "ما شاء الله، أحسنت!");
      setPhase("celebrating");
      const newly = getNewBadges(child!.id, before);
      if (newly.length > 0) setNewBadges(newly);
    } else {
      feedbackError();
      storage.addSession({
        childId: child!.id,
        surahNumber: surahNum,
        ayahNumber: current!.numberInSurah,
        isCorrect: false,
        accuracy: result.accuracy,
        mistakes: result.mistakes,
        xpEarned: 0,
      });
      setFeedback("حاول تاني، ركّز في الكلمات الحمرا");
      setPhase("recorded");
    }
  };

  const next = () => {
    if (idx < ayahs.length - 1) {
      setIdx(idx + 1);
      setPhase("ready");
    } else {
      const correctSet = new Set(
        storage
          .getSessions(params.childId)
          .filter((s) => s.surahNumber === surahNum && s.isCorrect)
          .map((s) => s.ayahNumber),
      );
      const surahComplete =
        ayahs.length > 0 && correctSet.size >= ayahs.length;
      if (surahComplete) {
        router.push(`/child/${params.childId}/certificate/${surahNum}`);
      } else {
        router.push(`/child/${params.childId}`);
      }
    }
  };

  const retry = () => {
    if (current) setWords(ayahToWords(current.text));
    setPhase("ready");
    setFeedback("");
  };

  if (phase === "loading" || !current || !child) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-masjid font-bold animate-pulse">جاري التحميل...</div>
      </main>
    );
  }

  const progress = ((idx + 1) / ayahs.length) * 100;

  return (
    <main className="min-h-screen flex flex-col px-5 py-5 max-w-md mx-auto">
      {newBadges.length > 0 && (
        <BadgeUnlockModal
          badges={newBadges}
          onClose={() => setNewBadges([])}
        />
      )}
      <header className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push(`/child/${child.id}`)}
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </button>
        <div className="text-center">
          <p className="text-xs text-masjid-dark/60">سورة</p>
          <h1 className="font-quran text-2xl text-masjid-dark leading-tight">
            {surah?.name}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-gold-dark font-bold">⭐ {child.totalXP}</p>
          <p className="text-xs text-masjid-dark/60">
            {idx + 1}/{ayahs.length}
          </p>
        </div>
      </header>

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex-1 h-2 bg-sand-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-gold to-masjid transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={() => {
            setMemMode((m) => !m);
            setPeeking(false);
          }}
          className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
            memMode
              ? "bg-masjid text-sand"
              : "bg-white text-masjid-dark border border-masjid/20"
          }`}
        >
          {memMode ? "🧠 وضع الحفظ" : "📖 وضع القراءة"}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 justify-center">
        <div
          className={`transition-all duration-300 ${
            memMode && !peeking && phase !== "celebrating"
              ? "blur-md select-none"
              : ""
          }`}
        >
          <ColoredAyah words={words} ayahNumber={current.numberInSurah} />
        </div>

        {memMode && phase !== "celebrating" && (
          <button
            onClick={() => {
              setPeeking(true);
              if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
              peekTimerRef.current = setTimeout(() => setPeeking(false), 3000);
            }}
            disabled={peeking}
            className="self-center bg-gold/20 text-gold-dark font-bold px-4 py-2 rounded-full text-sm active:scale-95 transition-transform disabled:opacity-60"
          >
            {peeking ? "👁️ ٣ ثواني..." : "👁️ بصة سريعة"}
          </button>
        )}

        {(phase === "ready" || phase === "playing") && (
          <button
            onClick={playAudio}
            disabled={phase === "playing"}
            className="self-center bg-white border-2 border-masjid/20 text-masjid-dark font-bold px-6 py-3 rounded-full shadow-soft active:scale-95 transition-transform disabled:opacity-60"
          >
            {phase === "playing" ? "🔊 شغّال..." : "🔊 اسمع الآية"}
          </button>
        )}

        {feedback && (
          <Mascot
            mood={phase === "celebrating" ? "celebrating" : "encouraging"}
            message={feedback}
            size="md"
          />
        )}

        {xpGained > 0 && (
          <div className="self-center bg-gold/20 text-gold-dark font-bold px-4 py-2 rounded-full animate-bounce">
            +{xpGained} XP ⭐
          </div>
        )}
      </div>

      <div className="pt-6 pb-4 flex flex-col items-center gap-4">
        {phase === "celebrating" ? (
          <button
            onClick={next}
            className="w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95 transition-transform"
          >
            {idx < ayahs.length - 1 ? "الآية التالية ←" : "خلصت السورة 🎉"}
          </button>
        ) : phase === "recorded" ? (
          <button
            onClick={retry}
            className="w-full bg-gold text-white font-bold py-4 rounded-3xl shadow-soft-lg active:scale-95 transition-transform"
          >
            حاول تاني 🔄
          </button>
        ) : (
          <RecordButton onRecord={handleRecording} disabled={phase === "playing"} />
        )}
      </div>
    </main>
  );
}
