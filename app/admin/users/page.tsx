"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Mother, Child } from "@/lib/db/types";

type MotherWithChildren = Mother & { children: Child[] };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<MotherWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("mothers")
      .select("*, children(*)")
      .order("created_at", { ascending: false });
    setUsers((data ?? []) as MotherWithChildren[]);
    setLoading(false);
  };

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.email?.toLowerCase().includes(search.toLowerCase()) ||
          u.full_name?.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-masjid-dark">👥 المستخدمين</h1>
        <p className="text-sm text-masjid-dark/60">{users.length} أم مسجلة</p>
      </header>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 ابحث بالإيميل أو الاسم"
        className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-3 focus:border-masjid focus:outline-none"
      />

      {loading ? (
        <p className="text-masjid-dark/60">جاري التحميل...</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-2xl p-4 shadow-soft border border-masjid/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-masjid-dark">
                    {u.full_name || "بدون اسم"}
                  </p>
                  <p className="text-xs text-masjid-dark/60">{u.email}</p>
                  <p className="text-xs text-masjid-dark/50 mt-1">
                    {u.children.length} طفل · خطة {u.subscription_plan} ·{" "}
                    {u.subscription_status}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    u.subscription_status === "active"
                      ? "bg-success/20 text-success"
                      : "bg-gold/20 text-gold-dark"
                  }`}
                >
                  {u.subscription_status === "active" ? "نشط" : "تجريبي"}
                </span>
              </div>
              {u.children.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {u.children.map((c) => (
                    <span
                      key={c.id}
                      className="text-xs bg-sand px-2 py-1 rounded-full text-masjid-dark"
                    >
                      {c.name} ({c.age}) · ⭐ {c.total_xp}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-masjid-dark/60 py-8">
              مفيش نتائج
            </p>
          )}
        </div>
      )}
    </div>
  );
}
