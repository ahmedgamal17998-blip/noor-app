"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCommunityPosts,
  createPost,
  toggleLike,
  addComment,
  getPostComments,
} from "@/lib/db/queries";
import type { CommunityPost, CommunityComment } from "@/lib/db/types";

type PostWithMother = CommunityPost & { mother_name: string };

const CATEGORIES = [
  { value: "general", label: "عام" },
  { value: "tips", label: "نصايح" },
  { value: "questions", label: "أسئلة" },
  { value: "success_stories", label: "قصص نجاح" },
] as const;

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostWithMother[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getCommunityPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="min-h-screen px-5 py-6 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-5">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-masjid-dark"
        >
          ←
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-masjid-dark">💬 مجتمع الأمهات</h1>
          <p className="text-xs text-masjid-dark/60">شاركي تجاربك واسألي</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="bg-masjid text-sand text-sm font-bold px-3 py-2 rounded-full"
        >
          + بوست
        </button>
      </header>

      {loading ? (
        <p className="text-center text-masjid-dark/60 py-8">جاري التحميل...</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              isOpen={openComments === p.id}
              onToggleComments={() =>
                setOpenComments(openComments === p.id ? null : p.id)
              }
              onLike={async () => {
                await toggleLike(p.id);
                void load();
              }}
            />
          ))}
          {posts.length === 0 && (
            <p className="text-center text-masjid-dark/60 py-8">
              لسه مفيش بوستات. ابدئي أنتي 🌟
            </p>
          )}
        </div>
      )}

      {showNew && (
        <NewPostModal
          onClose={() => setShowNew(false)}
          onPosted={() => {
            setShowNew(false);
            void load();
          }}
        />
      )}
    </main>
  );
}

function PostCard({
  post,
  isOpen,
  onToggleComments,
  onLike,
}: {
  post: PostWithMother;
  isOpen: boolean;
  onToggleComments: () => void;
  onLike: () => void;
}) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-soft border border-masjid/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/40 to-masjid/30 flex items-center justify-center">
            🌙
          </div>
          <div>
            <p className="text-sm font-bold text-masjid-dark">{post.mother_name}</p>
            <p className="text-[10px] text-masjid-dark/50">
              {new Date(post.created_at).toLocaleDateString("ar-EG")}
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-sand-dark/40 px-2 py-1 rounded-full text-masjid-dark/70">
          {CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
        </span>
      </div>
      <p className="text-sm text-masjid-dark whitespace-pre-wrap leading-relaxed mb-3">
        {post.content}
      </p>
      <div className="flex items-center gap-3 pt-2 border-t border-masjid/5">
        <button
          onClick={onLike}
          className="flex items-center gap-1 text-sm text-masjid-dark/70 hover:text-wrong"
        >
          ❤️ <span className="text-xs">{post.likes_count}</span>
        </button>
        <button
          onClick={onToggleComments}
          className="flex items-center gap-1 text-sm text-masjid-dark/70 hover:text-masjid"
        >
          💬 <span className="text-xs">تعليق</span>
        </button>
      </div>
      {isOpen && <CommentsSection postId={post.id} />}
    </div>
  );
}

function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<
    Array<CommunityComment & { mother_name: string }>
  >([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const data = await getPostComments(postId);
    setComments(data);
  };

  useEffect(() => {
    void load();
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    await addComment(postId, text.trim());
    setText("");
    setBusy(false);
    void load();
  };

  return (
    <div className="mt-3 pt-3 border-t border-masjid/5 space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="bg-sand rounded-xl p-2">
          <p className="text-xs font-bold text-masjid-dark">{c.mother_name}</p>
          <p className="text-sm text-masjid-dark">{c.content}</p>
        </div>
      ))}
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتبي تعليق..."
          className="flex-1 bg-sand border border-masjid/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-masjid"
        />
        <button
          type="submit"
          disabled={!text.trim() || busy}
          className="bg-masjid text-sand text-sm font-bold px-3 rounded-xl disabled:opacity-50"
        >
          ↑
        </button>
      </form>
    </div>
  );
}

function NewPostModal({
  onClose,
  onPosted,
}: {
  onClose: () => void;
  onPosted: () => void;
}) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<CommunityPost["category"]>("general");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    await createPost(content.trim(), category);
    setBusy(false);
    onPosted();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md bg-sand rounded-t-4xl p-6 space-y-3"
      >
        <h2 className="text-lg font-bold text-masjid-dark">بوست جديد</h2>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CommunityPost["category"])}
          className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-3"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="شاركي تجربتك أو اسألي..."
          className="w-full bg-white border-2 border-masjid/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-masjid"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-sand-dark py-3 rounded-2xl font-semibold"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={!content.trim() || busy}
            className="flex-1 bg-masjid text-sand py-3 rounded-2xl font-bold disabled:opacity-50"
          >
            {busy ? "..." : "نشر"}
          </button>
        </div>
      </form>
    </div>
  );
}
