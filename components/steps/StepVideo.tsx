"use client";

export function StepVideo({ url }: { url: string | null | undefined }) {
  if (!url) return null;
  return (
    <div className="rounded-3xl overflow-hidden bg-black shadow-soft">
      <video
        src={url}
        controls
        playsInline
        className="w-full"
        preload="metadata"
      />
    </div>
  );
}
