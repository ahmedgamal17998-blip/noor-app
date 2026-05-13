"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Surah } from "@/lib/db/types";

export default function AdminSurahsPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("surahs").select("*").order("level_order");
    setSurahs((data ?? []) as Surah[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!supabase) return;
    await supabase.from("surahs").update({ is_active: !isActive }).eq("id", id);
    void load();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`حذف سورة ${name} وكل محتواها؟`)) return;
    if (!supabase) return;
    await supabase.from("surahs").delete().eq("id", id);
    void load();
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-masjid-dark">📖 إدارة السور</h1>
          <p className="text-sm text-masjid-dark/60">
            {surahs.length} سورة في المنصة
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-masjid text-sand font-bold px-4 py-2 rounded-2xl active:scale-95"
        >
          + إضافة سورة
        </button>
      </header>

      {loading ? (
        <p className="text-center text-masjid-dark/60 py-8">جاري التحميل...</p>
      ) : (
        <div className="bg-white rounded-3xl shadow-soft border border-masjid/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-dark/40 text-xs">
              <tr>
                <th className="text-right p-3">الترتيب</th>
                <th className="text-right p-3">السورة</th>
                <th className="text-center p-3">الآيات</th>
                <th className="text-center p-3">الحالة</th>
                <th className="text-center p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {surahs.map((s) => (
                <tr key={s.id} className="border-t border-masjid/5">
                  <td className="p-3 font-bold text-masjid-dark">{s.level_order}</td>
                  <td className="p-3">
                    <Link
                      href={`/admin/surahs/${s.id}`}
                      className="font-quran text-lg text-masjid-dark hover:text-masjid"
                    >
                      {s.name_arabic}
                    </Link>
                    <span className="block text-xs text-masjid-dark/50">
                      #{s.surah_number} · {s.name_english}
                    </span>
                  </td>
                  <td className="p-3 text-center text-masjid-dark/70">
                    {s.total_ayahs}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleActive(s.id, s.is_active)}
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        s.is_active
                          ? "bg-success/20 text-success"
                          : "bg-masjid-dark/10 text-masjid-dark/60"
                      }`}
                    >
                      {s.is_active ? "✓ نشطة" : "متوقفة"}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/admin/surahs/${s.id}`}
                      className="text-xs text-masjid font-bold mr-2 hover:underline"
                    >
                      تعديل
                    </Link>
                    <button
                      onClick={() => remove(s.id, s.name_arabic)}
                      className="text-xs text-wrong font-bold hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {surahs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-masjid-dark/60">
                    لسه مفيش سور. اضغطي &quot;إضافة سورة&quot; علشان تبدئي.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddSurahModal
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            void load();
          }}
          nextOrder={surahs.length + 1}
        />
      )}
    </div>
  );
}

function AddSurahModal({
  onClose,
  onAdded,
  nextOrder,
}: {
  onClose: () => void;
  onAdded: () => void;
  nextOrder: number;
}) {
  const [num, setNum] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [totalAyahs, setTotalAyahs] = useState("");
  const [order, setOrder] = useState(String(nextOrder));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setErr(null);
    const { error } = await supabase.from("surahs").insert({
      surah_number: Number(num),
      name_arabic: nameAr.trim(),
      name_english: nameEn.trim() || null,
      total_ayahs: Number(totalAyahs),
      level_order: Number(order),
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onAdded();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="bg-white rounded-3xl p-6 max-w-md w-full space-y-3"
      >
        <h2 className="font-bold text-lg text-masjid-dark mb-2">سورة جديدة</h2>
        <Field label="رقم السورة (1-114)" value={num} onChange={setNum} type="number" />
        <Field label="الاسم بالعربي" value={nameAr} onChange={setNameAr} />
        <Field label="الاسم بالإنجليزي" value={nameEn} onChange={setNameEn} />
        <Field
          label="عدد الآيات"
          value={totalAyahs}
          onChange={setTotalAyahs}
          type="number"
        />
        <Field label="ترتيب الظهور" value={order} onChange={setOrder} type="number" />
        {err && <p className="text-xs text-wrong">{err}</p>}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-sand-dark py-3 rounded-2xl font-semibold"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={busy || !num || !nameAr || !totalAyahs}
            className="flex-1 bg-masjid text-sand py-3 rounded-2xl font-bold disabled:opacity-50"
          >
            {busy ? "..." : "إضافة"}
          </button>
        </div>
      </form>
    </div>
  );
}

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
        className="w-full bg-sand border-2 border-masjid/10 rounded-xl px-3 py-2 focus:border-masjid focus:outline-none mt-1"
      />
    </div>
  );
}
