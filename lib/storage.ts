"use client";

export type Mother = {
  name: string;
  createdAt: number;
};

export type Child = {
  id: string;
  name: string;
  age: number;
  totalXP: number;
  createdAt: number;
};

export type Session = {
  id: string;
  childId: string;
  surahNumber: number;
  ayahNumber: number;
  isCorrect: boolean;
  accuracy: number;
  mistakes: string[];
  xpEarned: number;
  createdAt: number;
};

export type DailyTask = {
  id: string;
  childId: string;
  date: string;
  taskText: string;
  isConfirmed: boolean;
  confirmedAt?: number;
};

const KEYS = {
  mother: "noor.mother",
  children: "noor.children",
  sessions: "noor.sessions",
  tasks: "noor.tasks",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getMother(): Mother | null {
    return read<Mother | null>(KEYS.mother, null);
  },
  setMother(name: string): Mother {
    const mother: Mother = { name, createdAt: Date.now() };
    write(KEYS.mother, mother);
    return mother;
  },

  getChildren(): Child[] {
    return read<Child[]>(KEYS.children, []);
  },
  getChild(id: string): Child | undefined {
    return this.getChildren().find((c) => c.id === id);
  },
  addChild(name: string, age: number): Child {
    const children = this.getChildren();
    const child: Child = {
      id: crypto.randomUUID(),
      name,
      age,
      totalXP: 0,
      createdAt: Date.now(),
    };
    children.push(child);
    write(KEYS.children, children);
    return child;
  },
  addXP(childId: string, xp: number): void {
    const children = this.getChildren();
    const idx = children.findIndex((c) => c.id === childId);
    if (idx >= 0) {
      children[idx].totalXP += xp;
      write(KEYS.children, children);
    }
  },
  removeChild(childId: string): void {
    const children = this.getChildren().filter((c) => c.id !== childId);
    write(KEYS.children, children);
    const sessions = read<Session[]>(KEYS.sessions, []).filter(
      (s) => s.childId !== childId,
    );
    write(KEYS.sessions, sessions);
    const tasks = read<DailyTask[]>(KEYS.tasks, []).filter(
      (t) => t.childId !== childId,
    );
    write(KEYS.tasks, tasks);
  },
  resetAll(): void {
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },

  getSessions(childId?: string): Session[] {
    const all = read<Session[]>(KEYS.sessions, []);
    return childId ? all.filter((s) => s.childId === childId) : all;
  },
  addSession(s: Omit<Session, "id" | "createdAt">): Session {
    const sessions = read<Session[]>(KEYS.sessions, []);
    const session: Session = { ...s, id: crypto.randomUUID(), createdAt: Date.now() };
    sessions.push(session);
    write(KEYS.sessions, sessions);
    return session;
  },

  getTodayTask(childId: string): DailyTask | null {
    const today = new Date().toISOString().slice(0, 10);
    const tasks = read<DailyTask[]>(KEYS.tasks, []);
    return tasks.find((t) => t.childId === childId && t.date === today) ?? null;
  },
  setTodayTask(childId: string, taskText: string): DailyTask {
    const today = new Date().toISOString().slice(0, 10);
    const tasks = read<DailyTask[]>(KEYS.tasks, []);
    const idx = tasks.findIndex((t) => t.childId === childId && t.date === today);
    const task: DailyTask = {
      id: idx >= 0 ? tasks[idx].id : crypto.randomUUID(),
      childId,
      date: today,
      taskText,
      isConfirmed: idx >= 0 ? tasks[idx].isConfirmed : false,
      confirmedAt: idx >= 0 ? tasks[idx].confirmedAt : undefined,
    };
    if (idx >= 0) tasks[idx] = task;
    else tasks.push(task);
    write(KEYS.tasks, tasks);
    return task;
  },
  confirmTodayTask(childId: string): void {
    const today = new Date().toISOString().slice(0, 10);
    const tasks = read<DailyTask[]>(KEYS.tasks, []);
    const idx = tasks.findIndex((t) => t.childId === childId && t.date === today);
    if (idx >= 0) {
      tasks[idx].isConfirmed = true;
      tasks[idx].confirmedAt = Date.now();
      write(KEYS.tasks, tasks);
    }
  },
};
