"use client";

import { useEffect, useRef, useState } from "react";
import type { SurahStory } from "@/lib/db/types";
import { feedbackSuccess } from "@/lib/feedback";

export function StoryStep({
  story,
  onComplete,
}: {
  story: SurahStory | null;
  onComplete: () => void;
}) {
  const [hasRead, setHasRead] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const playAudio = () => {
    if (!story?.story_audio_url) return;
    const a = new Audio(story.story_audio_url);
    audioRef.current = a;
    setPlaying(true);
    a.onended = () => setPlaying(false);
    a.onerror = () => setPlaying(false);
    void a.play();
  };

  const finish = () => {
    feedbackSuccess();
    setHasRead(true);
    onComplete();
  };

  if (!story) {
    return (
      <div className="text-center space-y-3">
        <div className="text-6xl">📖</div>
        <p className="text-masjid-dark">القصة لسه ماتضافتش لهذه السورة</p>
        <p className="text-sm text-masjid-dark/60">
          الـ admin محتاج يضيفها من /admin/surahs
        </p>
        <button
          onClick={finish}
          className="bg-masjid text-sand font-bold px-6 py-3 rounded-2xl mt-3"
        >
          تخطّي
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">📖</div>
        <h2 className="text-xl font-bold text-masjid-dark">{story.title}</h2>
      </div>

      {story.story_image_url && (
        <div className="rounded-3xl overflow-hidden bg-sand-dark/30 aspect-video flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.story_image_url}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {story.story_audio_url && (
        <button
          onClick={playAudio}
          disabled={playing}
          className="w-full bg-gold/20 text-gold-dark font-bold py-3 rounded-2xl active:scale-95 disabled:opacity-50"
        >
          {playing ? "🔊 جاري التشغيل..." : "🔊 استمع للقصة"}
        </button>
      )}

      <div className="bg-white rounded-3xl p-5 shadow-soft border border-masjid/10">
        <p className="text-masjid-dark leading-loose whitespace-pre-wrap">
          {story.story_text}
        </p>
      </div>

      {story.meaning_simplified && (
        <div className="bg-gold/10 rounded-3xl p-4 border border-gold/30">
          <p className="text-xs font-bold text-gold-dark mb-1">💡 المعنى:</p>
          <p className="text-sm text-masjid-dark leading-relaxed">
            {story.meaning_simplified}
          </p>
        </div>
      )}

      <button
        onClick={finish}
        disabled={hasRead}
        className="w-full bg-masjid text-sand font-bold py-4 rounded-3xl shadow-soft-lg disabled:opacity-50 active:scale-95"
      >
        ✓ قريت القصة وفهمتها
      </button>
    </div>
  );
}
