"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  Surah,
  Ayah,
  SurahStory,
  LifeMission,
  SurahStep,
  ComprehensionQuestion,
  StepType,
} from "@/lib/db/types";
import { VideoUpload } from "@/components/admin/VideoUpload";

type Tab = "info" | "ayahs" | "story" | "missions" | "questions" | "steps";

export default function SurahEditorPage() {
  const params = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("info");
  const [surah, setSurah] = useState<Surah | null>(null);

  useEffect(() => {
    if (!supabase) return;
    void supabase
      .from("surahs")
      .select("*")
      .eq("id", params.id)
      .maybeSingle()
      .then(({ data }) => setSurah(data as Surah | null));
  }, [params.id]);

  if (!surah) {
    return <p className="text-masjid-dark/60">جاري التحميل...</p>;
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link
          href="/admin/surahs"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center"
        >
          →
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-quran text-masjid-dark">
            {surah.name_arabic}
          </h1>
          <p className="text-xs text-masjid-dark/60">
            سورة #{surah.surah_number} · {surah.total_ayahs} آية · ترتيب{" "}
            {surah.level_order}
          </p>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto pb-1">
        {(
          [
            ["info", "📝 المعلومات"],
            ["ayahs", "📜 الآيات"],
            ["story", "📖 القصة"],
            ["missions", "🎯 المهام"],
            ["questions", "❓ الأسئلة"],
            ["steps", "🗺️ الخطوات"],
          ] as Array<[Tab, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-sm font-bold px-3 py-2 rounded-xl whitespace-nowrap ${
              tab === key
                ? "bg-masjid text-sand"
                : "bg-white text-masjid-dark border border-masjid/10"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="bg-white rounded-3xl p-5 shadow-soft border border-masjid/5">
        {tab === "info" && <InfoTab surah={surah} onUpdate={setSurah} />}
        {tab === "ayahs" && <AyahsTab surahId={surah.id} surahNumber={surah.surah_number} />}
        {tab === "story" && <StoryTab surahId={surah.id} />}
        {tab === "missions" && <MissionsTab surahId={surah.id} />}
        {tab === "questions" && <QuestionsTab surahId={surah.id} />}
        {tab === "steps" && <StepsTab surahId={surah.id} />}
      </div>
    </div>
  );
}

// ──────── INFO ────────
function InfoTab({ surah, onUpdate }: { surah: Surah; onUpdate: (s: Surah) => void }) {
  const [form, setForm] = useState({
    name_arabic: surah.name_arabic,
    name_english: surah.name_english ?? "",
    total_ayahs: String(surah.total_ayahs),
    level_order: String(surah.level_order),
    revelation_type: (surah.revelation_type ?? "meccan") as "meccan" | "medinan",
    required_plan: surah.required_plan as "basic" | "premium",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!supabase) return;
    setSaving(true);
    const { data } = await supabase
      .from("surahs")
      .update({
        name_arabic: form.name_arabic,
        name_english: form.name_english || null,
        total_ayahs: Number(form.total_ayahs),
        level_order: Number(form.level_order),
        revelation_type: form.revelation_type,
        required_plan: form.required_plan,
      })
      .eq("id", surah.id)
      .select()
      .maybeSingle();
    setSaving(false);
    if (data) onUpdate(data as Surah);
  };

  return (
    <div className="space-y-3">
      <Field label="الاسم بالعربي" value={form.name_arabic} onChange={(v) => setForm({ ...form, name_arabic: v })} />
      <Field label="الاسم بالإنجليزي" value={form.name_english} onChange={(v) => setForm({ ...form, name_english: v })} />
      <Field label="عدد الآيات" value={form.total_ayahs} onChange={(v) => setForm({ ...form, total_ayahs: v })} type="number" />
      <Field label="ترتيب الظهور" value={form.level_order} onChange={(v) => setForm({ ...form, level_order: v })} type="number" />
      <div>
        <label className="text-xs font-semibold text-masjid-dark/70">نوع النزول</label>
        <select
          value={form.revelation_type}
          onChange={(e) =>
            setForm({
              ...form,
              revelation_type: e.target.value as "meccan" | "medinan",
            })
          }
          className="w-full bg-sand border-2 border-masjid/10 rounded-xl px-3 py-2 mt-1"
        >
          <option value="meccan">مكية</option>
          <option value="medinan">مدنية</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-masjid-dark/70">الخطة المطلوبة</label>
        <select
          value={form.required_plan}
          onChange={(e) =>
            setForm({
              ...form,
              required_plan: e.target.value as "basic" | "premium",
            })
          }
          className="w-full bg-sand border-2 border-masjid/10 rounded-xl px-3 py-2 mt-1"
        >
          <option value="basic">أساسية (مجانية)</option>
          <option value="premium">بريميوم</option>
        </select>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="bg-masjid text-sand font-bold px-5 py-2 rounded-2xl disabled:opacity-50"
      >
        {saving ? "..." : "حفظ"}
      </button>
    </div>
  );
}

// ──────── AYAHS ────────
function AyahsTab({ surahId, surahNumber }: { surahId: string; surahNumber: number }) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("ayahs")
      .select("*")
      .eq("surah_id", surahId)
      .order("ayah_number");
    setAyahs((data ?? []) as Ayah[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [surahId]);

  const importFromAlQuran = async () => {
    if (!supabase) return;
    setImporting(true);
    try {
      const [plain, tashkeel] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.muyassar`).then((r) =>
          r.json(),
        ),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`).then((r) =>
          r.json(),
        ),
      ]);
      const plainAyahs = plain.data.ayahs as Array<{
        number: number;
        numberInSurah: number;
        text: string;
      }>;
      const tashkeelAyahs = tashkeel.data.ayahs as Array<{
        numberInSurah: number;
        text: string;
      }>;
      const inserts = plainAyahs.map((a, i) => ({
        surah_id: surahId,
        ayah_number: a.numberInSurah,
        text_arabic: a.text,
        text_with_tashkeel: tashkeelAyahs[i]?.text ?? a.text,
        audio_url: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${a.number}.mp3`,
      }));
      await supabase.from("ayahs").upsert(inserts, { onConflict: "surah_id,ayah_number" });
      await load();
    } catch (e) {
      alert("فشل الاستيراد: " + (e instanceof Error ? e.message : "غير معروف"));
    }
    setImporting(false);
  };

  if (loading) return <p className="text-masjid-dark/60">جاري التحميل...</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-masjid-dark/70">{ayahs.length} آية مسجلة</p>
        <button
          onClick={importFromAlQuran}
          disabled={importing}
          className="bg-gold text-white text-sm font-bold px-4 py-2 rounded-2xl disabled:opacity-50"
        >
          {importing ? "بنحمّل..." : "🌐 استيراد من alquran.cloud"}
        </button>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {ayahs.map((a) => (
          <div
            key={a.id}
            className="bg-sand rounded-2xl p-3 border border-masjid/5"
          >
            <p className="text-xs text-masjid-dark/60">آية {a.ayah_number}</p>
            <p dir="rtl" className="font-quran text-lg leading-loose text-masjid-dark">
              {a.text_with_tashkeel}
            </p>
          </div>
        ))}
        {ayahs.length === 0 && (
          <p className="text-center text-masjid-dark/60 py-8">
            ضغطي &quot;استيراد&quot; علشان نجيب الآيات من alquran.cloud تلقائياً.
          </p>
        )}
      </div>
    </div>
  );
}

// ──────── STORY ────────
function StoryTab({ surahId }: { surahId: string }) {
  const [story, setStory] = useState<SurahStory | null>(null);
  const [form, setForm] = useState({
    title: "",
    story_text: "",
    reason_of_revelation: "",
    meaning_simplified: "",
    story_image_url: "",
    story_audio_url: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase
      .from("surah_stories")
      .select("*")
      .eq("surah_id", surahId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setStory(data as SurahStory);
          setForm({
            title: data.title ?? "",
            story_text: data.story_text ?? "",
            reason_of_revelation: data.reason_of_revelation ?? "",
            meaning_simplified: data.meaning_simplified ?? "",
            story_image_url: data.story_image_url ?? "",
            story_audio_url: data.story_audio_url ?? "",
          });
        }
      });
  }, [surahId]);

  const save = async () => {
    if (!supabase) return;
    setSaving(true);
    const payload = {
      surah_id: surahId,
      ...form,
      reason_of_revelation: form.reason_of_revelation || null,
      meaning_simplified: form.meaning_simplified || null,
      story_image_url: form.story_image_url || null,
      story_audio_url: form.story_audio_url || null,
    };
    if (story) {
      await supabase.from("surah_stories").update(payload).eq("id", story.id);
    } else {
      const { data } = await supabase
        .from("surah_stories")
        .insert(payload)
        .select()
        .maybeSingle();
      if (data) setStory(data as SurahStory);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <Field label="عنوان القصة" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <TextArea
        label="نص القصة"
        value={form.story_text}
        onChange={(v) => setForm({ ...form, story_text: v })}
        rows={6}
      />
      <TextArea
        label="سبب النزول (اختياري)"
        value={form.reason_of_revelation}
        onChange={(v) => setForm({ ...form, reason_of_revelation: v })}
        rows={3}
      />
      <TextArea
        label="المعنى المبسط للأطفال"
        value={form.meaning_simplified}
        onChange={(v) => setForm({ ...form, meaning_simplified: v })}
        rows={3}
      />
      <Field
        label="رابط الصورة (URL)"
        value={form.story_image_url}
        onChange={(v) => setForm({ ...form, story_image_url: v })}
      />
      <Field
        label="رابط الصوت (Voice-over)"
        value={form.story_audio_url}
        onChange={(v) => setForm({ ...form, story_audio_url: v })}
      />
      <button
        onClick={save}
        disabled={saving || !form.title || !form.story_text}
        className="bg-masjid text-sand font-bold px-5 py-2 rounded-2xl disabled:opacity-50"
      >
        {saving ? "..." : story ? "تحديث" : "حفظ"}
      </button>
    </div>
  );
}

// ──────── MISSIONS ────────
function MissionsTab({ surahId }: { surahId: string }) {
  const [missions, setMissions] = useState<LifeMission[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", xp_reward: "10" });

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("life_missions")
      .select("*")
      .eq("surah_id", surahId)
      .order("display_order");
    setMissions((data ?? []) as LifeMission[]);
  };

  useEffect(() => {
    void load();
  }, [surahId]);

  const add = async () => {
    if (!supabase || !draft.title) return;
    await supabase.from("life_missions").insert({
      surah_id: surahId,
      title: draft.title,
      description: draft.description,
      xp_reward: Number(draft.xp_reward),
      display_order: missions.length,
    });
    setDraft({ title: "", description: "", xp_reward: "10" });
    setAdding(false);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("احذف المهمة؟")) return;
    if (!supabase) return;
    await supabase.from("life_missions").delete().eq("id", id);
    void load();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-masjid-dark/70">{missions.length} مهمة</p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="bg-masjid text-sand text-sm font-bold px-3 py-1.5 rounded-xl"
          >
            + مهمة
          </button>
        )}
      </div>

      {adding && (
        <div className="bg-sand-dark/30 rounded-2xl p-3 space-y-2 border border-masjid/10">
          <Field label="عنوان المهمة" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
          <TextArea
            label="الوصف"
            value={draft.description}
            onChange={(v) => setDraft({ ...draft, description: v })}
            rows={3}
          />
          <Field label="نقاط XP" type="number" value={draft.xp_reward} onChange={(v) => setDraft({ ...draft, xp_reward: v })} />
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 bg-sand-dark py-2 rounded-xl text-sm">
              إلغاء
            </button>
            <button onClick={add} className="flex-1 bg-masjid text-sand py-2 rounded-xl text-sm font-bold">
              إضافة
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {missions.map((m) => (
          <div
            key={m.id}
            className="bg-sand rounded-2xl p-3 border border-masjid/5 flex items-start gap-3"
          >
            <div className="flex-1">
              <p className="font-bold text-masjid-dark">{m.title}</p>
              <p className="text-xs text-masjid-dark/70 mt-1">{m.description}</p>
              <p className="text-xs text-gold-dark mt-1">⭐ {m.xp_reward} XP</p>
            </div>
            <button onClick={() => remove(m.id)} className="text-wrong text-sm">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────── QUESTIONS ────────
function QuestionsTab({ surahId }: { surahId: string }) {
  const [qs, setQs] = useState<ComprehensionQuestion[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ question_text: "", correct_answer: "" });

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("comprehension_questions")
      .select("*")
      .eq("surah_id", surahId);
    setQs((data ?? []) as ComprehensionQuestion[]);
  };

  useEffect(() => {
    void load();
  }, [surahId]);

  const add = async () => {
    if (!supabase || !draft.question_text || !draft.correct_answer) return;
    await supabase.from("comprehension_questions").insert({
      surah_id: surahId,
      question_text: draft.question_text,
      correct_answer: draft.correct_answer,
    });
    setDraft({ question_text: "", correct_answer: "" });
    setAdding(false);
    void load();
  };

  const remove = async (id: string) => {
    if (!supabase) return;
    await supabase.from("comprehension_questions").delete().eq("id", id);
    void load();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-masjid-dark/70">{qs.length} سؤال</p>
        {!adding && (
          <button onClick={() => setAdding(true)} className="bg-masjid text-sand text-sm font-bold px-3 py-1.5 rounded-xl">
            + سؤال
          </button>
        )}
      </div>

      {adding && (
        <div className="bg-sand-dark/30 rounded-2xl p-3 space-y-2">
          <Field label="السؤال" value={draft.question_text} onChange={(v) => setDraft({ ...draft, question_text: v })} />
          <Field label="الإجابة الصحيحة" value={draft.correct_answer} onChange={(v) => setDraft({ ...draft, correct_answer: v })} />
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 bg-sand-dark py-2 rounded-xl text-sm">إلغاء</button>
            <button onClick={add} className="flex-1 bg-masjid text-sand py-2 rounded-xl text-sm font-bold">إضافة</button>
          </div>
        </div>
      )}

      {qs.map((q) => (
        <div key={q.id} className="bg-sand rounded-2xl p-3 flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold text-masjid-dark">س: {q.question_text}</p>
            <p className="text-xs text-success mt-1">ج: {q.correct_answer}</p>
          </div>
          <button onClick={() => remove(q.id)} className="text-wrong text-sm">🗑️</button>
        </div>
      ))}
    </div>
  );
}

// ──────── STEPS ────────
const STEP_TYPES: Array<{ type: StepType; label: string; defaultTitle: string }> = [
  { type: "listen", label: "🔊 استماع", defaultTitle: "استمع للسورة" },
  { type: "story", label: "📖 القصة", defaultTitle: "القصة" },
  { type: "listen_repeat", label: "🎤 استماع + ترديد", defaultTitle: "اسمع وردد" },
  { type: "recite_to_mom", label: "👩 تسميع لماما", defaultTitle: "سمّع لماما" },
  { type: "tell_story", label: "🗣️ احكي القصة", defaultTitle: "احكي القصة لماما" },
  { type: "life_mission", label: "🎯 مهمة الحياة", defaultTitle: "مهمة عملية" },
  { type: "comprehension", label: "❓ أسئلة فهم", defaultTitle: "اختبر فهمك" },
  { type: "ai_recite", label: "🤖 تسميع بالذكاء الاصطناعي", defaultTitle: "اقرأ مع AI" },
];

function StepsTab({ surahId }: { surahId: string }) {
  const [steps, setSteps] = useState<SurahStep[]>([]);
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("surah_steps")
      .select("*")
      .eq("surah_id", surahId)
      .order("display_order");
    setSteps((data ?? []) as SurahStep[]);
  };

  useEffect(() => {
    void load();
  }, [surahId]);

  const remove = async (id: string) => {
    if (!confirm("احذف الخطوة؟")) return;
    if (!supabase) return;
    await supabase.from("surah_steps").delete().eq("id", id);
    void load();
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = steps.findIndex((s) => s.id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= steps.length) return;
    if (!supabase) return;
    const a = steps[idx];
    const b = steps[swapIdx];
    await Promise.all([
      supabase.from("surah_steps").update({ display_order: b.display_order }).eq("id", a.id),
      supabase.from("surah_steps").update({ display_order: a.display_order }).eq("id", b.id),
    ]);
    void load();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-masjid-dark/70">{steps.length} خطوة</p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="bg-masjid text-sand text-sm font-bold px-3 py-1.5 rounded-xl"
          >
            + خطوة
          </button>
        )}
      </div>

      {adding && (
        <AddStepForm
          surahId={surahId}
          nextOrder={steps.length + 1}
          onAdd={() => {
            setAdding(false);
            void load();
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="space-y-2">
        {steps.map((s, i) => {
          const meta = STEP_TYPES.find((t) => t.type === s.step_type);
          const expanded = expandedId === s.id;
          return (
            <div
              key={s.id}
              className="bg-sand rounded-2xl border border-masjid/5"
            >
              <div className="flex items-start gap-3 p-3">
                <div className="flex flex-col gap-1">
                  <button
                    disabled={i === 0}
                    onClick={() => move(s.id, -1)}
                    className="text-xs disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <span className="text-xs text-masjid-dark/50 text-center">{i + 1}</span>
                  <button
                    disabled={i === steps.length - 1}
                    onClick={() => move(s.id, 1)}
                    className="text-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-masjid-dark">
                    {meta?.label} — {s.step_title}
                  </p>
                  {s.step_description && (
                    <p className="text-xs text-masjid-dark/70 mt-1">{s.step_description}</p>
                  )}
                  <p className="text-xs text-masjid-dark/60 mt-1">
                    ⭐ {s.xp_reward} XP · يحتاج {s.required_completion_count}×
                    {s.requires_mother_approval && " · يتطلب تأكيد ماما 🔐"}
                    {s.video_url && " · 📹 فيديو"}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setExpandedId(expanded ? null : s.id)}
                    className="bg-masjid/10 text-masjid-dark text-xs font-bold px-2 py-1 rounded"
                  >
                    {expanded ? "إخفاء" : "تعديل"}
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    className="text-wrong text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {expanded && (
                <EditStepForm
                  step={s}
                  onSaved={() => {
                    setExpandedId(null);
                    void load();
                  }}
                />
              )}
            </div>
          );
        })}
        {steps.length === 0 && (
          <p className="text-center text-masjid-dark/60 py-6">
            مفيش خطوات. ابني الـ ٦ خطوات الأساسية: استماع → قصة → ترديد → تسميع لماما →
            احكي القصة → مهمة.
          </p>
        )}
      </div>
    </div>
  );
}

function AddStepForm({
  surahId,
  nextOrder,
  onAdd,
  onCancel,
}: {
  surahId: string;
  nextOrder: number;
  onAdd: () => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<StepType>("listen");
  const [title, setTitle] = useState(STEP_TYPES[0].defaultTitle);
  const [desc, setDesc] = useState("");
  const [count, setCount] = useState("3");
  const [xp, setXp] = useState("10");
  const [needsApproval, setNeedsApproval] = useState(false);

  const submit = async () => {
    if (!supabase) return;
    await supabase.from("surah_steps").insert({
      surah_id: surahId,
      step_number: nextOrder,
      step_type: type,
      step_title: title,
      step_description: desc || null,
      required_completion_count: Number(count),
      xp_reward: Number(xp),
      requires_mother_approval: needsApproval,
      display_order: nextOrder,
    });
    onAdd();
  };

  const onTypeChange = (t: StepType) => {
    setType(t);
    const meta = STEP_TYPES.find((s) => s.type === t);
    if (meta) setTitle(meta.defaultTitle);
    // Auto-set defaults based on type
    if (t === "recite_to_mom" || t === "tell_story" || t === "life_mission") {
      setNeedsApproval(true);
    } else {
      setNeedsApproval(false);
    }
  };

  return (
    <div className="bg-sand-dark/30 rounded-2xl p-3 space-y-2 border border-masjid/10">
      <div>
        <label className="text-xs font-semibold text-masjid-dark/70">نوع الخطوة</label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as StepType)}
          className="w-full bg-white border-2 border-masjid/10 rounded-xl px-3 py-2 mt-1"
        >
          {STEP_TYPES.map((t) => (
            <option key={t.type} value={t.type}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <Field label="العنوان" value={title} onChange={setTitle} />
      <TextArea label="الوصف (اختياري)" value={desc} onChange={setDesc} rows={2} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="عدد المرات" type="number" value={count} onChange={setCount} />
        <Field label="نقاط XP" type="number" value={xp} onChange={setXp} />
      </div>
      <label className="flex items-center gap-2 text-sm text-masjid-dark">
        <input
          type="checkbox"
          checked={needsApproval}
          onChange={(e) => setNeedsApproval(e.target.checked)}
          className="accent-masjid"
        />
        يحتاج تأكيد ماما (كلمة السر)
      </label>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 bg-sand-dark py-2 rounded-xl text-sm">
          إلغاء
        </button>
        <button onClick={submit} className="flex-1 bg-masjid text-sand py-2 rounded-xl text-sm font-bold">
          إضافة الخطوة
        </button>
      </div>
    </div>
  );
}

function EditStepForm({
  step,
  onSaved,
}: {
  step: SurahStep;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(step.step_title);
  const [desc, setDesc] = useState(step.step_description ?? "");
  const [count, setCount] = useState(String(step.required_completion_count));
  const [xp, setXp] = useState(String(step.xp_reward));
  const [needsApproval, setNeedsApproval] = useState(step.requires_mother_approval);
  const [videoUrl, setVideoUrl] = useState<string | null>(step.video_url);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!supabase) return;
    setSaving(true);
    await supabase
      .from("surah_steps")
      .update({
        step_title: title,
        step_description: desc || null,
        required_completion_count: Number(count),
        xp_reward: Number(xp),
        requires_mother_approval: needsApproval,
        video_url: videoUrl,
      })
      .eq("id", step.id);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="border-t border-masjid/10 p-3 space-y-2 bg-white/50">
      <Field label="العنوان" value={title} onChange={setTitle} />
      <TextArea label="الوصف" value={desc} onChange={setDesc} rows={2} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="عدد المرات" type="number" value={count} onChange={setCount} />
        <Field label="نقاط XP" type="number" value={xp} onChange={setXp} />
      </div>
      <label className="flex items-center gap-2 text-sm text-masjid-dark">
        <input
          type="checkbox"
          checked={needsApproval}
          onChange={(e) => setNeedsApproval(e.target.checked)}
          className="accent-masjid"
        />
        يحتاج تأكيد ماما (كلمة السر)
      </label>

      <div>
        <label className="text-xs font-semibold text-masjid-dark/70 block mb-1">
          📹 فيديو الخطوة (اختياري)
        </label>
        <VideoUpload currentUrl={videoUrl} onUploaded={setVideoUrl} />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-masjid text-sand py-2 rounded-xl text-sm font-bold disabled:opacity-50"
      >
        {saving ? "بنحفظ..." : "💾 حفظ التعديلات"}
      </button>
    </div>
  );
}

// ──────── Helpers ────────
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-masjid-dark/70">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border-2 border-masjid/10 rounded-xl px-3 py-2 focus:border-masjid focus:outline-none mt-1"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-masjid-dark/70">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-white border-2 border-masjid/10 rounded-xl px-3 py-2 focus:border-masjid focus:outline-none mt-1 resize-y"
      />
    </div>
  );
}
