"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase, getCurrentSession } from "@/lib/supabase";

// ───────────────────────── Design tokens ─────────────────────────
const C = {
  bg1: "#FBF4DE",
  bg2: "#F4E9C2",
  card: "#FFFFFF",
  cardWarm: "#FDF8E8",
  ink: "#1F3A2A",
  inkSoft: "#5A6B5D",
  inkMute: "#94977E",
  green: "#1E5A3F",
  greenDeep: "#13402C",
  greenSoft: "#E6EFE5",
  gold: "#C9A861",
  goldSoft: "#E7D6A1",
  goldPale: "#F3E8C4",
  divider: "rgba(31, 58, 42, 0.08)",
  heart: "#D9466B",
  dua: "#B98A2E",
};

const AVATAR_TONES: Array<[string, string]> = [
  ["#E7D6A1", "#C9A861"],
  ["#CCE0D2", "#5A8C6E"],
  ["#F6D6BE", "#C77E54"],
  ["#D9CFEA", "#7C66B6"],
  ["#E3D9C4", "#9C7C4D"],
  ["#CFE2E3", "#5C8F95"],
];

// ───────────────────────── Types ─────────────────────────
type Category = "all" | "general" | "tips" | "questions" | "success_stories" | "dua" | "preg" | "baby" | "kid";
type FeedRow = {
  id: string;
  mother_id: string;
  content: string;
  category: string | null;
  topic: string | null;
  audience: string | null;
  scene: string | null;
  author_tone: number;
  likes_count: number;
  prays_count: number;
  saves_count: number;
  is_pinned: boolean;
  created_at: string;
  author_name: string;
  author_email: string | null;
  is_verified: boolean;
  badge: string | null;
  i_liked: boolean;
  i_prayed: boolean;
  i_saved: boolean;
  top_comment_id: string | null;
  top_comment_author: string | null;
  top_comment_text: string | null;
  top_comment_likes: number;
  top_comment_created_at: string | null;
  comments_total: number;
};

// ───────────────────────── Helpers ─────────────────────────
function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d < 7) return d === 1 ? "أمس" : `منذ ${d} يوم`;
  return new Date(iso).toLocaleDateString("ar-EG");
}

// ───────────────────────── Inline icons ─────────────────────────
const Icon = ({
  name,
  size = 22,
  color = "currentColor",
  stroke = 1.6,
}: {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
}) => {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "back": return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>;
    case "plus": return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case "heart": return <svg {...p}><path d="M12 20s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 10c0 5.65-7 10-7 10z"/></svg>;
    case "heartFill": return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 20s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 10c0 5.65-7 10-7 10z"/></svg>;
    case "comment": return <svg {...p}><path d="M21 12a8 8 0 01-11.6 7.15L4 20l1-4.6A8 8 0 1121 12z"/></svg>;
    case "bookmark": return <svg {...p}><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>;
    case "bookmarkFill": return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>;
    case "more": return <svg {...p}><circle cx="5" cy="12" r="1.3" fill={color}/><circle cx="12" cy="12" r="1.3" fill={color}/><circle cx="19" cy="12" r="1.3" fill={color}/></svg>;
    case "image": return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-9 9"/></svg>;
    case "poll": return <svg {...p}><path d="M5 20V10M12 20V4M19 20v-7"/></svg>;
    case "globe": return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>;
    case "pin": return <svg {...p}><path d="M12 2l3 6h5l-4 4 2 6-6-3-6 3 2-6-4-4h5z"/></svg>;
    case "sparkle": return <svg {...p}><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/></svg>;
    case "verified": return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l2.4 2.1 3.2-.4.5 3.2 2.7 1.8L19.4 12l1.4 3.3-2.7 1.8-.5 3.2-3.2-.4L12 22l-2.4-2.1-3.2.4-.5-3.2L3.2 15.3 4.6 12 3.2 8.7 5.9 6.9l.5-3.2 3.2.4L12 2z"/>
        <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    default: return null;
  }
};

