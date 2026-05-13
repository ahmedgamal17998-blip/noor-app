"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getSurahBySlug,
  getAyahs,
  getStory,
  getMissions,
  getSurahSteps,
  getStepCompletions,
  recordStepCompletion,
  upsertProgress,
} from "@/lib/db/queries";
import type {
  Surah,
  Ayah,
  SurahStory,
  LifeMission,
  SurahStep,
  StepCompletion,
  Child,
} from "@/lib/db/types";
import { ListenStep } from "@/components/steps/ListenStep";
import { StoryStep } from "@/components/steps/StoryStep";
import { ListenRepeatStep } from "@/components/steps/ListenRepeatStep";
import { MotherApprovalStep } from "@/components/steps/MotherApprovalStep";

export default function SurahLoopPage() {
  const router = useRouter();
  const params = useParams<{ childId: string; surahNum: string }>();

  const [child, setChild] = useState<Child | null>(null);
  const [surah, setSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [story, setStory] = useState<SurahStory | null>(null);
  const [missions, setMissions] = useState<LifeMission[]>([]);
  const [steps, setSteps] = useState<SurahStep[]>([]);
  const [completions, setCompletions] = useState<StepCompletion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    void load();
  }, [params.childId, params.surahNum]);

  const load = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data: c } = await supabase
      .from("children")
      .select("*")
      .eq("id", params.childId)
      .maybeSingle();
    if (!c) {
      router.replace("/dashboard");
      return;
    }
    setChild(c as Child);

    const s = await getSurahBySlug(Number(params.surahNum));
    if (!s) {
      router.replace(`/child/${params.childId}/journey`);
      return;
    }
    setSurah(s);

    const [a, st, m, sp, comp] = await Promise.all([
      getAyahs(s.id),
      getStory(s.id),
      getMissions(s.id),
      getSurahSteps(s.id),
      getStepCompletions(params.childId, s.id),
    ]);
    setAyahs(a);
    setStory(st);
    setMissions(m);
    setSteps(sp);
    setCompletions(comp);

    // Resume to first incomplete step
    const completedStepIds = new Set(comp.filter((x) => x.approved_by_mother).map((x) => x.step_id));
    const firstIncomplete = sp.findIndex((step) => !completedStepIds.has(step.id));
    setCurrentIdx(firstIncomplete >= 0 ? firstIncomplete : sp.length);

    setLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-masjid font-bold animate-pulse">جاري التحميل...</div>
      </main>
    );
  }

  if (!surah || !child) return null;

  if (steps.length === 0) {
    return (
      <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
        <header className="flex items-center gap-3 mb-6">
          <Link
            href={`/child/${child.id}/journey`}
            className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center"
          >
            ←
          </Link>
          <h1 className="font-bold text-masjid-dark">{surah.name_arabic}</h1>
        </header>
        <div className="bg-white rounded-3xl p-8 text-center shadow-soft">
          <p className="text-5xl mb-3">🛠️</p>
          <p className="font-bold text-masjid-dark">السورة لسه مش جاهزة</p>
          <p className="text-sm text-masjid-dark/60 mt-2">
            الـ admin لازم يبني الخطوات الـ ٦ في /admin/journey-builder
          </p>
        </div>
      </main>
    );
  }

  if (currentIdx >= steps.length) {
    return (
      <main className="min-h-screen px-5 py-6 max-w-md mx-auto flex flex-col">
        <header className="flex items-center gap-3 mb-6">
          <Link
            href={`/child/${child.id}/journey`}
            className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center"
          >
            ←
          </Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-8xl animate-bounce">🏆</div>
          <h2 className="text-2xl font-bold text-masjid-dark">
            ما شاء الله يا {child.name}!
          </h2>
          <p className="font-quran text-3xl text-masjid">{surah.name_arabic}</p>
          <p className="text-masjid-dark/70">
            خلصت كل خطوات السورة دي ✨
          </p>
          <Link
            href={`/child/${child.id}/journey`}
            className="bg-masjid text-sand font-bold px-8 py-3 rounded-3xl mt-4 active:scale-95"
          >
            للسورة الجاية ←
          </Link>
        </div>
      </main>
    );
  }

  const currentStep = steps[currentIdx];
  const stepCompletionsForCurrent = completions.filter((c) => c.step_id === currentStep.id);
  const alreadyDone = stepCompletionsForCurrent.reduce((sum, c) => sum + c.completion_count, 0);

  const onStepComplete = async () => {
    const needsApproval = currentStep.requires_mother_approval;
    await recordStepCompletion(child.id, currentStep.id, currentStep.xp_reward, needsApproval);
    await upsertProgress(
      child.id,
      surah.id,
      currentIdx + 2, // next step number
      currentIdx + 1 >= steps.length,
    );
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setCurrentIdx(currentIdx + 1);
      void load();
    }, 1500);
  };

  return (
    <main className="min-h-screen px-5 py-5 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-3">
        <Link
          href={`/child/${child.id}/journey`}
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center"
        >
          ←
        </Link>
        <div className="text-center">
          <p className="text-xs text-masjid-dark/60">سورة</p>
          <h1 className="font-quran text-xl text-masjid-dark">{surah.name_arabic}</h1>
        </div>
        <div className="text-right text-xs">
          <p className="text-gold-dark font-bold">⭐ {child.total_xp}</p>
          <p className="text-masjid-dark/60">
            {currentIdx + 1}/{steps.length}
          </p>
        </div>
      </header>

      <div className="flex gap-1 mb-5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              i < currentIdx
                ? "bg-success"
                : i === currentIdx
                  ? "bg-gold"
                  : "bg-sand-dark"
            }`}
          />
        ))}
      </div>

      {showCelebration ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="text-7xl animate-bounce">🎉</div>
          <p className="text-2xl font-bold text-success mt-3">+{currentStep.xp_reward} XP</p>
          <p className="text-masjid-dark mt-2">أحسنت!</p>
        </div>
      ) : (
        <StepRenderer
          step={currentStep}
          ayahs={ayahs}
          story={story}
          missions={missions}
          alreadyDone={alreadyDone}
          onComplete={onStepComplete}
        />
      )}
    </main>
  );
}

function StepRenderer({
  step,
  ayahs,
  story,
  missions,
  alreadyDone,
  onComplete,
}: {
  step: SurahStep;
  ayahs: Ayah[];
  story: SurahStory | null;
  missions: LifeMission[];
  alreadyDone: number;
  onComplete: () => void;
}) {
  switch (step.step_type) {
    case "listen":
      return (
        <ListenStep
          step={step}
          ayahs={ayahs}
          alreadyDone={alreadyDone}
          onComplete={onComplete}
        />
      );
    case "story":
      return <StoryStep story={story} onComplete={onComplete} />;
    case "listen_repeat":
      return (
        <ListenRepeatStep
          step={step}
          ayahs={ayahs}
          alreadyDone={alreadyDone}
          onComplete={onComplete}
        />
      );
    case "recite_to_mom":
      return (
        <MotherApprovalStep
          step={step}
          icon="👩"
          prompt="سمّع السورة كلها لماما من غير ما تبص في المصحف. هي اللي هتقولك صح أو محتاج تتمرن أكتر."
          onComplete={onComplete}
        />
      );
    case "tell_story":
      return (
        <MotherApprovalStep
          step={step}
          icon="🗣️"
          prompt="احكي قصة السورة لماما بأسلوبك. خليها قصة وأنت بطلها 🌟"
          onComplete={onComplete}
        />
      );
    case "life_mission": {
      const mission = missions[0];
      return (
        <MotherApprovalStep
          step={step}
          icon="🎯"
          prompt={
            mission
              ? `${mission.title}\n\n${mission.description}`
              : "نفّذ مهمة من اللي اتفقت عليها مع ماما، وارجع تأكد إنك عملتها."
          }
          onComplete={onComplete}
        />
      );
    }
    case "comprehension":
      return (
        <div className="text-center space-y-3 py-8">
          <p className="text-5xl">❓</p>
          <p className="text-masjid-dark">أسئلة الفهم لسه مش متفعلة</p>
          <button
            onClick={onComplete}
            className="bg-masjid text-sand font-bold px-6 py-3 rounded-2xl"
          >
            تخطّي
          </button>
        </div>
      );
    case "ai_recite":
      return (
        <div className="text-center space-y-3 py-8">
          <p className="text-5xl">🤖</p>
          <p className="text-masjid-dark">التسميع بالذكاء الاصطناعي</p>
          <p className="text-sm text-masjid-dark/60">
            (متاح في الإعدادات المتقدمة)
          </p>
          <button
            onClick={onComplete}
            className="bg-masjid text-sand font-bold px-6 py-3 rounded-2xl"
          >
            تخطّي
          </button>
        </div>
      );
    default:
      return null;
  }
}
