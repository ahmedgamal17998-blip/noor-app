"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getAvatarItems,
  getChildAvatarItems,
  purchaseAvatarItem,
} from "@/lib/db/queries";
import type { AvatarItem, ChildAvatarItem, Child } from "@/lib/db/types";
import { feedbackSuccess, feedbackError } from "@/lib/feedback";

export default function AvatarPage() {
  const router = useRouter();
  const params = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [items, setItems] = useState<AvatarItem[]>([]);
  const [owned, setOwned] = useState<ChildAvatarItem[]>([]);
  const [filter, setFilter] = useState<AvatarItem["item_type"] | "all">("all");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [params.childId]);

  const load = async () => {
    if (!supabase) return;
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
    const [allItems, ownedItems] = await Promise.all([
      getAvatarItems(),
      getChildAvatarItems(params.childId),
    ]);
    setItems(allItems);
    setOwned(ownedItems);
  };

  if (!child) {
    return <p className="text-masjid-dark/60 p-5">جاري التحميل...</p>;
  }

  const ownedIds = new Set(owned.map((o) => o.item_id));
  const filtered =
    filter === "all" ? items : items.filter((i) => i.item_type === filter);

  const buy = async (item: AvatarItem) => {
    if (ownedIds.has(item.id)) return;
    const res = await purchaseAvatarItem(child.id, item.id, item.xp_cost);
    if (res.ok) {
      feedbackSuccess();
      setMsg(`✓ اشتريت ${item.item_name}!`);
      setTimeout(() => setMsg(null), 2000);
      void load();
    } else {
      feedbackError();
      setMsg(res.error ?? "حصلت مشكلة");
      setTimeout(() => setMsg(null), 2000);
    }
  };

  return (
    <main className="min-h-screen px-5 py-5 max-w-md mx-auto">
      <header className="flex items-center justify-between mb-4">
        <Link
          href={`/child/${child.id}/journey`}
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-masjid-dark">🎨 متجر الأفاتار</h1>
          <p className="text-xs text-gold-dark font-bold">⭐ {child.total_xp} XP</p>
        </div>
        <div className="w-10" />
      </header>

      <nav className="flex gap-1 overflow-x-auto mb-4 pb-1">
        {[
          { v: "all", label: "الكل" },
          { v: "head", label: "🧕 رأس" },
          { v: "body", label: "👗 جسم" },
          { v: "accessory", label: "✨ إكسسوار" },
          { v: "background", label: "🌅 خلفية" },
        ].map((c) => (
          <button
            key={c.v}
            onClick={() => setFilter(c.v as typeof filter)}
            className={`text-xs font-bold px-3 py-2 rounded-full whitespace-nowrap ${
              filter === c.v
                ? "bg-masjid text-sand"
                : "bg-white text-masjid-dark border border-masjid/10"
            }`}
          >
            {c.label}
          </button>
        ))}
      </nav>

      {msg && (
        <div className="bg-success/20 text-success font-bold p-3 rounded-2xl text-center mb-3">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((it) => {
          const isOwned = ownedIds.has(it.id);
          const canAfford = (child.total_xp ?? 0) >= it.xp_cost;
          return (
            <div
              key={it.id}
              className={`bg-white rounded-2xl p-3 shadow-soft border ${
                isOwned ? "border-success/40 bg-success/5" : "border-masjid/5"
              }`}
            >
              <div className="aspect-square bg-sand rounded-xl flex items-center justify-center text-5xl mb-2">
                {it.item_image_url.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.item_image_url} alt={it.item_name} className="w-full h-full object-contain" />
                ) : (
                  it.item_image_url
                )}
              </div>
              <p className="font-bold text-sm text-masjid-dark text-center">
                {it.item_name}
              </p>
              {isOwned ? (
                <p className="text-xs text-success text-center font-bold mt-1">
                  ✓ متاح
                </p>
              ) : (
                <button
                  onClick={() => buy(it)}
                  disabled={!canAfford}
                  className={`w-full mt-2 text-xs font-bold py-2 rounded-xl active:scale-95 ${
                    canAfford
                      ? "bg-masjid text-sand"
                      : "bg-sand-dark text-masjid-dark/40"
                  }`}
                >
                  {canAfford ? `⭐ ${it.xp_cost}` : `🔒 ${it.xp_cost}`}
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-masjid-dark/60 py-8">
            مفيش عناصر متاحة
          </p>
        )}
      </div>
    </main>
  );
}