// ───────────────────────── Ornaments ─────────────────────────
function Ornament({
  kind,
  size = 80,
  color = C.goldSoft,
  opacity = 0.5,
  style = {},
}: {
  kind: string;
  size?: number;
  color?: string;
  opacity?: number;
  style?: React.CSSProperties;
}) {
  const common = { width: size, height: size, viewBox: "0 0 100 100", style };
  if (kind === "star8")
    return (
      <svg {...common}>
        <g fill="none" stroke={color} strokeWidth="1.4" opacity={opacity}>
          <path d="M50 5 L60 25 L82 25 L66 40 L75 62 L50 50 L25 62 L34 40 L18 25 L40 25 Z" />
          <path d="M50 18 L57 30 L70 30 L60 39 L65 52 L50 45 L35 52 L40 39 L30 30 L43 30 Z" />
        </g>
      </svg>
    );
  if (kind === "crescent")
    return (
      <svg {...common}>
        <g fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
          <path d="M70 50 A22 22 0 1 1 35 32 A18 18 0 1 0 70 50 Z" />
        </g>
      </svg>
    );
  if (kind === "arabesque")
    return (
      <svg {...common}>
        <g fill="none" stroke={color} strokeWidth="1.2" opacity={opacity}>
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="20" />
          <path d="M50 20 L50 80 M20 50 L80 50 M29 29 L71 71 M71 29 L29 71" />
          <circle cx="50" cy="50" r="4" />
        </g>
      </svg>
    );
  if (kind === "dots")
    return (
      <svg {...common}>
        <g fill={color} opacity={opacity}>
          {Array.from({ length: 25 }).map((_, i) => {
            const x = (i % 5) * 22 + 6;
            const y = Math.floor(i / 5) * 22 + 6;
            return <circle key={i} cx={x} cy={y} r="1.6" />;
          })}
        </g>
      </svg>
    );
  return null;
}

// ───────────────────────── Avatar ─────────────────────────
function Avatar({
  name,
  size = 44,
  ring = false,
  tone = 0,
}: {
  name: string;
  size?: number;
  ring?: boolean;
  tone?: number;
}) {
  const [a, b] = AVATAR_TONES[tone % AVATAR_TONES.length];
  const initials = (name || "؟")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${a}, ${b})`,
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.36,
        boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 4px ${C.gold}` : "none",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ───────────────────────── ReactionStack ─────────────────────────
function ReactionStack({
  liked,
  prayed,
  count,
}: {
  liked: boolean;
  prayed: boolean;
  count: number;
}) {
  const reactions: Array<{ k: string; e: string }> = [
    { k: "heart", e: "❤" },
    { k: "dua", e: "🤲" },
    { k: "like", e: "👍" },
  ];
  // Show at least one icon regardless
  const visible = reactions.slice(0, Math.max(1, liked || prayed || count > 0 ? 3 : 1));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex" }}>
        {visible.map((r, i) => (
          <div
            key={i}
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 11,
              border: "1.5px solid #fff",
              marginInlineStart: i === 0 ? 0 : -6,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {r.e}
          </div>
        ))}
      </div>
      <span style={{ color: C.inkSoft, fontSize: 13, fontWeight: 600 }}>{count}</span>
    </div>
  );
}

