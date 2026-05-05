import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ_TRANSCRIBE_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";

const HF_QURAN_MODEL = "tarteel-ai/whisper-base-ar-quran";
const HF_INFERENCE_URL = `https://api-inference.huggingface.co/models/${HF_QURAN_MODEL}`;

type TranscribeOk = {
  transcript: string;
  provider: "groq" | "huggingface" | "groq+hf";
  durationMs: number;
};

async function transcribeGroq(
  audio: Blob,
  apiKey: string,
  prompt?: string,
): Promise<{ transcript: string; ok: boolean; detail?: string }> {
  const form = new FormData();
  form.append("file", audio, "recitation.webm");
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", "ar");
  form.append("response_format", "json");
  form.append("temperature", "0");
  if (prompt) form.append("prompt", prompt);

  const res = await fetch(GROQ_TRANSCRIBE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) return { transcript: "", ok: false, detail: await res.text() };
  const data = (await res.json()) as { text: string };
  return { transcript: data.text, ok: true };
}

async function transcribeHuggingFace(
  audioBytes: ArrayBuffer,
  hfToken: string,
): Promise<{ transcript: string; ok: boolean; detail?: string }> {
  const res = await fetch(HF_INFERENCE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "audio/webm",
    },
    body: audioBytes,
  });
  if (!res.ok) return { transcript: "", ok: false, detail: await res.text() };
  const data = (await res.json()) as { text?: string; error?: string };
  if (data.error || !data.text) {
    return { transcript: "", ok: false, detail: data.error };
  }
  return { transcript: data.text, ok: true };
}

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY;
  const hfToken = process.env.HF_TOKEN;

  if (!groqKey && !hfToken) {
    return NextResponse.json(
      { error: "No transcription API key configured", code: "no_api_key" },
      { status: 503 },
    );
  }

  const start = Date.now();

  try {
    const form = await req.formData();
    const audio = form.get("audio");
    const ayahText = (form.get("ayahText") as string | null) ?? undefined;
    const preferQuran = form.get("preferQuran") === "true";

    if (!(audio instanceof Blob)) {
      return NextResponse.json(
        { error: "missing audio file" },
        { status: 400 },
      );
    }

    // Strategy:
    // - Default: Groq Whisper Turbo with ayah text as prompt biasing (fast + accurate)
    // - If preferQuran=true and HF_TOKEN set: try HF Quran-specialized model first
    // - On HF failure, fall back to Groq

    if (preferQuran && hfToken) {
      const audioBytes = await audio.arrayBuffer();
      const hf = await transcribeHuggingFace(audioBytes, hfToken);
      if (hf.ok) {
        const result: TranscribeOk = {
          transcript: hf.transcript,
          provider: "huggingface",
          durationMs: Date.now() - start,
        };
        return NextResponse.json(result);
      }
      // HF failed — fall back to Groq
      if (groqKey) {
        const groq = await transcribeGroq(audio, groqKey, ayahText);
        if (groq.ok) {
          const result: TranscribeOk = {
            transcript: groq.transcript,
            provider: "groq+hf",
            durationMs: Date.now() - start,
          };
          return NextResponse.json(result);
        }
      }
      return NextResponse.json(
        { error: "all providers failed", detail: hf.detail },
        { status: 502 },
      );
    }

    if (!groqKey) {
      return NextResponse.json(
        { error: "Groq API key not configured", code: "no_api_key" },
        { status: 503 },
      );
    }

    const groq = await transcribeGroq(audio, groqKey, ayahText);
    if (!groq.ok) {
      return NextResponse.json(
        { error: "groq transcribe failed", detail: groq.detail },
        { status: 502 },
      );
    }

    const result: TranscribeOk = {
      transcript: groq.transcript,
      provider: "groq",
      durationMs: Date.now() - start,
    };
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
