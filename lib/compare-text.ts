import type { WordResult } from "@/components/ColoredAyah";

export type CompareResult = {
  words: WordResult[];
  accuracy: number;
  mistakes: string[];
  isCorrect: boolean;
  /** how close (0-1) each ayah word was matched */
  perWordScore: number[];
};

const ARABIC_DIACRITICS = /[ً-ْٰۖ-ۭ]/g;
const PUNCTUATION = /[،؛؟٪-٭.,;:!?"'()-]/g;
const TATWEEL = /ـ/g;

export function stripDiacritics(text: string): string {
  return text
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(PUNCTUATION, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalize(text: string): string {
  return stripDiacritics(text)
    .replace(/[إأآٱا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/** Levenshtein distance — used for fuzzy word matching */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

/** Returns similarity 0..1 — 1 means identical */
function wordSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Sequence-aligned matching with fuzzy similarity.
 * For each expected word, find the best matching word in the transcript
 * within a small forward window (allows minor reordering / misheard words).
 */
function alignAndScore(
  expected: string[],
  said: string[],
): { scores: number[]; matchedIdx: Array<number | null> } {
  const scores = new Array(expected.length).fill(0);
  const matchedIdx: Array<number | null> = new Array(expected.length).fill(null);
  let cursor = 0; // pointer into transcript

  for (let i = 0; i < expected.length; i++) {
    const exp = expected[i];
    let bestScore = 0;
    let bestJ = -1;

    // Search a forward window of up to 4 words from the cursor
    const windowEnd = Math.min(said.length, cursor + 5);
    for (let j = cursor; j < windowEnd; j++) {
      const sim = wordSimilarity(exp, said[j]);
      if (sim > bestScore) {
        bestScore = sim;
        bestJ = j;
      }
      if (bestScore >= 0.95) break;
    }

    // Also check 1-2 words back (in case Whisper repeated)
    for (let j = Math.max(0, cursor - 2); j < cursor; j++) {
      const sim = wordSimilarity(exp, said[j]);
      if (sim > bestScore) {
        bestScore = sim;
        bestJ = j;
      }
    }

    scores[i] = bestScore;
    if (bestJ >= 0 && bestScore >= 0.6) {
      matchedIdx[i] = bestJ;
      cursor = bestJ + 1;
    }
  }

  return { scores, matchedIdx };
}

export function compareTranscript(
  ayahText: string,
  transcript: string,
): CompareResult {
  const ayahDisplayWords = ayahText
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const expected = tokens(ayahText);
  const said = tokens(transcript);

  const { scores } = alignAndScore(expected, said);

  let totalScore = 0;
  const mistakes: string[] = [];
  const perWordScore: number[] = [];

  const words: WordResult[] = ayahDisplayWords.map((display, i) => {
    const score = scores[i] ?? 0;
    perWordScore.push(score);
    totalScore += score;
    if (score >= 0.85) {
      return { word: display, status: "correct" };
    }
    if (score >= 0.6) {
      // Close-but-not-quite: mark as wrong (so kid knows to retry) but don't fully penalize
      mistakes.push(display);
      return { word: display, status: "wrong" };
    }
    mistakes.push(display);
    return { word: display, status: "wrong" };
  });

  const accuracy = expected.length > 0 ? totalScore / expected.length : 0;
  return {
    words,
    accuracy,
    mistakes,
    isCorrect: accuracy >= 0.75,
    perWordScore,
  };
}
