import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ_TRANSCRIBE_URL =
  "https://api.groq.com/openai/v1/audio/transcriptions";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Groq API key not configured", code: "no_api_key" },
      { status: 503 },
    );
  }

  try {
    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof Blob)) {
      return NextResponse.json(
        { error: "missing audio file" },
        { status: 400 },
      );
    }

    const groqForm = new FormData();
    groqForm.append("file", audio, "recitation.webm");
    groqForm.append("model", "whisper-large-v3-turbo");
    groqForm.append("language", "ar");
    groqForm.append("response_format", "json");
    groqForm.append("temperature", "0");

    const res = await fetch(GROQ_TRANSCRIBE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: groqForm,
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "groq transcribe failed", detail },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { text: string };
    return NextResponse.json({ transcript: data.text, provider: "groq" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
