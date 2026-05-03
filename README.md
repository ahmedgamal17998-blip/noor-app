# نــور — Noor

> رفيق طفلك في رحلة حفظ القرآن
> *AI-powered Quran memorization app for kids (5–12), with mother dashboard.*

---

## الفكرة

تطبيق ويب (PWA) للأطفال (5–12 سنة) يساعدهم على حفظ القرآن:
- الطفل يسمع الآية → يسجّل صوته → AI يصحّح ويلوّن الكلمات
- الأم تتابع التقدّم من dashboard خاصة بيها

## التشغيل المحلي

```bash
npm install
cp .env.local.example .env.local
# املأ المفاتيح في .env.local
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

## التجربة على الموبايل

```bash
npm run dev:mobile
```

ثم افتح من موبايلك (على نفس الـ Wi-Fi): `http://[IP-اللاب]:3000`

## الـ Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + RTL
- **Supabase** (Auth + DB)
- **OpenAI Whisper** (تصحيح التلاوة)
- **Vercel** (Deploy)

## الـ Milestones

| # | المحطة | الناتج |
|---|--------|--------|
| M1 | الأساس + Live Preview | شاشة ترحيب + لينك Vercel |
| M2 | الأم تسجّل + تضيف طفل | Auth + dashboard أساسي |
| M3 | الطفل يسمع ويسجّل | شاشة الطفل بدون AI |
| M4 | AI يصحح + XP | تلوين + تخزين الجلسات |
| M5 | الأم تتابع | داشبورد كامل + مهمة اليوم |
| M6 | PWA كامل | تثبيت على الموبايل |
