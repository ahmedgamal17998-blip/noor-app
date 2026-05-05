"use client";

import { supabase, isSupabaseEnabled } from "./supabase";
import type { Mother, Child, Session, DailyTask } from "./storage";

type RemoteMother = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

type RemoteChild = {
  id: string;
  mother_id: string;
  name: string;
  age: number;
  total_xp: number;
  created_at: string;
};

type RemoteSession = {
  id: string;
  child_id: string;
  surah_number: number;
  ayah_number: number;
  is_correct: boolean;
  accuracy: number;
  mistakes: string[];
  xp_earned: number;
  created_at: string;
};

type RemoteDailyTask = {
  id: string;
  child_id: string;
  date: string;
  task_text: string;
  is_confirmed: boolean;
  confirmed_at: string | null;
};

const SYNC_QUEUE_KEY = "noor.sync.queue";
const SYNC_LAST_KEY = "noor.sync.last";

type QueueItem =
  | { kind: "mother.upsert"; mother: Mother & { email: string } }
  | { kind: "child.upsert"; child: Child }
  | { kind: "child.delete"; id: string }
  | { kind: "session.add"; session: Session }
  | { kind: "task.upsert"; task: DailyTask };

function readQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeQueue(q: QueueItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(q));
}

export function enqueue(item: QueueItem) {
  if (!isSupabaseEnabled) return;
  const q = readQueue();
  q.push(item);
  writeQueue(q);
  void flush();
}

let flushing = false;
export async function flush(): Promise<void> {
  if (!supabase || flushing) return;
  const session = await supabase.auth.getSession();
  if (!session.data.session) return;
  flushing = true;
  try {
    const q = readQueue();
    const remaining: QueueItem[] = [];
    for (const item of q) {
      const ok = await applyItem(item, session.data.session.user.id);
      if (!ok) remaining.push(item);
    }
    writeQueue(remaining);
    localStorage.setItem(SYNC_LAST_KEY, String(Date.now()));
  } finally {
    flushing = false;
  }
}

async function applyItem(item: QueueItem, userId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    switch (item.kind) {
      case "mother.upsert": {
        const { error } = await supabase.from("mothers").upsert({
          id: userId,
          name: item.mother.name,
          email: item.mother.email,
          created_at: new Date(item.mother.createdAt).toISOString(),
        });
        return !error;
      }
      case "child.upsert": {
        const { error } = await supabase.from("children").upsert({
          id: item.child.id,
          mother_id: userId,
          name: item.child.name,
          age: item.child.age,
          total_xp: item.child.totalXP,
          created_at: new Date(item.child.createdAt).toISOString(),
        });
        return !error;
      }
      case "child.delete": {
        const { error } = await supabase
          .from("children")
          .delete()
          .eq("id", item.id);
        return !error;
      }
      case "session.add": {
        const { error } = await supabase.from("sessions").upsert({
          id: item.session.id,
          child_id: item.session.childId,
          surah_number: item.session.surahNumber,
          ayah_number: item.session.ayahNumber,
          is_correct: item.session.isCorrect,
          accuracy: item.session.accuracy,
          mistakes: item.session.mistakes,
          xp_earned: item.session.xpEarned,
          created_at: new Date(item.session.createdAt).toISOString(),
        });
        return !error;
      }
      case "task.upsert": {
        const { error } = await supabase.from("daily_tasks").upsert({
          id: item.task.id,
          child_id: item.task.childId,
          date: item.task.date,
          task_text: item.task.taskText,
          is_confirmed: item.task.isConfirmed,
          confirmed_at: item.task.confirmedAt
            ? new Date(item.task.confirmedAt).toISOString()
            : null,
        });
        return !error;
      }
    }
  } catch {
    return false;
  }
}

export async function pullFromCloud(): Promise<{
  mother: Mother | null;
  children: Child[];
  sessions: Session[];
  tasks: DailyTask[];
} | null> {
  if (!supabase) return null;
  const session = await supabase.auth.getSession();
  if (!session.data.session) return null;
  const userId = session.data.session.user.id;

  const [m, c, s, t] = await Promise.all([
    supabase.from("mothers").select("*").eq("id", userId).maybeSingle(),
    supabase.from("children").select("*").eq("mother_id", userId),
    supabase.from("sessions").select("*"),
    supabase.from("daily_tasks").select("*"),
  ]);

  const mother: Mother | null = m.data
    ? {
        name: (m.data as RemoteMother).name,
        createdAt: new Date((m.data as RemoteMother).created_at).getTime(),
      }
    : null;

  const children: Child[] = ((c.data as RemoteChild[]) ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    age: r.age,
    totalXP: r.total_xp,
    createdAt: new Date(r.created_at).getTime(),
  }));

  const sessions: Session[] = ((s.data as RemoteSession[]) ?? []).map((r) => ({
    id: r.id,
    childId: r.child_id,
    surahNumber: r.surah_number,
    ayahNumber: r.ayah_number,
    isCorrect: r.is_correct,
    accuracy: r.accuracy,
    mistakes: r.mistakes ?? [],
    xpEarned: r.xp_earned,
    createdAt: new Date(r.created_at).getTime(),
  }));

  const tasks: DailyTask[] = ((t.data as RemoteDailyTask[]) ?? []).map((r) => ({
    id: r.id,
    childId: r.child_id,
    date: r.date,
    taskText: r.task_text,
    isConfirmed: r.is_confirmed,
    confirmedAt: r.confirmed_at
      ? new Date(r.confirmed_at).getTime()
      : undefined,
  }));

  return { mother, children, sessions, tasks };
}
