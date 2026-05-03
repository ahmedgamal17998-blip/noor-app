import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured", code: "no_api_key" },
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

    const whisperForm = new FormData();
    whisperForm.append("file", audio, "recitation.webm");
    whisperForm.append("model", "whisper-1");
    whisperForm.append("language", "ar");
    whisperForm.append("response_format", "json");

    const res = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: whisperForm,
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "whisper failed", detail },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { text: string };
    return NextResponse.json({ transcript: data.text });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
