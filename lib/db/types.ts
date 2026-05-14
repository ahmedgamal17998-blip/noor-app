// Database types matching the v2 schema in supabase/migrations/0001_v2_schema.sql

export type Mother = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  parent_password: string | null;
  subscription_plan: "free" | "basic" | "premium";
  subscription_status: "trial" | "active" | "canceled";
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Child = {
  id: string;
  mother_id: string;
  name: string;
  age: number;
  gender: "boy" | "girl" | null;
  avatar_config: Record<string, unknown>;
  school_schedule: Record<string, unknown> | null;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_active_at: string | null;
  created_at: string;
};

export type Admin = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "super_admin";
  permissions: Record<string, unknown>;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

export type Surah = {
  id: string;
  surah_number: number;
  name_arabic: string;
  name_english: string | null;
  total_ayahs: number;
  revelation_type: "meccan" | "medinan" | null;
  level_order: number;
  is_active: boolean;
  required_plan: "basic" | "premium";
  created_at: string;
};

export type Ayah = {
  id: string;
  surah_id: string;
  ayah_number: number;
  text_arabic: string;
  text_with_tashkeel: string;
  audio_url: string | null;
  audio_url_repeat: string | null;
};

export type SurahStory = {
  id: string;
  surah_id: string;
  title: string;
  reason_of_revelation: string | null;
  story_text: string;
  story_image_url: string | null;
  story_audio_url: string | null;
  story_video_url: string | null;
  meaning_simplified: string | null;
  age_range: string;
  language: "ar" | "en";
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type LifeMission = {
  id: string;
  surah_id: string;
  title: string;
  description: string;
  target_audience: "with_mother" | "with_siblings" | "alone";
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
  display_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
};

export type ComprehensionQuestion = {
  id: string;
  surah_id: string;
  question_text: string;
  correct_answer: string;
  options: string[] | null;
  question_type: "open" | "mcq" | "true_false";
  xp_reward: number;
  is_active: boolean;
};

export type StepType =
  | "listen"
  | "story"
  | "listen_repeat"
  | "recite_to_mom"
  | "tell_story"
  | "life_mission"
  | "comprehension"
  | "ai_recite";

export type SurahStep = {
  id: string;
  surah_id: string;
  step_number: number;
  step_type: StepType;
  step_title: string;
  step_description: string | null;
  config: Record<string, unknown>;
  required_completion_count: number;
  requires_mother_approval: boolean;
  xp_reward: number;
  display_order: number;
  is_active: boolean;
  video_url: string | null;
};

export type ChildSurahProgress = {
  id: string;
  child_id: string;
  surah_id: string;
  current_step: number;
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
  total_xp_earned: number;
};

export type StepCompletion = {
  id: string;
  child_id: string;
  step_id: string;
  completion_count: number;
  approved_by_mother: boolean;
  approved_at: string | null;
  xp_earned: number;
  completed_at: string;
};

export type MissionCompletion = {
  id: string;
  child_id: string;
  mission_id: string;
  mother_note: string | null;
  is_confirmed: boolean;
  confirmed_at: string | null;
  xp_earned: number;
  created_at: string;
};

export type AvatarItem = {
  id: string;
  item_type: "head" | "body" | "accessory" | "background";
  item_name: string;
  item_image_url: string;
  xp_cost: number;
  gender: "boy" | "girl" | "both";
  category: string;
  is_active: boolean;
};

export type ChildAvatarItem = {
  id: string;
  child_id: string;
  item_id: string;
  purchased_at: string;
};

export type Achievement = {
  id: string;
  child_id: string;
  achievement_type: string;
  title: string;
  description: string | null;
  badge_image_url: string | null;
  unlocked_at: string;
};

export type CommunityPost = {
  id: string;
  mother_id: string;
  content: string;
  category: "general" | "tips" | "questions" | "success_stories";
  likes_count: number;
  is_pinned: boolean;
  is_hidden: boolean;
  created_at: string;
};

export type CommunityComment = {
  id: string;
  post_id: string;
  mother_id: string;
  content: string;
  is_hidden: boolean;
  created_at: string;
};

export type PostLike = {
  id: string;
  post_id: string;
  mother_id: string;
};
