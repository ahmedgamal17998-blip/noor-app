import type { WordResult } from "@/components/ColoredAyah";

export type CompareResult = {
  words: WordResult[];
  accuracy: number;
  mistakes: string[];
  isCorrect: boolean;
};

const ARABIC_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g;
const PUNCTUATION = /[،؛؟٪-٭.,;:!?"'()-]/g;
const TATWEEL = /ـ/g;

export function normalize(text: string): string {
  return text
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(PUNCTUATION, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

export function compareTranscript(
  ayahText: string,
  transcript: string,
): CompareResult {
  const ayahDisplayWords = ayahText
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const ayahNorm = tokens(ayahText);
  const said = new Set(tokens(transcript));

  let correctCount = 0;
  const mistakes: string[] = [];

  const words: WordResult[] = ayahDisplayWords.map((display, i) => {
    const norm = ayahNorm[i] ?? normalize(display);
    if (said.has(norm)) {
      correctCount++;
      return { word: display, status: "correct" };
    }
    mistakes.push(display);
    return { word: display, status: "wrong" };
  });

  const accuracy = ayahNorm.length > 0 ? correctCount / ayahNorm.length : 0;
  return {
    words,
    accuracy,
    mistakes,
    isCorrect: accuracy >= 0.8,
  };
}
