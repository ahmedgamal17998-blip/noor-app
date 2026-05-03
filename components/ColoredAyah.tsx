export type WordResult = {
  word: string;
  status: "correct" | "wrong" | "neutral";
};

export function ColoredAyah({
  words,
  ayahNumber,
}: {
  words: WordResult[];
  ayahNumber: number;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-gold/20 relative">
      <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gold text-white font-bold flex items-center justify-center shadow-soft text-sm">
        {ayahNumber}
      </span>
      <p
        dir="rtl"
        className="font-quran text-3xl leading-loose text-center text-masjid-dark"
      >
        {words.map((w, i) => (
          <span
            key={i}
            className={
              w.status === "correct"
                ? "text-success"
                : w.status === "wrong"
                  ? "text-wrong underline decoration-wavy"
                  : "text-masjid-dark"
            }
          >
            {w.word}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}

export function ayahToWords(text: string): WordResult[] {
  return text
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((word) => ({ word, status: "neutral" }));
}
