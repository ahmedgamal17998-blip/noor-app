export type Ayah = {
  number: number;
  numberInSurah: number;
  text: string;
  audio: string;
};

export type Surah = {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
};

const BASE = "https://api.alquran.cloud/v1";
const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

export const STARTER_SURAHS: Surah[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", numberOfAyahs: 7 },
  { number: 114, name: "الناس", englishName: "An-Nas", numberOfAyahs: 6 },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", numberOfAyahs: 5 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", numberOfAyahs: 4 },
  { number: 111, name: "المسد", englishName: "Al-Masad", numberOfAyahs: 5 },
  { number: 110, name: "النصر", englishName: "An-Nasr", numberOfAyahs: 3 },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", numberOfAyahs: 6 },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", numberOfAyahs: 3 },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", numberOfAyahs: 7 },
  { number: 106, name: "قريش", englishName: "Quraysh", numberOfAyahs: 4 },
  { number: 105, name: "الفيل", englishName: "Al-Fil", numberOfAyahs: 5 },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", numberOfAyahs: 9 },
  { number: 103, name: "العصر", englishName: "Al-Asr", numberOfAyahs: 3 },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", numberOfAyahs: 8 },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", numberOfAyahs: 11 },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat", numberOfAyahs: 11 },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", numberOfAyahs: 8 },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", numberOfAyahs: 8 },
  { number: 97, name: "القدر", englishName: "Al-Qadr", numberOfAyahs: 5 },
  { number: 96, name: "العلق", englishName: "Al-Alaq", numberOfAyahs: 19 },
  { number: 95, name: "التين", englishName: "At-Tin", numberOfAyahs: 8 },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", numberOfAyahs: 8 },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", numberOfAyahs: 11 },
];

export async function fetchSurah(surahNumber: number): Promise<Ayah[]> {
  const res = await fetch(`${BASE}/surah/${surahNumber}/quran-uthmani`);
  if (!res.ok) throw new Error("Failed to fetch surah");
  const data = await res.json();
  const ayahs = data.data.ayahs as Array<{
    number: number;
    numberInSurah: number;
    text: string;
  }>;
  return ayahs.map((a) => ({
    number: a.number,
    numberInSurah: a.numberInSurah,
    text: stripBismillah(a.text, surahNumber, a.numberInSurah),
    audio: `${AUDIO_BASE}/${a.number}.mp3`,
  }));
}

function stripBismillah(text: string, surah: number, ayah: number): string {
  if (surah !== 1 && surah !== 9 && ayah === 1) {
    return text.replace(
      /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/,
      "",
    );
  }
  return text;
}
