"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { searchAyah, type AyahMatch } from "@/lib/voice-search";
import { feedbackTap } from "@/lib/feedback";

type Phase = "idle" | "recording" | "transcribing" | "searching" | "results";

export default function VoiceSearchPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [query, setQuery] = useState("");
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState<AyahMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAyah = (audio: string) => {
    if (audioRef.current) audioRef.current.pause();
    const a = new Audio(audio);
    audioRef.current = a;
    void a.play();
  };

  const startRecording = async () => {
    setError(null);
    feedbackTap();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await transcribeAndSearch(blob);
      };

      recorder.start();
      recorderRef.current = recorder;
      setPhase("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("محتاجين إذن الميكروفون");
    }
  };

  const stopRecording = () => {
    feedbackTap();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recorderRef.current?.stop();
  };

  const transcribeAndSearch = async (blob: Blob) => {
    setPhase("transcribing");
    try {
      const form = new FormData();
      form.append("audio", blob, "voice-query.webm");
      form.append("preferQuran", "true");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "transcribe failed");
      }
      const text = data.transcript as string;
      setTranscript(text);
      setQuery(text);
      await runSearch(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حصلت مشكلة");
      setPhase("idle");
    }
  };

  const runSearch = async (text: string) => {
    setPhase("searching");
    try {
      const matches = await searchAyah(text, 8);
      setResults(matches);
      setPhase("results");
    } catch {
      setError("مش قادرين نحمّل المصحف، اتأكدي من النت");
      setPhase("idle");
    }
  };

  const submitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setTranscript(query);
    void runSearch(query);
  };

  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-5">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div>
          <h1 className="font-bold text-masjid-dark">🔍 ابحث عن آية بصوتك</h1>
          <p className="text-xs text-masjid-dark/60">
            اقرأي جزء من الآية وهنلاقيهالك
          </p>
        </div>
      </header>

      <section className="bg-white rounded-3xl p-6 shadow-soft mb-4 text-center">
        <button
          onClick={
            phase === "recording" ? stopRecording : startRecording
          }
          disabled={phase === "transcribing" || phase === "searching"}
          className={`w-28 h-28 rounded-full shadow-soft-lg flex items-center justify-center mx-auto transition-all ${
            phase === "recording"
              ? "bg-wrong text-white scale-110"
              : phase === "transcribing" || phase === "searching"
                ? "bg-gold text-white"
                : "bg-masjid text-sand active:scale-95"
          }`}
        >
          {phase === "recording" && (
            <span className="absolute w-28 h-28 rounded-full bg-wrong/30 animate-ping" />
          )}
          <span className="text-4xl relative">
            {phase === "recording"
              ? "⏹️"
              : phase === "transcribing" || phase === "searching"
                ? "⏳"
                : "🎤"}
          </span>
        </button>
        <p className="text-sm font-bold text-masjid-dark mt-3">
          {phase === "idle" && "اضغطي وقولي جزء من الآية"}
          {phase === "recording" &&
            `بنسجل... ${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`}
          {phase === "transcribing" && "بنفهم اللي قلتيه..."}
          {phase === "searching" && "بنبحث في المصحف..."}
          {phase === "results" && "النتائج 👇"}
        </p>
        {error && <p className="text-xs text-wrong mt-2">{error}</p>}
      </section>

      <form onSubmit={submitText} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="أو اكتبي جزء من الآية..."
            className="flex-1 bg-white border-2 border-masjid/10 rounded-2xl px-4 py-3 focus:border-masjid focus:outline-none"
          />
          <button
            type="submit"
            className="bg-masjid text-sand font-bold px-4 rounded-2xl active:scale-95"
          >
            🔍
          </button>
        </div>
      </form>

      {transcript && (
        <p className="text-xs text-masjid-dark/70 mb-3 px-2">
          سمعتك بتقولي: <span className="font-quran text-base">{transcript}</span>
        </p>
      )}

      <section className="space-y-3">
        {results.map((m, i) => (
          <div
            key={`${m.surahNumber}-${m.ayahNumber}-${i}`}
            className="bg-white rounded-2xl p-4 shadow-soft border border-masjid/5"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-masjid-dark/60">
                  سورة {m.surahName} · آية {m.ayahNumber}
                </p>
              </div>
              <button
                onClick={() => playAyah(m.audio)}
                className="bg-masjid/10 text-masjid-dark text-xs font-bold px-3 py-1 rounded-full active:scale-95"
              >
                🔊 سماع
              </button>
            </div>
            <p
              dir="rtl"
              className="font-quran text-xl leading-loose text-masjid-dark"
            >
              {m.text}
            </p>
          </div>
        ))}
        {phase === "results" && results.length === 0 && (
          <p className="text-center text-masjid-dark/60 py-8">
            مش لاقيين آية مطابقة. حاولي تاني وقولي شوية كلمات أكتر.
          </p>
        )}
      </section>
    </main>
  );
}
