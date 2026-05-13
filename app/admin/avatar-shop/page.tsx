"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AvatarItem } from "@/lib/db/types";

export default function AdminAvatarShopPage() {
  const [items, setItems] = useState<AvatarItem[]>([]);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("avatar_items").select("*").order("xp_cost");
    setItems((data ?? []) as AvatarItem[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!supabase) return;
    await supabase.from("avatar_items").update({ is_active: !isActive }).eq("id", id);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("احذف العنصر؟")) return;
    if (!supabase) return;
    await supabase.from("avatar_items").delete().eq("id", id);
    void load();
  };

  return (
    <div className="space-y-5">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-masjid-dark">🎨 متجر الأفاتار</h1>
          <p className="text-sm text-masjid-dark/60">{items.length} عنصر</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="bg-masjid text-sand font-bold px-4 py-2 rounded-2xl"
        >
          + عنصر
        </button>
      </header>

      {adding && (
        <AddItemForm
          onAdd={() => {
            setAdding(false);
            void load();
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((it) => (
          <div
            key={it.id}
            className={`bg-white rounded-2xl p-3 shadow-soft border ${
              it.is_active ? "border-masjid/5" : "border-wrong/20 opacity-60"
            }`}
          >
            <div className="aspect-square bg-sand rounded-xl flex items-center justify-center text-4xl mb-2">
              {it.item_image_url.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.item_image_url} alt={it.item_name} className="w-full h-full object-contain" />
              ) : (
                it.item_image_url
              )}
            </div>
            <p className="font-bold text-sm text-masjid-dark">{it.item_name}</p>
            <p className="text-xs text-masjid-dark/60">
              {it.item_type} · {it.gender === "both" ? "للكل" : it.gender}
            </p>
            <p className="text-xs text-gold-dark font-bold">⭐ {it.xp_cost} XP</p>
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => toggleActive(it.id, it.is_active)}
                className="flex-1 text-xs bg-sand py-1 rounded-lg"
              >
                {it.is_active ? "تعطيل" : "تفعيل"}
              </button>
              <button
                onClick={() => remove(it.id)}
                className="text-xs bg-wrong/20 text-wrong py-1 px-2 rounded-lg"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddItemForm({ onAdd, onCancel }: { onAdd: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    item_type: "accessory",
    item_name: "",
    item_image_url: "✨",
    xp_cost: "20",
    gender: "both",
  });

  const submit = async () => {
    if (!supabase || !form.item_name) return;
    await supabase.from("avatar_items").insert({
      item_type: form.item_type,
      item_name: form.item_name,
      item_image_url: form.item_image_url,
      xp_cost: Number(form.xp_cost),
      gender: form.gender,
    });
    onAdd();
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-soft border border-masjid/10 space-y-2">
      <h3 className="font-bold text-masjid-dark">عنصر جديد</h3>
      <div>
        <label className="text-xs">النوع</label>
        <select
          value={form.item_type}
          onChange={(e) => setForm({ ...form, item_type: e.target.value })}
          className="w-full bg-sand border-2 border-masjid/10 rounded-xl px-3 py-2 mt-1"
        >
          <option value="head">رأس</option>
          <option value="body">جسم</option>
          <option value="accessory">إكسسوار</option>
          <option value="background">خلفية</option>
        </select>
      </div>
      <input
        value={form.item_name}
        onChange={(e) => setForm({ ...form, item_name: e.target.value })}
        placeholder="اسم العنصر"
        className="w-full bg-sand border-2 border-masjid/10 rounded-xl px-3 py-2"
      />
      <input
        value={form.item_image_url}
        onChange={(e) => setForm({ ...form, item_image_url: e.target.value })}
        placeholder="URL أو emoji (مثل ✨ أو https://...)"
        className="w-full bg-sand border-2 border-masjid/10 rounded-xl px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={form.xp_cost}
          onChange={(e) => setForm({ ...form, xp_cost: e.target.value })}
          placeholder="XP"
          className="bg-sand border-2 border-masjid/10 rounded-xl px-3 py-2"
        />
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          className="bg-sand border-2 border-masjid/10 rounded-xl px-3 py-2"
        >
          <option value="both">للكل</option>
          <option value="boy">ولد</option>
          <option value="girl">بنت</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 bg-sand-dark py-2 rounded-xl text-sm">
          إلغاء
        </button>
        <button onClick={submit} className="flex-1 bg-masjid text-sand py-2 rounded-xl text-sm font-bold">
          إضافة
        </button>
      </div>
    </div>
  );
}
