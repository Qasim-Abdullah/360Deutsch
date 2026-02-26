"use client";

import { useEffect, useState, useCallback } from "react";
import { getRoadmapProgressAction } from "@/app/actions/progress";

export const PROGRESS_STORAGE_KEY = "progress";

type Progress = {
  roomsCompleted: number;
  totalRooms: number;
};

const DEFAULT_PROGRESS: Progress = {
  roomsCompleted: 0,
  totalRooms: 4,
};

function readProgressFromStorage(): Progress {
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (saved) return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
  } catch {
    // ignore
  }
  return DEFAULT_PROGRESS;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);

  const loadProgress = useCallback(async () => {
    const server = await getRoadmapProgressAction();
    if (server != null) {
      setProgress({ roomsCompleted: server.roomsCompleted, totalRooms: server.totalRooms });
      return;
    }
    // No server data (e.g. not authenticated): use 0 so new users only have level 1 unlocked
    setProgress(DEFAULT_PROGRESS);
  }, []);

  useEffect(() => {
    loadProgress();
    const handler = () => loadProgress();
    window.addEventListener("progress-updated", handler);
    return () => window.removeEventListener("progress-updated", handler);
  }, [loadProgress]);

  const updateProgress = (next: Progress) => {
    setProgress(next);
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("progress-updated"));
  };

  return { progress, updateProgress };
}
