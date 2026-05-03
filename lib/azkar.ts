export type Dhikr = {
  text: string;
  count: number;
  category: "morning" | "evening" | "general";
};

export const AZKAR: Dhikr[] = [
  {
    text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    count: 1,
    category: "general",
  },
  {
    text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    count: 1,
    category: "general",
  },
  {
    text: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    count: 1,
    category: "morning",
  },
  {
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    count: 3,
    category: "general",
  },
  {
    text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    count: 1,
    category: "morning",
  },
  {
    text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    count: 7,
    category: "evening",
  },
  {
    text: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ",
    count: 10,
    category: "general",
  },
];

export const DAILY_TASK_IDEAS = [
  "اقرأ بسم الله قبل كل أكل وشرب",
  "صلّي على النبي ﷺ ١٠ مرات",
  "قول أذكار الصباح كاملة",
  "ساعد أمك في حاجة بسيطة",
  "قل لأخوك أو أختك كلمة حلوة",
  "اقرأ سورة الإخلاص ٣ مرات",
  "ادعي لجدك وجدتك",
  "قول الحمد لله بعد الأكل",
  "اقرأ المعوذتين قبل النوم",
  "تصدّق على فقير ولو بقرش",
];

export function getTodayTaskSuggestion(): string {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return DAILY_TASK_IDEAS[day % DAILY_TASK_IDEAS.length];
}

export function getTodayDhikr(): Dhikr {
  const hour = new Date().getHours();
  const category: Dhikr["category"] =
    hour < 12 ? "morning" : hour >= 17 ? "evening" : "general";
  const filtered = AZKAR.filter((d) => d.category === category);
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return filtered[day % filtered.length];
}
