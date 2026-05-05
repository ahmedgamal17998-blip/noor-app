import { normalize } from "./compare-text";

export type AyahMatch = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  audio: string;
  score: number;
};

const BASE = "https://api.alquran.cloud/v1";
const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

type CachedAyah = {
  number: number; // global ayah number 1..6236
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  textNorm: string;
};

let cache: CachedAyah[] | null = null;
let pending: Promise<CachedAyah[]> | null = null;

async function loadIndex(): Promise<CachedAyah[]> {
  if (cache) return cache;
  if (pending) return pending;
  pending = (async () => {
    const res = await fetch(`${BASE}/quran/quran-uthmani`);
    if (!res.ok) throw new Error("Failed to load Quran index");
    const json = await res.json();
    const surahs = json.data.surahs as Array<{
      number: number;
      name: string;
      ayahs: Array<{
        number: number;
        numberInSurah: number;
        text: string;
      }>;
    }>;
    const out: CachedAyah[] = [];
    for (const s of surahs) {
      for (const a of s.ayahs) {
        out.push({
          number: a.number,
          surahNumber: s.number,
          surahName: s.name,
          ayahNumber: a.numberInSurah,
          text: a.text,
          textNorm: normalize(a.text),
        });
      }
    }
    cache = out;
    return out;
  })();
  return pending;
}

export async function searchAyah(
  query: string,
  limit = 8,
): Promise<AyahMatch[]> {
  const idx = await loadIndex();
  const q = normalize(query).trim();
  if (!q) return [];

  // Word-overlap scoring + small bonus for substring containment
  const qWords = q.split(/\s+/).filter((w) => w.length > 1);
  if (qWords.length === 0) return [];

  type Scored = CachedAyah & { score: number };
  const scored: Scored[] = [];

  for (const a of idx) {
    let hits = 0;
    for (const w of qWords) {
      if (a.textNorm.includes(w)) hits++;
    }
    if (hits === 0) continue;
    let score = hits / qWords.length;
    if (a.textNorm.includes(q)) score += 0.5;
    scored.push({ ...a, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => ({
    surahNumber: s.surahNumber,
    surahName: s.surahName,
    ayahNumber: s.ayahNumber,
    text: s.text,
    audio: `${AUDIO_BASE}/${s.number}.mp3`,
    score: s.score,
  }));
}