// ───────────────────────── Post scene ─────────────────────────
function PostImage({ scene }: { scene: string }) {
  const scenes: Record<string, { bg: string; content: React.ReactNode }> = {
    nursery: {
      bg: "linear-gradient(135deg, #F4E9C2, #E7D6A1)",
      content: (
        <g>
          <circle cx="200" cy="90" r="42" fill="#FBF4DE" />
          <path d="M200 95 a30 30 0 0 0 0 -50 a30 30 0 0 0 0 50z" fill="#E7D6A1" opacity="0.7" />
          <rect x="120" y="135" width="160" height="40" rx="6" fill="#C9A861" />
          <rect x="120" y="135" width="160" height="8" rx="3" fill="#A88846" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={130 + i * 18} y="143" width="2" height="32" fill="#A88846" opacity="0.6" />
          ))}
          <circle cx="120" cy="60" r="14" fill="#FBF4DE" />
          <circle cx="115" cy="56" r="12" fill="#E7D6A1" />
          <g fill="#FBF4DE">
            <circle cx="270" cy="55" r="2" />
            <circle cx="290" cy="80" r="1.5" />
            <circle cx="245" cy="35" r="1.8" />
          </g>
        </g>
      ),
    },
    plate: {
      bg: "linear-gradient(135deg, #FDF8E8, #F4E9C2)",
      content: (
        <g>
          <circle cx="200" cy="115" r="70" fill="#fff" stroke={C.gold} strokeWidth="2" />
          <circle cx="200" cy="115" r="55" fill={C.bg1} />
          <circle cx="180" cy="100" r="10" fill="#C77E54" />
          <circle cx="215" cy="105" r="12" fill="#5A8C6E" />
          <circle cx="195" cy="130" r="11" fill="#C9A861" />
          <circle cx="220" cy="130" r="8" fill="#D9466B" opacity="0.6" />
          <circle cx="170" cy="125" r="7" fill="#5A8C6E" opacity="0.7" />
        </g>
      ),
    },
    duacard: {
      bg: `linear-gradient(135deg, ${C.greenDeep}, ${C.green})`,
      content: (
        <g>
          <g transform="translate(200 115)" stroke={C.gold} strokeWidth="1.5" fill="none" opacity="0.6">
            <circle r="70" />
            <circle r="55" />
            <circle r="40" />
            {Array.from({ length: 8 }).map((_, i) => (
              <path key={i} d="M0 -70 L0 -40" transform={`rotate(${i * 45})`} />
            ))}
          </g>
          <text x="200" y="105" textAnchor="middle" fill="#fff" fontFamily="serif" fontSize="22" fontWeight="700">
            اللّهم
          </text>
          <text x="200" y="135" textAnchor="middle" fill={C.goldSoft} fontFamily="serif" fontSize="16">
            احفظ أولادنا
          </text>
        </g>
      ),
    },
    walk: {
      bg: "linear-gradient(135deg, #CCE0D2, #5A8C6E)",
      content: (
        <g>
          <rect x="0" y="170" width="400" height="60" fill="#3D6B4D" />
          <circle cx="170" cy="100" r="16" fill="#13402C" />
          <path d="M154 116 Q170 130 186 116 L190 170 L150 170 Z" fill="#13402C" />
          <circle cx="220" cy="125" r="11" fill="#13402C" />
          <path d="M210 135 Q220 145 230 135 L233 170 L207 170 Z" fill="#13402C" />
          <path d="M186 145 Q200 152 215 148" stroke="#13402C" strokeWidth="3" fill="none" />
          <circle cx="320" cy="60" r="22" fill="#E7D6A1" />
        </g>
      ),
    },
  };
  const s = scenes[scene];
  if (!s) return null;
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16 / 10",
        borderRadius: 14,
        overflow: "hidden",
        background: s.bg,
        position: "relative",
        marginTop: 10,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 400 230" preserveAspectRatio="xMidYMid slice">
        {s.content}
      </svg>
    </div>
  );
}

