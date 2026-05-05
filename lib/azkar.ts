export type Dhikr = {
  text: string;
  count: number;
  category: "morning" | "evening" | "general" | "sleep" | "wakeup";
  description?: string;
};

export const AZKAR: Dhikr[] = [
  // عام
  {
    text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    count: 1,
    category: "general",
    description: "للحماية من وسوسة الشيطان",
  },
  {
    text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    count: 1,
    category: "general",
    description: "بنبدأ بيها كل عمل",
  },
  {
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    count: 100,
    category: "general",
    description: "كلمتان خفيفتان على اللسان ثقيلتان في الميزان",
  },
  {
    text: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ",
    count: 10,
    category: "general",
    description: "الصلاة على النبي ﷺ",
  },
  {
    text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
    count: 100,
    category: "general",
  },
  {
    text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    count: 1,
    category: "general",
    description: "كنز من كنوز الجنة",
  },

  // أذكار الصباح
  {
    text: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    count: 1,
    category: "morning",
  },
  {
    text: "أَصْبَحْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ، وَكَلِمَةِ الْإِخْلَاصِ، وَدِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ",
    count: 1,
    category: "morning",
  },
  {
    text: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
    count: 4,
    category: "morning",
  },
  {
    text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    count: 7,
    category: "morning",
    description: "من قالها كفاه الله ما أهمه",
  },
  {
    text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ",
    count: 3,
    category: "morning",
  },
  {
    text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    count: 3,
    category: "morning",
    description: "حماية من كل ضرر طول اليوم",
  },
  {
    text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
    count: 3,
    category: "morning",
  },
  {
    text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    count: 10,
    category: "morning",
  },

  // أذكار المساء
  {
    text: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
    count: 1,
    category: "evening",
  },
  {
    text: "أَمْسَيْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ، وَكَلِمَةِ الْإِخْلَاصِ",
    count: 1,
    category: "evening",
  },
  {
    text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    count: 3,
    category: "evening",
    description: "يحميك من الشر طول الليل",
  },
  {
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
    count: 1,
    category: "evening",
  },

  // قبل النوم
  {
    text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    count: 1,
    category: "sleep",
  },
  {
    text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    count: 3,
    category: "sleep",
  },
  {
    text: "آيَةُ الْكُرْسِيِّ",
    count: 1,
    category: "sleep",
    description: "اقرأها قبل النوم وما يقربك شيطان",
  },

  // الاستيقاظ
  {
    text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    count: 1,
    category: "wakeup",
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
  "قول أستغفر الله ١٠٠ مرة",
  "تعلّم اسم جديد من أسماء الله",
  "اشرب وقرّاية بسم الله بـ 3 أنفاس",
  "قول الحمد لله كل ما تنجح في حاجة",
  "ادعي لوالديك بعد كل صلاة",
];

export function getTodayTaskSuggestion(): string {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return DAILY_TASK_IDEAS[day % DAILY_TASK_IDEAS.length];
}

export function getTodayDhikr(): Dhikr {
  const hour = new Date().getHours();
  const category: Dhikr["category"] =
    hour < 11 ? "morning" : hour >= 17 ? "evening" : "general";
  const filtered = AZKAR.filter((d) => d.category === category);
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return filtered[day % filtered.length];
}

export function getAzkarByCategory(category: Dhikr["category"]): Dhikr[] {
  return AZKAR.filter((d) => d.category === category);
}
