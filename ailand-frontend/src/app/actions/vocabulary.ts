"use server";

import { serverApiRequest } from "@/app/server/apiRequest";
import { vocabularyMock } from "@/lib/vocabularyMoc";
import type {
  RoomsListResponseBE,
  RoomSubjectsResponseBE,
  LearnedWordsResponseBE,
  InProgressWordsResponseBE,
  VocabularyUI,
  WordStatusUI,
  WordUI,
} from "@/types/vocabulary";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const PAGE_SIZE = 100;

export type OverallProgress = {
  totalWordsAllLevels: number;
  totalLearnedAllLevels: number;
  totalInProgressAllLevels: number;
  overallPercent: number;
};

export async function getOverallProgressAction(): Promise<OverallProgress> {
  try {
    const roomsRes = await serverApiRequest("/kg/rooms");
    
    if (!roomsRes.ok) {
      return { totalWordsAllLevels: 0, totalLearnedAllLevels: 0, totalInProgressAllLevels: 0, overallPercent: 0 };
    }
    
    const roomsData = (await roomsRes.json()) as RoomsListResponseBE;
    const totalWordsAllLevels = roomsData.rooms.reduce((sum, r) => sum + r.word_count, 0);
    
    let totalLearnedAllLevels = 0;
    let totalInProgressAllLevels = 0;
    
    // Fetch learned/in-progress counts for all levels
    try {
      for (const level of ["A1", "A2", "B1"]) {
        const [learnedRes, inProgRes] = await Promise.all([
          serverApiRequest(`/learning/words/learned?room_id=${level}&limit=1&offset=0`),
          serverApiRequest(`/learning/words/in-progress?room_id=${level}&limit=1&offset=0`),
        ]);
        
        if (learnedRes.ok) {
          const learned = await learnedRes.json() as LearnedWordsResponseBE;
          totalLearnedAllLevels += learned.total;
        }
        if (inProgRes.ok) {
          const inProg = await inProgRes.json() as InProgressWordsResponseBE;
          totalInProgressAllLevels += inProg.total;
        }
      }
    } catch {
      // Ignore auth errors
    }
    
    const overallPercent = totalWordsAllLevels > 0 
      ? parseFloat(((totalLearnedAllLevels / totalWordsAllLevels) * 100).toFixed(1))
      : 0;
    
    return {
      totalWordsAllLevels,
      totalLearnedAllLevels,
      totalInProgressAllLevels,
      overallPercent,
    };
  } catch {
    return { totalWordsAllLevels: 0, totalLearnedAllLevels: 0, totalInProgressAllLevels: 0, overallPercent: 0 };
  }
}

