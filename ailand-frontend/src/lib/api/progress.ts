import { apiFetch } from "@/lib/api/client";
import type {
  PointsResponseBE,
  LevelResponseBE,
  StreakResponseBE,
  WordStatsBE,
  RoomsProgressBE,
  UserProgressUI,
} from "@/types/progress";

/** Build UI shape from backend responses (shared by client fetch and server action). */
export function buildUserProgressUI(
  points: PointsResponseBE,
  level: LevelResponseBE,
  streak: StreakResponseBE,
  wordStats: WordStatsBE,
  roomsProgress: RoomsProgressBE
): UserProgressUI {
  const weeklyActivity = calculateWeeklyActivityFromDaily(wordStats.daily_progress);
  const totalWords = Math.max(
    wordStats.total_words_learned + wordStats.total_words_in_progress,
    1
  );
  const mastered = wordStats.total_words_learned;
  const inProgress = wordStats.total_words_in_progress;
  const learning = 0;
  const notStarted = Math.max(totalWords - (mastered + inProgress + learning), 0);
  const milestones = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  // Overall progress 0–100% across levels 1–10 so bar and milestones match backend
  const overallProgressPercent =
    level.level >= 10
      ? 100
      : Math.round(((level.level - 1) + level.progress_percentage / 100) / 9 * 100);

  return {
    roomsCompleted: roomsProgress.completed_rooms,
    totalRooms: roomsProgress.total_rooms,
    levelsCompleted: level.level,
    wordsLearned: wordStats.total_words_learned,
    totalWords,
    dayStreak: streak.current_streak,
    vocabularyProgress: { mastered, learning, inProgress, notStarted },
    weeklyActivity,
    levelProgress: {
      current: `Level ${level.level} • ${level.title}`,
      progressPercent: Math.round(level.progress_percentage),
      overallProgressPercent,
      milestones,
    },
    totalPoints: points.total_points,
    pointsToday: points.points_today,
    pointsThisWeek: points.points_this_week,
  };
}

/** Client-side: uses localStorage token (use getUserProgressAction from dashboard for cookie auth). */
export async function getUserProgress(): Promise<UserProgressUI> {
  const [points, level, streak, wordStats, roomsProgress] = await Promise.all([
    apiFetch<PointsResponseBE>("/progress/points"),
    apiFetch<LevelResponseBE>("/progress/level"),
    apiFetch<StreakResponseBE>("/progress/streak"),
    apiFetch<WordStatsBE>("/learning/words/stats"),
    apiFetch<RoomsProgressBE>("/kg/rooms/progress"),
  ]);
  return buildUserProgressUI(points, level, streak, wordStats, roomsProgress);
}

function calculateWeeklyActivityFromDaily(
  daily: { date: string; words_learned: number; words_started: number }[]
): UserProgressUI["weeklyActivity"] {
  const today = new Date();

  const map = new Map<string, number>();
  for (const d of daily) {
    map.set(d.date, (d.words_learned || 0) + (d.words_started || 0));
  }

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const fullDayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    const iso = dt.toISOString().slice(0, 10);

    days.push({
      day: dayNames[dt.getDay()],
      value: map.get(iso) ?? 0,
      date: iso,
    });
  }

  const max = Math.max(...days.map((x) => x.value));
  const maxIdx = days.findIndex((x) => x.value === max);
  const mostActiveDay =
    maxIdx >= 0 ? fullDayNames[new Date(days[maxIdx].date).getDay()] : "—";

  return {
    currentWeek: getWeekNumber(today),
    days,
    mostActiveDay,
  };
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
