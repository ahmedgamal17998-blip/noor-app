"use client";

import { supabase } from "@/lib/supabase";
import type {
  Surah,
  Ayah,
  SurahStory,
  LifeMission,
  SurahStep,
  ChildSurahProgress,
  StepCompletion,
  MissionCompletion,
  AvatarItem,
  ChildAvatarItem,
  Achievement,
  CommunityPost,
  CommunityComment,
  Child,
  Mother,
  Admin,
} from "./types";

// ════════════════════════════════════════════════════════════════
// READ helpers — anon-key safe (use everywhere on client)
// ════════════════════════════════════════════════════════════════

export async function getActiveSurahs(): Promise<Surah[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("surahs")
    .select("*")
    .eq("is_active", true)
    .order("level_order");
  return (data ?? []) as Surah[];
}

export async function getSurah(surahId: string): Promise<Surah | null> {
  if (!supabase) return null;
  const { data } = await supabase.from("surahs").select("*").eq("id", surahId).maybeSingle();
  return data as Surah | null;
}

export async function getSurahBySlug(surahNumber: number): Promise<Surah | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("surahs")
    .select("*")
    .eq("surah_number", surahNumber)
    .maybeSingle();
  return data as Surah | null;
}

export async function getAyahs(surahId: string): Promise<Ayah[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("ayahs")
    .select("*")
    .eq("surah_id", surahId)
    .order("ayah_number");
  return (data ?? []) as Ayah[];
}

export async function getStory(surahId: string): Promise<SurahStory | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("surah_stories")
    .select("*")
    .eq("surah_id", surahId)
    .eq("is_active", true)
    .maybeSingle();
  return data as SurahStory | null;
}

export async function getMissions(surahId: string): Promise<LifeMission[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("life_missions")
    .select("*")
    .eq("surah_id", surahId)
    .eq("is_active", true)
    .order("display_order");
  return (data ?? []) as LifeMission[];
}

export async function getSurahSteps(surahId: string): Promise<SurahStep[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("surah_steps")
    .select("*")
    .eq("surah_id", surahId)
    .eq("is_active", true)
    .order("display_order");
  return (data ?? []) as SurahStep[];
}

export async function getChildProgress(
  childId: string,
  surahId: string,
): Promise<ChildSurahProgress | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("child_surah_progress")
    .select("*")
    .eq("child_id", childId)
    .eq("surah_id", surahId)
    .maybeSingle();
  return data as ChildSurahProgress | null;
}

export async function getAllChildProgress(childId: string): Promise<ChildSurahProgress[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("child_surah_progress")
    .select("*")
    .eq("child_id", childId);
  return (data ?? []) as ChildSurahProgress[];
}

export async function getStepCompletions(
  childId: string,
  surahId: string,
): Promise<StepCompletion[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("step_completions")
    .select("*, surah_steps!inner(surah_id)")
    .eq("child_id", childId)
    .eq("surah_steps.surah_id", surahId);
  return (data ?? []) as StepCompletion[];
}

export async function getAvatarItems(): Promise<AvatarItem[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("avatar_items")
    .select("*")
    .eq("is_active", true)
    .order("xp_cost");
  return (data ?? []) as AvatarItem[];
}

export async function getChildAvatarItems(childId: string): Promise<ChildAvatarItem[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("child_avatar_items")
    .select("*")
    .eq("child_id", childId);
  return (data ?? []) as ChildAvatarItem[];
}

export async function getAchievements(childId: string): Promise<Achievement[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("achievements")
    .select("*")
    .eq("child_id", childId)
    .order("unlocked_at", { ascending: false });
  return (data ?? []) as Achievement[];
}

export async function getCommunityPosts(
  limit = 20,
): Promise<Array<CommunityPost & { mother_name: string }>> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("community_posts")
    .select("*, mothers(full_name)")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((p) => ({
    ...(p as CommunityPost),
    mother_name:
      ((p as unknown as { mothers?: { full_name?: string } }).mothers?.full_name as string) ??
      "أم",
  }));
}

export async function getPostComments(postId: string): Promise<
  Array<CommunityComment & { mother_name: string }>
> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("community_comments")
    .select("*, mothers(full_name)")
    .eq("post_id", postId)
    .eq("is_hidden", false)
    .order("created_at");
  return (data ?? []).map((c) => ({
    ...(c as CommunityComment),
    mother_name:
      ((c as unknown as { mothers?: { full_name?: string } }).mothers?.full_name as string) ??
      "أم",
  }));
}

export async function getMyChildren(): Promise<Child[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("children").select("*").order("created_at");
  return (data ?? []) as Child[];
}

export async function getMyProfile(): Promise<Mother | null> {
  if (!supabase) return null;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const { data } = await supabase
    .from("mothers")
    .select("*")
    .eq("id", session.session.user.id)
    .maybeSingle();
  return data as Mother | null;
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .eq("is_active", true)
    .maybeSingle();
  return data as Admin | null;
}

// ════════════════════════════════════════════════════════════════
// WRITE helpers
// ════════════════════════════════════════════════════════════════

export async function recordStepCompletion(
  childId: string,
  stepId: string,
  xp: number,
  requiresApproval = false,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "no supabase" };
  const { error } = await supabase.from("step_completions").insert({
    child_id: childId,
    step_id: stepId,
    completion_count: 1,
    approved_by_mother: !requiresApproval,
    approved_at: requiresApproval ? null : new Date().toISOString(),
    xp_earned: requiresApproval ? 0 : xp,
  });
  if (!error && !requiresApproval) {
    await supabase.rpc("increment_child_xp", { p_child_id: childId, p_xp: xp }).then(() => {});
    // Fallback: direct update if RPC missing
    const { data: child } = await supabase
      .from("children")
      .select("total_xp")
      .eq("id", childId)
      .maybeSingle();
    if (child) {
      await supabase
        .from("children")
        .update({ total_xp: (child.total_xp ?? 0) + xp })
        .eq("id", childId);
    }
  }
  return { ok: !error, error: error?.message };
}

export async function approveStepCompletion(completionId: string, xp: number) {
  if (!supabase) return;
  await supabase
    .from("step_completions")
    .update({
      approved_by_mother: true,
      approved_at: new Date().toISOString(),
      xp_earned: xp,
    })
    .eq("id", completionId);
}

export async function upsertProgress(
  childId: string,
  surahId: string,
  currentStep: number,
  isCompleted: boolean,
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from("child_surah_progress")
    .upsert(
      {
        child_id: childId,
        surah_id: surahId,
        current_step: currentStep,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      },
      { onConflict: "child_id,surah_id" },
    );
}

export async function purchaseAvatarItem(
  childId: string,
  itemId: string,
  cost: number,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "no supabase" };
  const { data: child } = await supabase
    .from("children")
    .select("total_xp")
    .eq("id", childId)
    .maybeSingle();
  if (!child || (child.total_xp ?? 0) < cost) {
    return { ok: false, error: "نقاط مش كافية" };
  }
  const { error } = await supabase
    .from("child_avatar_items")
    .insert({ child_id: childId, item_id: itemId });
  if (error) return { ok: false, error: error.message };
  await supabase
    .from("children")
    .update({ total_xp: (child.total_xp ?? 0) - cost })
    .eq("id", childId);
  return { ok: true };
}

export async function createPost(content: string, category: CommunityPost["category"]) {
  if (!supabase) return;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return;
  await supabase.from("community_posts").insert({
    mother_id: session.session.user.id,
    content,
    category,
  });
}

export async function toggleLike(postId: string) {
  if (!supabase) return;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return;
  const userId = session.session.user.id;
  const { data: existing } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("mother_id", userId)
    .maybeSingle();
  if (existing) {
    await supabase.from("post_likes").delete().eq("id", existing.id);
    await supabase.rpc("decrement_post_likes", { p_post_id: postId }).then(() => {});
  } else {
    await supabase.from("post_likes").insert({ post_id: postId, mother_id: userId });
    await supabase.rpc("increment_post_likes", { p_post_id: postId }).then(() => {});
  }
}

export async function addComment(postId: string, content: string) {
  if (!supabase) return;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return;
  await supabase.from("community_comments").insert({
    post_id: postId,
    mother_id: session.session.user.id,
    content,
  });
}