// ───────────────────────── Page ─────────────────────────
export default function CommunityFeedPage() {
  const [posts, setPosts] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Category>("all");
  const [sort, setSort] = useState<"latest" | "top">("latest");
  const [composeOpen, setComposeOpen] = useState(false);
  const [showOrn, setShowOrn] = useState(true);
  const [myEmail, setMyEmail] = useState<string>("أم");

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const session = await getCurrentSession();
    if (session?.user.email) {
      const localname = session.user.email.split("@")[0];
      setMyEmail(localname);
    }
    const cat = active === "all" ? null : active;
    const { data, error } = await supabase.rpc("get_community_feed", {
      p_category: cat,
      p_sort: sort,
      p_limit: 30,
    });
    if (!error && data) setPosts(data as FeedRow[]);
    setLoading(false);
  }, [active, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  const onReact = async (post: FeedRow, kind: "like" | "pray" | "save") => {
    if (!supabase) return;
    const session = await getCurrentSession();
    if (!session) return;
    const uid = session.user.id;

    // Optimistic update
    setPosts((p) =>
      p.map((x) => {
        if (x.id !== post.id) return x;
        if (kind === "like")
          return {
            ...x,
            i_liked: !x.i_liked,
            likes_count: x.likes_count + (x.i_liked ? -1 : 1),
          };
        if (kind === "pray")
          return {
            ...x,
            i_prayed: !x.i_prayed,
            prays_count: x.prays_count + (x.i_prayed ? -1 : 1),
          };
        if (kind === "save")
          return {
            ...x,
            i_saved: !x.i_saved,
            saves_count: x.saves_count + (x.i_saved ? -1 : 1),
          };
        return x;
      }),
    );

    const tableMap = { like: "post_likes", pray: "post_prays", save: "post_saves" };
    const stateKey = { like: "i_liked", pray: "i_prayed", save: "i_saved" }[kind] as
      | "i_liked"
      | "i_prayed"
      | "i_saved";
    const isOn = post[stateKey];

    if (isOn) {
      await supabase
        .from(tableMap[kind])
        .delete()
        .eq("post_id", post.id)
        .eq("mother_id", uid);
    } else {
      await supabase.from(tableMap[kind]).insert({ post_id: post.id, mother_id: uid });
    }
  };

  const onPublish = async (
    text: string,
    category: Category,
    topic: string,
  ) => {
    if (!supabase || !text.trim()) return;
    const session = await getCurrentSession();
    if (!session) return;
    await supabase.from("community_posts").insert({
      mother_id: session.user.id,
      content: text.trim(),
      category: category === "all" ? "general" : category,
      topic: topic.trim() || null,
      audience: "الكل",
    });
    setComposeOpen(false);
    void load();
  };

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${C.bg1} 0%, ${C.bg2} 100%)`,
        position: "relative",
        paddingBottom: 60,
      }}
    >
      {/* Decorative ornaments */}
      {showOrn && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <Ornament kind="star8" size={140} color={C.gold} opacity={0.08} style={{ position: "absolute", top: 180, left: -40 }} />
          <Ornament kind="arabesque" size={180} color={C.green} opacity={0.05} style={{ position: "absolute", top: 560, right: -50 }} />
          <Ornament kind="dots" size={100} color={C.gold} opacity={0.18} style={{ position: "absolute", top: 380, right: 20 }} />
          <Ornament kind="crescent" size={90} color={C.green} opacity={0.06} style={{ position: "absolute", top: 920, left: 30 }} />
          <Ornament kind="star8" size={110} color={C.gold} opacity={0.07} style={{ position: "absolute", top: 1280, right: -30 }} />
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ paddingTop: 24, paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 18px 12px" }}>
            <button
              onClick={() => setComposeOpen(true)}
              style={{
                background: C.green,
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 6px 16px rgba(30,90,63,0.28)",
                cursor: "pointer",
              }}
            >
              <Icon name="plus" size={16} stroke={2.4} />
              بوست
            </button>

            <div style={{ textAlign: "center", flex: 1, marginInline: 12 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 21, color: C.green }}>مجتمع الأمهات</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={C.green}>
                  <path d="M21 12c0 4.5-4 8-9 8-1.4 0-2.8-.3-4-.8L3 21l1.4-4A7.7 7.7 0 013 12c0-4.5 4-8 9-8s9 3.5 9 8z" />
                </svg>
              </div>
              <div style={{ fontSize: 12, color: C.gold, marginTop: 2, fontWeight: 500 }}>
                شاركي تجاربك واسألي
              </div>
            </div>

            <Link
              href="/dashboard"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 2px 10px rgba(30,90,63,0.08)",
                color: C.green,
              }}
            >
              <Icon name="back" size={20} />
            </Link>
          </div>
        </div>

        {/* Chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "4px 18px 14px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {[
            { id: "all", label: "الكل", icon: "sparkle" },
            { id: "questions", label: "أسئلة", icon: "comment" },
            { id: "tips", label: "نصائح", icon: "sparkle" },
            { id: "dua", label: "دعاء", emoji: "🤲" },
            { id: "success_stories", label: "قصص نجاح", icon: "heart" },
            { id: "preg", label: "حوامل", icon: "heart" },
            { id: "baby", label: "رضع", icon: "heart" },
            { id: "kid", label: "أطفال", icon: "more" },
          ].map((it) => {
            const on = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => setActive(it.id as Category)}
                style={{
                  flexShrink: 0,
                  background: on ? C.green : "#fff",
                  color: on ? "#fff" : C.green,
                  border: on ? "none" : `1px solid ${C.divider}`,
                  padding: "8px 14px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: on ? "0 4px 12px rgba(30,90,63,0.18)" : "none",
                  transition: "all .15s",
                }}
              >
                {it.emoji ? (
                  <span style={{ fontSize: 13, lineHeight: 1 }}>{it.emoji}</span>
                ) : (
                  <Icon name={it.icon!} size={14} stroke={2} />
                )}
                {it.label}
              </button>
            );
          })}
        </div>

        {/* Composer card */}
        <div
          style={{
            background: C.card,
            borderRadius: 22,
            margin: "0 16px 14px",
            padding: 14,
            boxShadow: "0 4px 14px rgba(31,58,42,0.06)",
            border: `1px solid ${C.divider}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Ornament kind="arabesque" size={120} color={C.gold} opacity={0.08} style={{ position: "absolute", left: -30, bottom: -30 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <Avatar name={myEmail} size={40} tone={0} />
            <button
              onClick={() => setComposeOpen(true)}
              style={{
                flex: 1,
                background: C.bg1,
                border: `1px solid ${C.divider}`,
                padding: "12px 16px",
                borderRadius: 999,
                textAlign: "right",
                color: C.inkMute,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              شاركي تجربتك يا {myEmail}...
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${C.divider}`,
              justifyContent: "space-around",
            }}
          >
            {[
              { icon: "image", label: "صورة", color: "#5A8C6E" },
              { emoji: "🤲", label: "دعاء", color: C.gold },
              { icon: "poll", label: "استطلاع", color: "#7C66B6" },
              { icon: "sparkle", label: "سؤال", color: "#C77E54" },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => setComposeOpen(true)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "8px 4px",
                  borderRadius: 12,
                  color: C.inkSoft,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <span style={{ color: a.color, display: "grid", placeItems: "center", fontSize: 16, lineHeight: 1 }}>
                  {a.emoji ? a.emoji : <Icon name={a.icon!} size={18} stroke={2} />}
                </span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feed section title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 22px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.greenDeep, fontWeight: 800, fontSize: 14 }}>
            <Icon name="sparkle" size={14} color={C.gold} />
            {sort === "latest" ? "أحدث البوستات" : "الأكثر تفاعلًا"}
          </div>
          <button
            onClick={() => setSort(sort === "latest" ? "top" : "latest")}
            style={{
              background: "transparent",
              border: "none",
              color: C.inkSoft,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {sort === "latest" ? "الأكثر تفاعلًا ⌄" : "الأحدث ⌄"}
          </button>
        </div>

        {/* Posts */}
        {loading ? (
          <p style={{ textAlign: "center", padding: 40, color: C.inkSoft }}>جاري التحميل...</p>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: "center", padding: 40, color: C.inkSoft }}>
            مفيش بوستات لسه. ابدئي أنتي 🌿
          </p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onReact={(k) => onReact(post, k)} />
          ))
        )}

        {/* End-of-feed flourish */}
        {posts.length > 0 && (
          <div style={{ textAlign: "center", padding: "20px 30px 30px", color: C.inkMute, fontSize: 13, lineHeight: 1.8 }}>
            <Ornament kind="arabesque" size={50} color={C.gold} opacity={0.4} style={{ display: "block", margin: "0 auto 8px" }} />
            وصلتي لآخر البوستات لليوم 🌿
            <br />
            ادعي لأخواتك في المجتمع
          </div>
        )}

        {/* Tweak: ornaments toggle */}
        <button
          onClick={() => setShowOrn(!showOrn)}
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${C.divider}`,
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 11,
            color: C.inkSoft,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            zIndex: 50,
          }}
        >
          {showOrn ? "🎨 إخفاء الزخارف" : "🎨 إظهار الزخارف"}
        </button>
      </div>

      {/* Compose modal */}
      {composeOpen && (
        <ComposeModal
          authorLabel={myEmail}
          onClose={() => setComposeOpen(false)}
          onPublish={onPublish}
        />
      )}
    </main>
  );
}

