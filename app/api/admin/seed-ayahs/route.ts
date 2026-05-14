import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 300;

const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

type FetchResult = {
  surah_number: number;
  inserted: number;
  status: "ok" | "skipped" | "error";
  error?: string;
};

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json(
      { error: "Supabase env vars not set" },
      { status: 503 },
    );
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Get all active surahs
  const { data: surahs, error: surahErr } = await supabase
    .from("surahs")
    .select("id, surah_number, total_ayahs")
    .eq("is_active", true)
    .order("level_order");

  if (surahErr || !surahs) {
    return NextResponse.json(
      { error: "Failed to load surahs: " + (surahErr?.message ?? "unknown") },
      { status: 500 },
    );
  }

  const results: FetchResult[] = [];

  for (const s of surahs) {
    // Skip if already has ayahs
    const { count } = await supabase
      .from("ayahs")
      .select("id", { count: "exact", head: true })
      .eq("surah_id", s.id);

    if ((count ?? 0) >= s.total_ayahs) {
      results.push({
        surah_number: s.surah_number,
        inserted: 0,
        status: "skipped",
      });
      continue;
    }

    try {
      const [plainRes, tashkeelRes] = await Promise.all([
        fetch(
          `https://api.alquran.cloud/v1/surah/${s.surah_number}/ar.muyassar`,
        ),
        fetch(
          `https://api.alquran.cloud/v1/surah/${s.surah_number}/quran-uthmani`,
        ),
      ]);

      if (!plainRes.ok || !tashkeelRes.ok) {
        throw new Error("alquran.cloud HTTP error");
      }

      const plainJson = await plainRes.json();
      const tashkeelJson = await tashkeelRes.json();

      const plainAyahs = plainJson.data.ayahs as Array<{
        number: number;
        numberInSurah: number;
        text: string;
      }>;
      const tashkeelAyahs = tashkeelJson.data.ayahs as Array<{
        numberInSurah: number;
        text: string;
      }>;

      const stripBismillah = (text: string, ayahNum: number): string => {
        if (s.surah_number !== 1 && s.surah_number !== 9 && ayahNum === 1) {
          return text.replace(
            /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/,
            "",
          );
        }
        return text;
      };

      const inserts = plainAyahs.map((a, i) => ({
        surah_id: s.id,
        ayah_number: a.numberInSurah,
        text_arabic: a.text,
        text_with_tashkeel: stripBismillah(
          tashkeelAyahs[i]?.text ?? a.text,
          a.numberInSurah,
        ),
        audio_url: `${AUDIO_BASE}/${a.number}.mp3`,
      }));

      const { error: insErr } = await supabase
        .from("ayahs")
        .upsert(inserts, { onConflict: "surah_id,ayah_number" });

      if (insErr) throw new Error(insErr.message);

      results.push({
        surah_number: s.surah_number,
        inserted: inserts.length,
        status: "ok",
      });
    } catch (err) {
      results.push({
        surah_number: s.surah_number,
        inserted: 0,
        status: "error",
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  const totalInserted = results.reduce((acc, r) => acc + r.inserted, 0);
  const successCount = results.filter((r) => r.status === "ok").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return NextResponse.json({
    summary: {
      surahs_processed: surahs.length,
      surahs_with_inserts: successCount,
      surahs_failed: errorCount,
      total_ayahs_inserted: totalInserted,
    },
    results,
  });
}
