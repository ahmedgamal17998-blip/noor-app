"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { storage, type Mother, type Child } from "@/lib/storage";
import { ChildCard } from "@/components/ChildCard";

export default function DashboardPage() {
  const router = useRouter();
  const [mother, setMother] = useState<Mother | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);

  useEffect(() => {
    const m = storage.getMother();
    if (!m) {
      router.replace("/onboarding");
      return;
    }
    setMother(m);
    setChildren(storage.getChildren());
  }, [router]);

  const refresh = () => setChildren(storage.getChildren());

  if (!mother) return null;

  const todayAyahsByChild = (childId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return storage
      .getSessions(childId)
      .filter(
        (s) =>
          new Date(s.createdAt).toISOString().slice(0, 10) === today &&
          s.isCorrect,
      ).length;
  };

  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-masjid-dark/60">السلام عليكِ</p>
          <h1 className="text-xl font-bold text-masjid-dark">
            {mother.name} 🌙
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/content"
            className="bg-kid-sky/20 text-blue-700 text-xs font-bold px-3 py-2 rounded-full"
          >
            📚 المكتبة
          </Link>
          <Link
            href="/settings"
            className="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
            aria-label="الإعدادات"
          >
            ⚙️
          </Link>
        </div>
      </header>

      <section className="space-y-3 mb-6">
        {children.map((child) => {
          const task = storage.getTodayTask(child.id);
          return (
            <ChildCard
              key={child.id}
              child={child}
              todayAyahs={todayAyahsByChild(child.id)}
              taskConfirmed={task?.isConfirmed ?? false}
            />
          );
        })}

        <button
          onClick={() => setShowAddChild(true)}
          className="w-full bg-sand-dark/40 border-2 border-dashed border-masjid/30 rounded-3xl p-4 text-masjid-dark font-semibold active:scale-[0.98] transition-transform"
        >
          + ضيفي طفل تاني
        </button>
      </section>

      {showAddChild && (
        <AddChildModal
          onClose={() => setShowAddChild(false)}
          onAdded={() => {
            refresh();
            setShowAddChild(false);
          }}
        />
      )}
    </main>
  );
}

function AddChildModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(7);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    storage.addChild(name.trim(), age);
    onAdded();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md bg-sand rounded-t-4xl p-6 space-y-4 animate-in slide-in-from-bottom"
      >
        <h2 className="text-lg font-bold text-masjid-dark">طفل جديد</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم الطفل"
          className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-3 focus:border-masjid focus:outline-none"
          autoFocus
        />
        <div>
          <p className="text-sm font-semibold text-masjid-dark mb-1">
            العمر: {age} سنين
          </p>
          <input
            type="range"
            min={5}
            max={12}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-masjid"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-sand-dark py-3 rounded-2xl font-semibold text-masjid-dark"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 bg-masjid text-sand py-3 rounded-2xl font-bold disabled:opacity-50"
          >
            إضافة
          </button>
        </div>
      </form>
    </div>
  );
}
