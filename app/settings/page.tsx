"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { storage, type Mother, type Child } from "@/lib/storage";
import { isSupabaseEnabled, signOut, getCurrentSession } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [mother, setMother] = useState<Mother | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const m = storage.getMother();
    if (!m) {
      router.replace("/onboarding");
      return;
    }
    setMother(m);
    setNewName(m.name);
    setChildren(storage.getChildren());
    void getCurrentSession().then((s) => setAuthed(Boolean(s)));
  }, [router]);

  const doSignOut = async () => {
    if (!confirm("هتسجلي خروج؟ بياناتك المحفوظة على السيرفر هتفضل آمنة.")) return;
    await signOut();
    storage.resetAll();
    router.replace("/");
  };

  const saveMotherName = () => {
    if (!newName.trim()) return;
    storage.setMother(newName.trim());
    setMother(storage.getMother());
    setEditing(false);
  };

  const removeChild = (id: string, name: string) => {
    if (!confirm(`متأكدة إنك عايزة تحذفي ${name} وكل بياناته؟`)) return;
    storage.removeChild(id);
    setChildren(storage.getChildren());
  };

  const resetAll = () => {
    if (
      !confirm(
        "هتحذفي كل البيانات (الحساب + الأطفال + الجلسات). هل أنتي متأكدة؟",
      )
    )
      return;
    storage.resetAll();
    router.replace("/");
  };

  if (!mother) return null;

  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <h1 className="font-bold text-masjid-dark">⚙️ الإعدادات</h1>
      </header>

      <Section title="حسابك">
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-masjid/5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-kid-yellow/40 to-gold/30 flex items-center justify-center text-3xl">
              🌙
            </div>
            <div className="flex-1">
              {!editing ? (
                <>
                  <p className="text-xs text-masjid-dark/60">الاسم</p>
                  <h3 className="font-bold text-masjid-dark">{mother.name}</h3>
                </>
              ) : (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-sand border-2 border-masjid/20 rounded-xl px-3 py-2 focus:border-masjid focus:outline-none"
                  autoFocus
                />
              )}
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-xs bg-masjid/10 text-masjid-dark font-bold px-3 py-1.5 rounded-full"
              >
                تعديل
              </button>
            ) : (
              <button
                onClick={saveMotherName}
                className="text-xs bg-masjid text-sand font-bold px-3 py-1.5 rounded-full"
              >
                حفظ
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section title={`الأطفال (${children.length})`}>
        <div className="space-y-2">
          {children.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-soft border border-masjid/5"
            >
              <div className="w-12 h-12 rounded-full bg-kid-sky/20 flex items-center justify-center text-2xl">
                ✨
              </div>
              <div className="flex-1">
                <p className="font-bold text-masjid-dark">{child.name}</p>
                <p className="text-xs text-masjid-dark/60">
                  {child.age} سنين · ⭐ {child.totalXP} XP
                </p>
              </div>
              <button
                onClick={() => removeChild(child.id, child.name)}
                className="w-9 h-9 rounded-full bg-wrong/10 text-wrong flex items-center justify-center"
                aria-label="حذف"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="الإشعارات">
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-masjid/5">
          <p className="text-sm text-masjid-dark/70 leading-relaxed">
            🔔 لما نطلق التطبيق رسمياً، هتقدري تستقبلي إشعار يومي بتقدم طفلك
            وتذكير بالمهمة.
          </p>
          <span className="inline-block mt-2 text-xs bg-gold/20 text-gold-dark font-bold px-2 py-1 rounded-full">
            قريباً
          </span>
        </div>
      </Section>

      <Section title="الاشتراك">
        <div className="bg-gradient-to-br from-gold/30 to-gold/10 rounded-3xl p-5 border border-gold/30">
          <p className="font-bold text-masjid-dark mb-1">🌟 الإصدار التجريبي</p>
          <p className="text-sm text-masjid-dark/70 leading-relaxed">
            دلوقتي بتستخدمي نسخة تجريبية مجانية بالكامل. لما نطلق رسمياً هتفضل
            النسخة الأساسية مجانية إن شاء الله.
          </p>
        </div>
      </Section>

      {isSupabaseEnabled && authed && (
        <Section title="الحساب">
          <div className="bg-success/10 border border-success/30 rounded-3xl p-4 mb-2">
            <p className="text-sm text-success font-bold">
              ☁️ بياناتك متزامنة مع السيرفر
              {mother.email ? ` (${mother.email})` : ""}
            </p>
            <p className="text-xs text-masjid-dark/60 mt-1">
              تقدري تفتحي التطبيق من أي جهاز وتلاقي تقدم طفلك.
            </p>
          </div>
          <button
            onClick={doSignOut}
            className="w-full bg-white border-2 border-wrong/30 text-wrong font-bold py-3 rounded-2xl active:scale-95 transition-transform"
          >
            تسجيل خروج
          </button>
        </Section>
      )}

      <Section title="إدارة البيانات">
        <button
          onClick={resetAll}
          className="w-full bg-wrong/10 text-wrong font-bold py-4 rounded-3xl active:scale-95 transition-transform"
        >
          🗑️ مسح كل البيانات
        </button>
        <p className="text-xs text-masjid-dark/50 text-center mt-2 leading-relaxed">
          {isSupabaseEnabled && authed
            ? "هيتم مسح البيانات من جهازك. لو حابة تحذفي السحابة، اعملي تسجيل خروج الأول."
            : "البيانات محفوظة على جهازك بس (مش على سيرفر). مسحها يحذفها للأبد."}
        </p>
      </Section>

      <p className="text-center text-xs text-masjid-dark/40 mt-8">
        تطبيق نــور · إصدار تجريبي
      </p>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <h2 className="text-xs font-bold text-masjid-dark/70 mb-2 px-1 tracking-widest">
        {title}
      </h2>
      {children}
    </section>
  );
}
