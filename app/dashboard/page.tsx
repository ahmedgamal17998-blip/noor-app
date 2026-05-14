"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, getCurrentSession } from "@/lib/supabase";
import { storage, type Child as LocalChild } from "@/lib/storage";
import type { Mother, Child } from "@/lib/db/types";
import { ChildCard } from "@/components/ChildCard";

type DisplayChild = {
  id: string;
  name: string;
  age: number;
  totalXP: number;
  createdAt: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [motherName, setMotherName] = useState<string>("");
  const [children, setChildren] = useState<DisplayChild[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    // Cloud-first
    if (supabase) {
      const session = await getCurrentSession();
      if (session) {
        // Ensure a mother row exists for this user (admins/owners may not have one)
        let { data: motherData } = await supabase
          .from("mothers")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!motherData) {
          // Auto-create mother row from session email
          const localM = storage.getMother();
          const fullName =
            localM?.name ??
            (session.user.email?.split("@")[0] ?? "Mother");
          await supabase.from("mothers").upsert({
            id: session.user.id,
            email: session.user.email,
            name: fullName,
            full_name: fullName,
          });
          const refetch = await supabase
            .from("mothers")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          motherData = refetch.data;
        }

        // Auto-migrate any localStorage children to Supabase (one-time)
        const localChildren = storage.getChildren();
        if (localChildren.length > 0) {
          const { data: existing } = await supabase
            .from("children")
            .select("name")
            .eq("mother_id", session.user.id);
          const existingNames = new Set(
            ((existing ?? []) as Array<{ name: string }>).map((c) => c.name),
          );
          const toMigrate = localChildren.filter(
            (c) => !existingNames.has(c.name),
          );
          if (toMigrate.length > 0) {
            await supabase.from("children").insert(
              toMigrate.map((c) => ({
                mother_id: session.user.id,
                name: c.name,
                age: c.age,
                total_xp: c.totalXP ?? 0,
              })),
            );
          }
          // Clear localStorage children so we don't migrate again
          storage.setChildren([]);
        }

        // Now fetch fresh children
        const { data: childrenData } = await supabase
          .from("children")
          .select("*")
          .eq("mother_id", session.user.id)
          .order("created_at");

        const mother = motherData as Mother | null;
        setMotherName(
          mother?.full_name || mother?.email || session.user.email || "أم",
        );
        setChildren(
          ((childrenData ?? []) as Child[]).map((c) => ({
            id: c.id,
            name: c.name,
            age: c.age,
            totalXP: c.total_xp ?? 0,
            createdAt: new Date(c.created_at).getTime(),
          })),
        );
        setLoading(false);
        return;
      }
    }
    // Fallback to localStorage (v1, when Supabase not configured)
    const m = storage.getMother();
    if (!m) {
      router.replace("/login");
      return;
    }
    setMotherName(m.name);
    setChildren(
      storage.getChildren().map((c: LocalChild) => ({
        id: c.id,
        name: c.name,
        age: c.age,
        totalXP: c.totalXP,
        createdAt: c.createdAt,
      })),
    );
    setLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-masjid font-bold animate-pulse">جاري التحميل...</div>
      </main>
    );
  }

  const todayAyahsByChild = (childId: string) => {
    // Local fallback only
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
          <h1 className="text-xl font-bold text-masjid-dark">{motherName} 🌙</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/community"
            className="bg-gold/20 text-gold-dark text-xs font-bold px-3 py-2 rounded-full"
          >
            💬 المجتمع
          </Link>
          <Link
            href="/content"
            className="bg-kid-sky/20 text-blue-700 text-xs font-bold px-3 py-2 rounded-full"
          >
            📚 المكتبة
          </Link>
          <Link
            href="/settings"
            className="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
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
              child={{ ...child }}
              todayAyahs={todayAyahsByChild(child.id)}
              taskConfirmed={task?.isConfirmed ?? false}
            />
          );
        })}

        {children.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-soft border border-masjid/5">
            <p className="text-5xl mb-3">👶</p>
            <p className="font-bold text-masjid-dark">لسه ما ضفتيش طفل</p>
            <p className="text-sm text-masjid-dark/60 mt-2">
              ابدئي بإضافة أول طفل علشان تبدئي الرحلة
            </p>
          </div>
        )}

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
            setShowAddChild(false);
            void load();
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
  const [gender, setGender] = useState("boy");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    if (supabase) {
      const session = await getCurrentSession();
      if (session) {
        await supabase.from("children").insert({
          mother_id: session.user.id,
          name: name.trim(),
          age,
          gender,
        });
        setBusy(false);
        onAdded();
        return;
      }
    }
    // Local fallback
    storage.addChild(name.trim(), age);
    setBusy(false);
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
        className="w-full max-w-md bg-sand rounded-t-4xl p-6 space-y-4"
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
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "boy", label: "👦 ولد" },
            { v: "girl", label: "👧 بنت" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setGender(o.v)}
              className={`py-3 rounded-2xl font-bold ${
                gender === o.v
                  ? "bg-masjid text-sand"
                  : "bg-white border-2 border-masjid/10 text-masjid-dark"
              }`}
            >
              {o.label}
            </button>
          ))}
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
            disabled={!name.trim() || busy}
            className="flex-1 bg-masjid text-sand py-3 rounded-2xl font-bold disabled:opacity-50"
          >
            {busy ? "..." : "إضافة"}
          </button>
        </div>
      </form>
    </div>
  );
}