export async function getVocabularyAction(
  level: string,
  selectedRoomId?: string | null
): Promise<VocabularyUI & { totalWordsInLevel: number }> {
  if (USE_MOCK) return { ...vocabularyMock, totalWordsInLevel: 104 };

  try {
    const roomsRes = await serverApiRequest("/kg/rooms");
    const subjectsRes = await serverApiRequest(`/kg/rooms/${level}/subjects?limit=${PAGE_SIZE}&offset=0`);

    if (!roomsRes.ok) {
      const text = await roomsRes.text().catch(() => "");
      console.error("[Vocabulary] Failed to load rooms:", roomsRes.status, text);
      throw new Error(`HTTP ${roomsRes.status}: ${text || "Failed to load rooms"}`);
    }
    if (!subjectsRes.ok) {
      const text = await subjectsRes.text().catch(() => "");
      console.error("[Vocabulary] Failed to load subjects:", subjectsRes.status, text);
      throw new Error(`HTTP ${subjectsRes.status}: ${text || "Failed to load subjects"}`);
    }

    const roomsData = (await roomsRes.json()) as RoomsListResponseBE;
    const subjectsData = (await subjectsRes.json()) as RoomSubjectsResponseBE;
    const rooms = roomsData.rooms;
    const subjects = subjectsData.subjects;
    const roomId = selectedRoomId ?? (rooms[0]?.room_id ?? null);
    
    // Get total word count for this level from rooms data
    const currentRoom = rooms.find(r => r.room_id === level);
    const totalWordsInLevel = currentRoom?.word_count ?? subjects.length;

    console.log(`[Vocabulary] Loaded ${subjects.length} of ${totalWordsInLevel} subjects for level ${level}`);

    let learnedSet = new Set<string>();
    let inProgSet = new Set<string>();

    // These endpoints require auth, so we silently ignore failures
    try {
      const learnedRes = await serverApiRequest(
        `/learning/words/learned?room_id=${encodeURIComponent(level)}&limit=${PAGE_SIZE}&offset=0`
      );
      const inProgRes = await serverApiRequest(
        `/learning/words/in-progress?room_id=${encodeURIComponent(level)}&limit=${PAGE_SIZE}&offset=0`
      );

      if (learnedRes.ok && inProgRes.ok) {
        const [learned, inProg] = await Promise.all([
          learnedRes.json() as Promise<LearnedWordsResponseBE>,
          inProgRes.json() as Promise<InProgressWordsResponseBE>,
        ]);
        learnedSet = new Set(learned.words.map((w) => w.word_id));
        inProgSet = new Set(inProg.words.map((w) => w.word_id));
        console.log(`[Vocabulary] Learned: ${learnedSet.size}, In-progress: ${inProgSet.size}`);
      }
    } catch (progressError) {
      console.log("[Vocabulary] Could not fetch word progress (user may not be logged in)");
    }

    const words: WordUI[] = subjects.map((s) => {
      let status: WordStatusUI = "new";
      if (learnedSet.has(s.id)) status = "learned";
      else if (inProgSet.has(s.id)) status = "in_progress";
      return {
        id: s.id,
        german: s.german,
        english: s.english,
        pos: s.pos,
        status,
      };
    });

    const learnedCount = words.filter((w) => w.status === "learned").length;
    const inProgressCount = words.filter((w) => w.status === "in_progress").length;

    return {
      level,
      rooms,
      selectedRoomId: roomId,
      totals: {
        totalWords: words.length,
        learned: learnedCount,
        inProgress: inProgressCount,
      },
      words,
      totalWordsInLevel,
    };
  } catch (error) {
    console.error("[Vocabulary] Error fetching vocabulary:", error);
    throw error;
  }
}

export async function loadMoreWordsAction(
  level: string,
  offset: number
): Promise<{ words: WordUI[]; hasMore: boolean }> {
  try {
    const subjectsRes = await serverApiRequest(
      `/kg/rooms/${level}/subjects?limit=${PAGE_SIZE}&offset=${offset}`
    );

    if (!subjectsRes.ok) {
      const text = await subjectsRes.text().catch(() => "");
      console.error("[LoadMore] Failed to load subjects:", subjectsRes.status, text);
      throw new Error(`HTTP ${subjectsRes.status}: ${text || "Failed to load more words"}`);
    }

    const subjectsData = (await subjectsRes.json()) as RoomSubjectsResponseBE;
    const subjects = subjectsData.subjects;

    // Try to get word progress status
    let learnedSet = new Set<string>();
    let inProgSet = new Set<string>();

    try {
      const learnedRes = await serverApiRequest(
        `/learning/words/learned?room_id=${encodeURIComponent(level)}&limit=${PAGE_SIZE}&offset=0`
      );
      const inProgRes = await serverApiRequest(
        `/learning/words/in-progress?room_id=${encodeURIComponent(level)}&limit=${PAGE_SIZE}&offset=0`
      );

      if (learnedRes.ok && inProgRes.ok) {
        const [learned, inProg] = await Promise.all([
          learnedRes.json() as Promise<LearnedWordsResponseBE>,
          inProgRes.json() as Promise<InProgressWordsResponseBE>,
        ]);
        learnedSet = new Set(learned.words.map((w) => w.word_id));
        inProgSet = new Set(inProg.words.map((w) => w.word_id));
      }
    } catch {
      // Ignore auth errors
    }

    const words: WordUI[] = subjects.map((s) => {
      let status: WordStatusUI = "new";
      if (learnedSet.has(s.id)) status = "learned";
      else if (inProgSet.has(s.id)) status = "in_progress";
      return {
        id: s.id,
        german: s.german,
        english: s.english,
        pos: s.pos,
        status,
      };
    });

    return {
      words,
      hasMore: subjects.length === PAGE_SIZE,
    };
  } catch (error) {
    console.error("[LoadMore] Error:", error);
    throw error;
  }
}