// ───────────────────────── PostCard ─────────────────────────
function PostCard({
  post,
  onReact,
}: {
  post: FeedRow;
  onReact: (k: "like" | "pray" | "save") => void;
}) {
  return (
    <article
      style={{
        background: post.is_pinned ? C.cardWarm : C.card,
        borderRadius: 22,
        margin: "0 16px 14px",
        padding: 14,
        boxShadow: "0 4px 14px rgba(31,58,42,0.05)",
        border: post.is_pinned ? `1px solid ${C.goldSoft}` : `1px solid ${C.divider}`,
        position: "relative",
      }}
    >
      {post.is_pinned && (
        <div
          style={{
            position: "absolute",
            top: -8,
            right: 16,
            background: C.gold,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 4,
            boxShadow: "0 2px 6px rgba(201,168,97,0.4)",
          }}
        >
          <Icon name="pin" size={11} stroke={2} />
          مثبّت من المشرفة
        </div>
      )}

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={post.author_name} size={42} tone={post.author_tone} ring={post.is_verified} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>{post.author_name}</span>
            {post.is_verified && <Icon name="verified" size={14} color={C.green} />}
            {post.badge && (
              <span
                style={{
                  background: C.greenSoft,
                  color: C.green,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 999,
                }}
              >
                {post.badge}
              </span>
            )}
          </div>
          <div style={{ color: C.inkMute, fontSize: 12, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
            <span>{relativeTime(post.created_at)}</span>
            <span>·</span>
            <Icon name="globe" size={11} />
            <span>{post.audience || "الكل"}</span>
          </div>
        </div>
        <button style={{ background: "transparent", border: "none", cursor: "pointer", color: C.inkSoft, padding: 4 }}>
          <Icon name="more" size={20} />
        </button>
      </div>

      {/* Topic */}
      {post.topic && (
        <div style={{ marginTop: 10 }}>
          <span
            style={{
              background: C.goldPale,
              color: C.greenDeep,
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            #{post.topic}
          </span>
        </div>
      )}

      {/* Content */}
      <p style={{ margin: "10px 0 0", color: C.ink, fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
        {post.content}
      </p>

      {/* Scene */}
      {post.scene && <PostImage scene={post.scene} />}

      {/* Counters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          paddingBottom: 8,
          borderBottom: `1px solid ${C.divider}`,
        }}
      >
        <ReactionStack
          liked={post.i_liked}
          prayed={post.i_prayed}
          count={post.likes_count + post.prays_count}
        />
        <div style={{ color: C.inkSoft, fontSize: 13, fontWeight: 600, display: "flex", gap: 12 }}>
          <span>{post.comments_total} تعليق</span>
          <span>{post.saves_count} حفظ</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 6 }}>
        <ActionBtn
          icon={post.i_liked ? "heartFill" : "heart"}
          label="إعجاب"
          active={post.i_liked}
          activeColor={C.heart}
          onClick={() => onReact("like")}
        />
        <ActionBtn icon="comment" label="تعليق" />
        <ActionBtn
          emoji="🤲"
          label="ادعي لها"
          active={post.i_prayed}
          activeColor={C.dua}
          onClick={() => onReact("pray")}
        />
        <ActionBtn
          icon={post.i_saved ? "bookmarkFill" : "bookmark"}
          label="حفظ"
          active={post.i_saved}
          activeColor={C.green}
          onClick={() => onReact("save")}
        />
      </div>

      {/* Top comment */}
      {post.top_comment_id && (
        <div style={{ marginTop: 8, paddingTop: 10, borderTop: `1px solid ${C.divider}`, display: "flex", gap: 8 }}>
          <Avatar name={post.top_comment_author || "أم"} size={32} tone={(post.author_tone + 2) % 6} />
          <div style={{ background: C.bg1, borderRadius: 14, padding: "8px 12px", flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>
              {post.top_comment_author || "أم"}
            </div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2, lineHeight: 1.6 }}>
              {post.top_comment_text}
            </div>
            <div style={{ fontSize: 11, color: C.inkMute, marginTop: 4, display: "flex", gap: 10 }}>
              <span>{relativeTime(post.top_comment_created_at!)}</span>
              <span>إعجاب · {post.top_comment_likes}</span>
              <span>رد</span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function ActionBtn({
  icon,
  emoji,
  label,
  active,
  activeColor,
  onClick,
}: {
  icon?: string;
  emoji?: string;
  label: string;
  active?: boolean;
  activeColor?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        padding: "8px 2px",
        borderRadius: 10,
        whiteSpace: "nowrap",
        minWidth: 0,
        color: active ? activeColor : C.inkSoft,
        fontSize: 12.5,
        fontWeight: 600,
        transition: "color .15s",
      }}
    >
      {emoji ? (
        <span style={{ fontSize: 14, lineHeight: 1 }}>{emoji}</span>
      ) : (
        <Icon name={icon!} size={16} color={active ? activeColor : C.inkSoft} stroke={1.8} />
      )}
      {label}
    </button>
  );
}

// ───────────────────────── Compose modal ─────────────────────────
function ComposeModal({
  authorLabel,
  onClose,
  onPublish,
}: {
  authorLabel: string;
  onClose: () => void;
  onPublish: (text: string, category: Category, topic: string) => void;
}) {
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<Category>("general");
  const [publishing, setPublishing] = useState(false);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(19,64,44,0.45)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        animation: "fadein .2s",
      }}
    >
      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideup { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: C.card,
          borderRadius: "24px 24px 0 0",
          padding: 18,
          paddingBottom: 30,
          animation: "slideup .25s ease-out",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ width: 44, height: 4, background: C.divider, borderRadius: 2, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.inkSoft, fontSize: 15, cursor: "pointer" }}>
            إلغاء
          </button>
          <h3 style={{ margin: 0, color: C.ink, fontSize: 17, fontWeight: 800 }}>بوست جديد</h3>
          <button
            onClick={async () => {
              if (!text.trim() || publishing) return;
              setPublishing(true);
              await onPublish(text, category, topic);
              setPublishing(false);
            }}
            disabled={!text.trim() || publishing}
            style={{
              background: text.trim() && !publishing ? C.green : C.greenSoft,
              color: text.trim() && !publishing ? "#fff" : C.green,
              border: "none",
              padding: "8px 16px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              cursor: text.trim() && !publishing ? "pointer" : "default",
            }}
          >
            {publishing ? "..." : "نشر"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Avatar name={authorLabel} size={40} tone={0} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder={`إيه اللي بتفكري فيه يا ${authorLabel}؟`}
            style={{
              flex: 1,
              border: "none",
              resize: "none",
              outline: "none",
              fontSize: 16,
              color: C.ink,
              minHeight: 100,
              background: "transparent",
              lineHeight: 1.7,
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Topic + Category */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="#الموضوع (اختياري)"
            style={{
              background: C.bg1,
              border: `1px solid ${C.divider}`,
              padding: "8px 12px",
              borderRadius: 12,
              fontSize: 13,
              color: C.ink,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            style={{
              background: C.bg1,
              border: `1px solid ${C.divider}`,
              padding: "8px 12px",
              borderRadius: 12,
              fontSize: 13,
              color: C.ink,
              outline: "none",
              fontFamily: "inherit",
            }}
          >
            <option value="general">عام</option>
            <option value="questions">أسئلة</option>
            <option value="tips">نصائح</option>
            <option value="dua">دعاء</option>
            <option value="success_stories">قصص نجاح</option>
            <option value="preg">حوامل</option>
            <option value="baby">رضع</option>
            <option value="kid">أطفال</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, padding: "12px 0 0", borderTop: `1px solid ${C.divider}` }}>
          {[
            { icon: "image", color: "#5A8C6E" },
            { emoji: "🤲", color: C.gold },
            { icon: "poll", color: "#7C66B6" },
            { icon: "sparkle", color: "#C77E54" },
          ].map((a, i) => (
            <button
              key={i}
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: C.bg1,
                border: "none",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color: a.color,
                fontSize: 18,
              }}
            >
              {a.emoji ? a.emoji : <Icon name={a.icon!} size={20} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
