"use client";

import { useEffect } from "react";
import { onAuthChange, getCurrentSession } from "@/lib/supabase";
import { flush, pullFromCloud } from "@/lib/sync";
import { storage } from "@/lib/storage";

export function SyncBootstrap() {
  useEffect(() => {
    let cancelled = false;

    const merge = async () => {
      const remote = await pullFromCloud();
      if (cancelled || !remote) return;

      if (remote.mother) {
        storage.setMotherFromCloud(remote.mother);
      }

      const localChildren = storage.getChildren();
      const childIds = new Set(localChildren.map((c) => c.id));
      const merged = [
        ...localChildren,
        ...remote.children.filter((c) => !childIds.has(c.id)),
      ];
      storage.setChildren(merged);

      const localSessions = storage.getSessions();
      const sessIds = new Set(localSessions.map((s) => s.id));
      storage.setSessions([
        ...localSessions,
        ...remote.sessions.filter((s) => !sessIds.has(s.id)),
      ]);

      const localTasks = storage.getAllTasks();
      const taskIds = new Set(localTasks.map((t) => t.id));
      storage.setTasks([
        ...localTasks,
        ...remote.tasks.filter((t) => !taskIds.has(t.id)),
      ]);

      await flush();
    };

    void getCurrentSession().then((s) => {
      if (s) void merge();
    });

    const unsub = onAuthChange((session) => {
      if (session) {
        void merge();
      }
    });

    const onlineHandler = () => void flush();
    window.addEventListener("online", onlineHandler);

    return () => {
      cancelled = true;
      unsub();
      window.removeEventListener("online", onlineHandler);
    };
  }, []);

  return null;
}
