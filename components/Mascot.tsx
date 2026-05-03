type MascotMood = "happy" | "encouraging" | "celebrating" | "thinking";

const moodConfig: Record<MascotMood, { emoji: string; bg: string }> = {
  happy: { emoji: "🌙", bg: "bg-kid-yellow/20" },
  encouraging: { emoji: "✨", bg: "bg-kid-sky/20" },
  celebrating: { emoji: "🎉", bg: "bg-kid-pink/20" },
  thinking: { emoji: "💭", bg: "bg-kid-mint/30" },
};

export function Mascot({
  mood = "happy",
  message,
  size = "md",
}: {
  mood?: MascotMood;
  message?: string;
  size?: "sm" | "md" | "lg";
}) {
  const config = moodConfig[mood];
  const sizes = {
    sm: "w-12 h-12 text-2xl",
    md: "w-20 h-20 text-4xl",
    lg: "w-28 h-28 text-5xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizes[size]} ${config.bg} rounded-full flex items-center justify-center shadow-soft border-4 border-white`}
      >
        <span>{config.emoji}</span>
      </div>
      {message && (
        <div className="bg-white rounded-2xl px-4 py-2 shadow-soft border border-masjid/10 max-w-xs">
          <p className="text-sm text-masjid-dark font-semibold">{message}</p>
        </div>
      )}
    </div>
  );
}