export type WordDetails = {
  id: string;
  german: string;
  ipa: string | null;
  level: string;
  pos: string;
  gender: string | null;
  translations: string[];
  meanings_de: string[];
  meanings_en: string[];
  examples: string[];
};

export async function getWordDetailsAction(wordId: string): Promise<WordDetails | null> {
  try {
    const res = await serverApiRequest(`/kg/word/${encodeURIComponent(wordId)}`);
    
    if (!res.ok) {
      console.error("[WordDetails] Failed to fetch:", res.status);
      return null;
    }
    
    const data = await res.json();
    return data as WordDetails;
  } catch (error) {
    console.error("[WordDetails] Error:", error);
    return null;
  }
}

export type WordActionResult = {
  success: boolean;
  message: string;
  status?: "in_progress" | "learned";
};

export async function startWordAction(wordId: string, roomId: string): Promise<WordActionResult> {
  try {
    const res = await serverApiRequest("/learning/words/start", {
      method: "POST",
      body: JSON.stringify({ word_id: wordId, room_id: roomId }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return { success: false, message: data.detail || "Failed to start word" };
    }
    
    return { success: true, message: data.message, status: "in_progress" };
  } catch (error) {
    console.error("[StartWord] Error:", error);
    return { success: false, message: "Failed to start word" };
  }
}

export async function completeWordAction(wordId: string): Promise<WordActionResult> {
  try {
    const res = await serverApiRequest("/learning/words/complete", {
      method: "POST",
      body: JSON.stringify({ word_id: wordId }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      return { success: false, message: data.detail || "Failed to complete word" };
    }
    
    return { success: true, message: data.message, status: "learned" };
  } catch (error) {
    console.error("[CompleteWord] Error:", error);
    return { success: false, message: "Failed to complete word" };
  }
}

export type LearningStats = {
  totalWordsLearned: number;
  totalWordsInProgress: number;
  totalReviewCount: number;
  learningStreakDays: number;
  avgWordsPerDay: number;
  strongestLevel: string | null;
  weakestLevel: string | null;
  byLevel: {
    level: string;
    totalWords: number;
    learned: number;
    inProgress: number;
    notStarted: number;
    progressPercentage: number;
  }[];
  dailyProgress: {
    date: string;
    wordsLearned: number;
    wordsStarted: number;
  }[];
};

export async function getLearningStatsAction(): Promise<LearningStats | null> {
  try {
    const res = await serverApiRequest("/learning/words/stats");
    
    if (!res.ok) {
      console.error("[LearningStats] Failed to fetch:", res.status);
      return null;
    }
    
    const data = await res.json();
    
    return {
      totalWordsLearned: data.total_words_learned,
      totalWordsInProgress: data.total_words_in_progress,
      totalReviewCount: data.total_review_count,
      learningStreakDays: data.learning_streak_days,
      avgWordsPerDay: data.avg_words_per_day,
      strongestLevel: data.strongest_level,
      weakestLevel: data.weakest_level,
      byLevel: data.by_level.map((l: { level: string; total_words: number; learned: number; in_progress: number; not_started: number; progress_percentage: number }) => ({
        level: l.level,
        totalWords: l.total_words,
        learned: l.learned,
        inProgress: l.in_progress,
        notStarted: l.not_started,
        progressPercentage: l.progress_percentage,
      })),
      dailyProgress: data.daily_progress.map((d: { date: string; words_learned: number; words_started: number }) => ({
        date: d.date,
        wordsLearned: d.words_learned,
        wordsStarted: d.words_started,
      })),
    };
  } catch (error) {
    console.error("[LearningStats] Error:", error);
    return null;
  }
}

export type PointsData = {
  totalPoints: number;
  pointsToday: number;
  pointsThisWeek: number;
};

export async function getPointsAction(): Promise<PointsData | null> {
  try {
    const res = await serverApiRequest("/progress/points");
    
    if (!res.ok) {
      console.error("[Points] Failed to fetch:", res.status);
      return null;
    }
    
    const data = await res.json();
    return {
      totalPoints: data.total_points,
      pointsToday: data.points_today,
      pointsThisWeek: data.points_this_week,
    };
  } catch (error) {
    console.error("[Points] Error:", error);
    return null;
  }
}
