"use client";

import React from "react";
import { Award, BookOpen, Flame } from "lucide-react";
import type { UserProgressUI } from "@/types/progress";
import { StatCard } from "./StatCard";
import { LevelProgressBar } from "./LevelProgressBar";
import { VocabularyBreakdown } from "./VocabularyBreakdown";
import { WeeklyActivity } from "./WeeklyActivity";
import { Separator } from "@/components/ui/sidebar/separator";

type ProgressDashboardProps = {
  initialData?: UserProgressUI | null;
};

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  initialData,
}) => {
  const progressData = initialData;

  if (!progressData) return null;

  // Use decimal percentage for small values
  const wordsPercent =
    progressData.totalWords > 0
      ? parseFloat(
          ((progressData.wordsLearned / progressData.totalWords) * 100).toFixed(1)
        )
      : 0;

  // Calculate words needed for next level
  const getNextLevelInfo = () => {
    const learned = progressData.wordsLearned;
    if (learned < 1000) {
      return { next: "A2", wordsNeeded: 1000 - learned };
    } else if (learned < 3000) {
      return { next: "B1", wordsNeeded: 3000 - learned };
    }
    return { next: "Complete", wordsNeeded: 0 };
  };
  const nextLevelInfo = getNextLevelInfo();

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-w-0">
      

      <div className="flex w-full min-w-0 overflow-auto py-1">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              icon={BookOpen}
              value={`${progressData.roomsCompleted}/${progressData.totalRooms}`}
              label="Rooms Completed"
              subtext="Keep going!"
              color="bg-[#5a47c7]"
            />
            <StatCard
              icon={Award}
              value={progressData.levelProgress.current}
              label="Current Level"
              subtext={nextLevelInfo.wordsNeeded > 0 ? `${nextLevelInfo.wordsNeeded} words to ${nextLevelInfo.next}` : "Max level reached!"}
              color="bg-[#dc9b6c]"
            />
            <StatCard
              icon={BookOpen}
              value={`${progressData.wordsLearned}/${progressData.totalWords}`}
              label="Words Learned"
              subtext={`${wordsPercent}% complete`}
              color="bg-[#9160a8]"
            />
            <StatCard
              icon={Flame}
              value={progressData.dayStreak}
              label="Day Streak"
              subtext="Keep the streak alive"
              color="bg-[#ebc6ae]"
            />
          </div>

          <div className="mb-6 sm:mb-8 min-w-0">
            <LevelProgressBar
              current={progressData.levelProgress.current}
              progressPercent={
                progressData.levelProgress.overallProgressPercent
              }
              milestones={progressData.levelProgress.milestones}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
            <VocabularyBreakdown
              vocabularyProgress={progressData.vocabularyProgress}
            />
            <WeeklyActivity
              weeklyActivity={progressData.weeklyActivity}
            />
          </div>
        </div>
      </div>
    </div>
  );
};