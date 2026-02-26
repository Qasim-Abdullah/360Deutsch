"use server";

import { cookies } from "next/headers";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function authFetch(path: string, options: RequestInit = {}) {
  const cookieStore = cookies();

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Cookie: cookieStore.toString(), // forward auth cookies
    },
    cache: "no-store",
  });
}

/* Points */

export async function getPointsAction() {
  try {
    const res = await authFetch("/progress/points");

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

/* Streak */

export async function getStreakAction() {
  try {
    const res = await authFetch("/progress/streak");

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

/* Level Complete */

export async function postLevelCompleteAction(levelId: string) {
  try {
    const res = await authFetch("/progress/level-complete", {
      method: "POST",
      body: JSON.stringify({ level_id: levelId }),
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

/* Full Progress */

export async function getUserProgressAction() {
  const [
    pointsRes,
    levelRes,
    streakRes,
    wordStatsRes,
    roomsRes,
  ] = await Promise.all([
    authFetch("/progress/points"),
    authFetch("/progress/level"),
    authFetch("/progress/streak"),
    authFetch("/learning/words/stats"),
    authFetch("/kg/rooms/progress"),
  ]);

  if (
    !pointsRes.ok ||
    !levelRes.ok ||
    !streakRes.ok ||
    !wordStatsRes.ok ||
    !roomsRes.ok
  ) {
    return null;
  }

  const [
    points,
    level,
    streak,
    wordStats,
    roomsProgress,
  ] = await Promise.all([
    pointsRes.json(),
    levelRes.json(),
    streakRes.json(),
    wordStatsRes.json(),
    roomsRes.json(),
  ]);

  return {
    totalPoints: points.total_points,
    roomsCompleted: roomsProgress.completed_rooms,
    totalRooms: roomsProgress.total_rooms,
    levelsCompleted: level.level,
    wordsLearned: wordStats.total_words_learned,
    dayStreak: streak.current_streak,
  };
}

/* Points calculation constants */
const POINTS_PER_WORD = 5;
const POINTS_PER_LEVEL = 10;
const POINTS_PER_ROOM = 50;

/* Roadmap Progress - for sidebar and roadmap display */
export async function getRoadmapProgressAction(): Promise<{
  roomsCompleted: number;
  totalRooms: number;
} | null> {
  try {
    const res = await authFetch("/kg/rooms/progress");
    if (!res.ok) return null;
    const data = await res.json();
    return {
      roomsCompleted: data.completed_rooms || 0,
      totalRooms: data.total_rooms || 4,
    };
  } catch {
    return null;
  }
}

/* Calculated Points - based on words learned, levels completed, rooms completed */
export async function getCalculatedPointsAction(): Promise<{
  total_points: number;
  wordsLearned: number;
  levelsCompleted: number;
  roomsCompleted: number;
} | null> {
  try {
    const [wordStatsRes, levelRes, roomsRes] = await Promise.all([
      authFetch("/learning/words/stats"),
      authFetch("/progress/level"),
      authFetch("/kg/rooms/progress"),
    ]);

    // Default values if endpoints fail
    let wordsLearned = 0;
    let levelsCompleted = 0;
    let roomsCompleted = 0;

    if (wordStatsRes.ok) {
      const wordStats = await wordStatsRes.json();
      wordsLearned = wordStats.total_words_learned || 0;
    }

    if (levelRes.ok) {
      const level = await levelRes.json();
      levelsCompleted = level.level || 0;
    }

    if (roomsRes.ok) {
      const roomsProgress = await roomsRes.json();
      roomsCompleted = roomsProgress.completed_rooms || 0;
    }

    // Calculate total points: 5 pts/word + 10 pts/level + 50 pts/room
    const total_points = 
      (wordsLearned * POINTS_PER_WORD) + 
      (levelsCompleted * POINTS_PER_LEVEL) + 
      (roomsCompleted * POINTS_PER_ROOM);

    return {
      total_points,
      wordsLearned,
      levelsCompleted,
      roomsCompleted,
    };
  } catch {
    return null;
  }
}