"use client";

import { useEffect, useState } from "react";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { Main } from "@/components/layout/main";
import type { UserProgressUI } from "@/types/progress";
import { getLearningStatsAction, getPointsAction } from "@/app/actions/vocabulary";

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<UserProgressUI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgressData() {
      setLoading(true);
      try {
        const [stats, points] = await Promise.all([
          getLearningStatsAction(),
          getPointsAction(),
        ]);

        if (!stats || !points) {
          setProgressData(null);
          setLoading(false);
          return;
        }

        // Calculate total words across all levels
        const totalWordsAllLevels = stats.byLevel.reduce((sum, l) => sum + l.totalWords, 0);
        const totalLearned = stats.byLevel.reduce((sum, l) => sum + l.learned, 0);
        const totalInProgress = stats.byLevel.reduce((sum, l) => sum + l.inProgress, 0);
        const totalNotStarted = stats.byLevel.reduce((sum, l) => sum + l.notStarted, 0);

        // Determine current level based on words learned
        // A1: 0-999 words, A2: 1000-2999 words, B1: 3000+ words
        let currentLevel = "A1";
        let levelProgressPercent = 0;
        
        if (totalLearned >= 3000) {
          currentLevel = "B1";
          // B1 progress: words beyond 3000, target could be all remaining words
          const b1Target = totalWordsAllLevels - 3000;
          levelProgressPercent = b1Target > 0 ? Math.min(100, Math.round(((totalLearned - 3000) / b1Target) * 100)) : 100;
        } else if (totalLearned >= 1000) {
          currentLevel = "A2";
          // A2 progress: 1000-2999 words (2000 word range)
          levelProgressPercent = Math.round(((totalLearned - 1000) / 2000) * 100);
        } else {
          currentLevel = "A1";
          // A1 progress: 0-999 words (1000 word range)
          levelProgressPercent = Math.round((totalLearned / 1000) * 100);
        }

        // Calculate overall progress percentage (with 1 decimal place)
        const overallProgress = totalWordsAllLevels > 0 
          ? parseFloat(((totalLearned / totalWordsAllLevels) * 100).toFixed(1))
          : 0;

        // Build weekly activity from daily progress (last 7 days)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const last7Days = stats.dailyProgress.slice(-7);
        const weeklyDays = last7Days.map((d) => {
          const date = new Date(d.date);
          return {
            day: dayNames[date.getDay()],
            value: d.wordsLearned + d.wordsStarted,
            date: d.date,
          };
        });

        // Find most active day
        const maxActivity = Math.max(...weeklyDays.map(d => d.value));
        const mostActiveDay = weeklyDays.find(d => d.value === maxActivity)?.day || "None";

        // Count completed rooms (levels with 100% progress)
        const completedRooms = stats.byLevel.filter(l => l.progressPercentage >= 100).length;

        const progressUI: UserProgressUI = {
          roomsCompleted: completedRooms,
          totalRooms: stats.byLevel.length,
          levelsCompleted: completedRooms,
          wordsLearned: totalLearned,
          totalWords: totalWordsAllLevels,
          dayStreak: stats.learningStreakDays,
          totalPoints: points.totalPoints,
          pointsToday: points.pointsToday,
          pointsThisWeek: points.pointsThisWeek,
          vocabularyProgress: {
            mastered: totalLearned,
            learning: totalInProgress,
            inProgress: totalInProgress,
            notStarted: totalNotStarted,
          },
          weeklyActivity: {
            currentWeek: Math.ceil(new Date().getDate() / 7),
            days: weeklyDays,
            mostActiveDay,
          },
          levelProgress: {
            current: currentLevel,
            progressPercent: levelProgressPercent,
            overallProgressPercent: overallProgress,
            milestones: ["A1", "A2", "B1"],
          },
        };

        setProgressData(progressUI);
      } catch (error) {
        console.error("Failed to load progress data:", error);
        setProgressData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <Main fixed className="pt-2">
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#5a47c7] border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">Loading progress...</p>
          </div>
        </div>
      </Main>
    );
  }

  if (!progressData) {
    return (
      <Main fixed className="pt-2">
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Unable to load progress data.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#5a47c7] text-white rounded-lg hover:bg-[#4a3ab7] transition-colors"
          >
            Retry
          </button>
        </div>
      </Main>
    );
  }

  return (
    <Main fixed className="pt-2">
      <ProgressDashboard initialData={progressData} />
    </Main>
  );
}
