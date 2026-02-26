"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { postLevelCompleteAction } from "@/app/actions/progress";
import { getLearningStatsAction } from "@/app/actions/vocabulary";
import { PROGRESS_STORAGE_KEY } from "@/lib/useProgress";

const STORAGE_KEY = "ailand-level-points";
const POINTS_PER_WORD = 5;
const POINTS_PER_LEVEL = 10;
const POINTS_PER_ROOM = 50;
const TOTAL_ROOMS = 5;

type PointsState = {
  points: number;
  streak: number;
  addPoints: (amount: number) => void;
  refreshPoints: () => Promise<void>;
  reportLevelComplete: (pathname: string) => Promise<void>;
};

const PointsContext = createContext<PointsState | null>(null);

function levelIdFromPathname(pathname: string): string | null {
  const m = pathname.match(/\/level(\d+)$/);
  if (!m) return null;
  return `level${m[1]}`;
}

function levelNumberFromPathname(pathname: string): number | null {
  const m = pathname.match(/\/level(\d+)$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isNaN(n) ? null : n;
}

const LEVELS_PER_ROOM = 4;

/** Persist completed level so roadmap unlocks the next, and mark room complete when all levels done. */
function markLevelCompletedInProgress(pathname: string) {
  const levelNum = levelNumberFromPathname(pathname);
  if (levelNum == null || levelNum < 1) return;
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const totalRooms = typeof data.totalRooms === "number" ? data.totalRooms : TOTAL_ROOMS;

    // Track individual completed levels
    const completedLevels: number[] = Array.isArray(data.completedLevels) ? data.completedLevels : [];
    if (!completedLevels.includes(levelNum)) {
      completedLevels.push(levelNum);
    }

    // Room 1 is complete only when all 4 levels are done
    const allLevelsDone = Array.from({ length: LEVELS_PER_ROOM }, (_, i) => i + 1).every(
      (l) => completedLevels.includes(l)
    );
    const prev = typeof data.roomsCompleted === "number" ? data.roomsCompleted : 0;
    const roomsCompleted = allLevelsDone ? Math.max(prev, 1) : prev;

    const next = { roomsCompleted, totalRooms, completedLevels };
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("progress-updated"));
  } catch {
    // ignore
  }
}

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const useBackendRef = useRef<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLearningStatsAction().then((stats) => {
      if (cancelled) return;
      if (stats) {
        useBackendRef.current = true;
        // Calculate points: 5 pts/word + 10 pts/level (completed rooms count as levels)
        const completedRooms = stats.byLevel.filter(l => l.progressPercentage >= 100).length;
        const calculatedPoints = 
          (stats.totalWordsLearned * POINTS_PER_WORD) + 
          (completedRooms * POINTS_PER_LEVEL) + 
          (completedRooms * POINTS_PER_ROOM);
        setPoints(calculatedPoints);
        setStreak(stats.learningStreakDays);
      } else {
        useBackendRef.current = false;
        setPoints(0);
        setStreak(0);
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || useBackendRef.current !== false) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(points));
    } catch {
      // ignore
    }
  }, [points, hydrated]);

  const addPoints = useCallback((amount: number) => {
    setPoints((prev) => prev + Math.max(0, amount));
  }, []);

  const refreshPoints = useCallback(async () => {
    const stats = await getLearningStatsAction();
    if (stats) {
      const completedRooms = stats.byLevel.filter(l => l.progressPercentage >= 100).length;
      const calculatedPoints = 
        (stats.totalWordsLearned * POINTS_PER_WORD) + 
        (completedRooms * POINTS_PER_LEVEL) + 
        (completedRooms * POINTS_PER_ROOM);
      setPoints(calculatedPoints);
      setStreak(stats.learningStreakDays);
    }
  }, []);

  const reportLevelComplete = useCallback(async (pathname: string) => {
    const levelId = levelIdFromPathname(pathname);
    if (!levelId) return;
    markLevelCompletedInProgress(pathname);
    // Report to backend
    await postLevelCompleteAction(levelId);
    // Recalculate points based on current progress
    const stats = await getLearningStatsAction();
    if (stats) {
      const completedRooms = stats.byLevel.filter(l => l.progressPercentage >= 100).length;
      const calculatedPoints = 
        (stats.totalWordsLearned * POINTS_PER_WORD) + 
        (completedRooms * POINTS_PER_LEVEL) + 
        (completedRooms * POINTS_PER_ROOM);
      setPoints(calculatedPoints);
      setStreak(stats.learningStreakDays);
    } else {
      addPoints(POINTS_PER_LEVEL);
    }
    window.dispatchEvent(new Event("progress-updated"));
  }, [addPoints]);

  return (
    <PointsContext.Provider value={{ points, streak, addPoints, refreshPoints, reportLevelComplete }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const ctx = useContext(PointsContext);
  if (!ctx) {
    throw new Error("usePoints must be used within PointsProvider");
  }
  return ctx;
}
