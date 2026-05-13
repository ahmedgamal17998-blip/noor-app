"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CommunityPost } from "@/lib/db/types";

type Post = CommunityPost & { mothers: { full_name: string | null; email: string } | null };

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"all" | "hidden" | "pinned">("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    let q = supabase
      .from("community_posts")
      .select("*, mothers(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (filter === "hidden") q = q.eq("is_hidden", true);
    if (filter === "pinned") q = q.eq("is_pinned", true);
    const { data } = await q;
    setPosts((data ?? []) as Post[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [filter]);

  const toggleHide = async (id: string, hidden: boolean) => {
    if (!supabase) return;
    await supabase.from("community_posts").update({ is_hidden: !hidden }).eq("id", id);
    void load();
  };

  const togglePin = async (id: string, pinned: boolean) => {
    if (!supabase) return;
    await supabase.from("community_posts").update({ is_pinned: !pinned }).eq("id", id);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف نهائي للبوست والتعليقات؟")) return;
    if (!supabase) return;
    await supabase.from("community_posts").delete().eq("id", id);
    void load();
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-masjid-dark">💬 إدارة المجتمع</h1>
        <p className="text-sm text-masjid-dark/60">مراجعة البوستات والتعليقات</p>
      </header>

      <div className="flex gap-2">
        {(["all", "hidden", "pinned"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm font-bold px-3 py-1.5 rounded-full ${
              filter === f
                ? "bg-masjid text-sand"
                : "bg-white text-masjid-dark border border-masjid/10"
            }`}
          >
            {f === "all" ? "الكل" : f === "hidden" ? "المخفية" : "المثبتة"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-masjid-dark/60">جاري التحميل...</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-4 shadow-soft border ${
                p.is_hidden ? "border-wrong/30 opacity-70" : "border-masjid/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="text-xs text-masjid-dark/60">
                  <span className="font-bold text-masjid-dark">
                    {p.mothers?.full_name || p.mothers?.email || "أم"}
                  </span>
                  {" · "}
                  {new Date(p.created_at).toLocaleString("ar-EG")}
                  {" · "}
                  <span className="bg-sand-dark/40 px-2 py-0.5 rounded-full ml-1">
                    {p.category}
                  </span>
                </div>
                <span className="text-xs">
                  ❤️ {p.likes_count}
                  {p.is_pinned && " 📌"}
                  {p.is_hidden && " 🚫"}
                </span>
              </div>
              <p className="text-sm text-masjid-dark whitespace-pre-wrap">{p.content}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => toggleHide(p.id, p.is_hidden)}
                  className={`text-xs font-bold px-3 py-1 rounded-xl ${
                    p.is_hidden
                      ? "bg-success/20 text-success"
                      : "bg-wrong/20 text-wrong"
                  }`}
                >
                  {p.is_hidden ? "إظهار" : "إخفاء"}
                </button>
                <button
                  onClick={() => togglePin(p.id, p.is_pinned)}
                  className="text-xs font-bold px-3 py-1 rounded-xl bg-gold/20 text-gold-dark"
                >
                  {p.is_pinned ? "إلغاء التثبيت" : "تثبيت"}
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="text-xs font-bold px-3 py-1 rounded-xl bg-wrong text-white ml-auto"
                >
                  حذف نهائي
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-center text-masjid-dark/60 py-8">مفيش بوستات</p>
          )}
        </div>
      )}
    </div>
  );
}
