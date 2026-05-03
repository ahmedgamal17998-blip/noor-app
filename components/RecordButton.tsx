"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "recording" | "processing";

export function RecordButton({
  onRecord,
  disabled,
}: {
  onRecord: (blob: Blob) => Promise<void> | void;
  disabled?: boolean;
}) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = async () => {
    setError(null);
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
        setState("processing");
        try {
          await onRecord(blob);
        } finally {
          setState("idle");
          setSeconds(0);
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setError("محتاجين إذن الميكروفون");
    }
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recorderRef.current?.stop();
  };

  const handleClick = () => {
    if (disabled) return;
    if (state === "idle") start();
    else if (state === "recording") stop();
  };

  const labels: Record<State, string> = {
    idle: "اضغط واقرأ",
    recording: "اضغط لما تخلص",
    processing: "بنصحح...",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={disabled || state === "processing"}
        className={`relative w-32 h-32 rounded-full shadow-soft-lg flex items-center justify-center transition-all ${
          state === "recording"
            ? "bg-wrong text-white scale-110"
            : state === "processing"
              ? "bg-gold text-white"
              : "bg-masjid text-sand active:scale-95"
        } disabled:opacity-50`}
      >
        {state === "recording" && (
          <span className="absolute inset-0 rounded-full bg-wrong/40 animate-ping" />
        )}
        <span className="relative text-5xl">
          {state === "recording" ? "⏹️" : state === "processing" ? "⏳" : "🎤"}
        </span>
      </button>
      <p className="text-sm font-bold text-masjid-dark">{labels[state]}</p>
      {state === "recording" && (
        <p className="text-xs text-wrong font-mono">
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:
          {String(seconds % 60).padStart(2, "0")}
        </p>
      )}
      {error && <p className="text-xs text-wrong">{error}</p>}
    </div>
  );
}
