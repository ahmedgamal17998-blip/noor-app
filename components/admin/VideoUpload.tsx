"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export function VideoUpload({
  currentUrl,
  onUploaded,
  pathPrefix = "step-videos",
}: {
  currentUrl: string | null;
  onUploaded: (publicUrl: string | null) => void;
  pathPrefix?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    if (!supabase) return;
    if (file.size > 52 * 1024 * 1024) {
      setError("الفيديو لازم يكون أصغر من 50 ميجا");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() ?? "mp4";
      const key = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("step-videos")
        .upload(key, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        });
      if (upErr) throw new Error(upErr.message);
      const { data } = supabase.storage.from("step-videos").getPublicUrl(key);
      onUploaded(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حصلت مشكلة في الرفع");
    }
    setBusy(false);
  };

  const remove = async () => {
    if (!currentUrl) return;
    if (!confirm("احذف الفيديو الحالي؟")) return;
    onUploaded(null);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      {currentUrl ? (
        <div className="space-y-2">
          <video
            src={currentUrl}
            controls
            className="w-full rounded-2xl bg-black"
            preload="metadata"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex-1 bg-gold/20 text-gold-dark font-bold text-sm py-2 rounded-xl disabled:opacity-50"
            >
              {busy ? "بنرفع..." : "📹 تغيير الفيديو"}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="bg-wrong/20 text-wrong font-bold text-sm px-3 py-2 rounded-xl"
            >
              🗑️
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full bg-sand border-2 border-dashed border-masjid/30 text-masjid-dark font-semibold py-4 rounded-2xl text-sm disabled:opacity-50"
        >
          {busy ? "بنرفع..." : "📹 ارفع فيديو (اختياري، حتى 50 ميجا)"}
        </button>
      )}

      {error && <p className="text-xs text-wrong">{error}</p>}
    </div>
  );
}
