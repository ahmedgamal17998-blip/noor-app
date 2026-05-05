"use client";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

function tone(freq: number, duration: number, when = 0): void {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, ctx.currentTime + when);
  gain.gain.setValueAtTime(0, ctx.currentTime + when);
  gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + when + 0.01);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + when + duration,
  );
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + duration);
}

export function playSuccess(): void {
  tone(523.25, 0.15, 0);
  tone(659.25, 0.15, 0.12);
  tone(783.99, 0.25, 0.24);
}

export function playError(): void {
  tone(196, 0.18, 0);
  tone(146.83, 0.28, 0.15);
}

export function playTap(): void {
  tone(660, 0.05, 0);
}

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* noop */
  }
}

export function feedbackSuccess(): void {
  vibrate([60, 40, 60]);
  playSuccess();
}

export function feedbackError(): void {
  vibrate([120]);
  playError();
}

export function feedbackTap(): void {
  vibrate(15);
  playTap();
}
