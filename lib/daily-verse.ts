export type DailyVerse = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  audio: string;
};

const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

const VERSES: Array<Omit<DailyVerse, "audio">> = [
  {
    surahNumber: 112,
    surahName: "الإخلاص",
    ayahNumber: 1,
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
  },
  {
    surahNumber: 113,
    surahName: "الفلق",
    ayahNumber: 1,
    text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
  },
  {
    surahNumber: 114,
    surahName: "الناس",
    ayahNumber: 1,
    text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
  },
  {
    surahNumber: 1,
    surahName: "الفاتحة",
    ayahNumber: 2,
    text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
  },
  {
    surahNumber: 103,
    surahName: "العصر",
    ayahNumber: 1,
    text: "وَالْعَصْرِ",
  },
  {
    surahNumber: 110,
    surahName: "النصر",
    ayahNumber: 1,
    text: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ",
  },
  {
    surahNumber: 108,
    surahName: "الكوثر",
    ayahNumber: 1,
    text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
  },
  {
    surahNumber: 94,
    surahName: "الشرح",
    ayahNumber: 5,
    text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
  },
  {
    surahNumber: 93,
    surahName: "الضحى",
    ayahNumber: 5,
    text: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
  },
  {
    surahNumber: 95,
    surahName: "التين",
    ayahNumber: 4,
    text: "لَقَدْ خَلَقْنَا الْإِنْسَانَ فِي أَحْسَنِ تَقْوِيمٍ",
  },
];

const QURAN_AYAH_OFFSETS: Record<number, number> = {
  1: 0,
  93: 6204,
  94: 6212,
  95: 6220,
  103: 6276,
  108: 6285,
  110: 6291,
  112: 6298,
  113: 6301,
  114: 6306,
};

export function getTodayVerse(): DailyVerse {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const v = VERSES[day % VERSES.length];
  const globalAyahNumber = (QURAN_AYAH_OFFSETS[v.surahNumber] ?? 0) + v.ayahNumber;
  return {
    ...v,
    audio: `${AUDIO_BASE}/${globalAyahNumber}.mp3`,
  };
}
