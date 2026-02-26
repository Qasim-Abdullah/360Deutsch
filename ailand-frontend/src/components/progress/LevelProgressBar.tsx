"use client";

import React from "react";

type Props = {
  current: string;
  progressPercent: number;
  milestones: string[];
};

export const LevelProgressBar: React.FC<Props> = ({ current, progressPercent, milestones }) => {
  
  const milestonePositions: Record<string, number> = Object.fromEntries(
    milestones.map((m, i) => [m, (i / Math.max(milestones.length - 1, 1)) * 100])
  );

  // Ensure minimum visible width when there's any progress
  const barWidth = progressPercent > 0 ? Math.max(progressPercent, 1) : 0;

  // Determine bar color based on current level
  const getBarGradient = () => {
    if (current === "B1") {
      return "bg-gradient-to-r from-[#5a47c7] via-[#9160a8] to-[#dc9b6c]";
    } else if (current === "A2") {
      return "bg-gradient-to-r from-[#5a47c7] to-[#9160a8]";
    }
    return "bg-[#5a47c7]";
  };

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 min-w-0">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Learning Progress</h3>
          <p className="text-sm text-muted-foreground truncate sm:whitespace-normal">
            Current: <span className="font-semibold text-foreground">{current}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 sm:text-right shrink-0">
          <div className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{progressPercent}%</div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
      </div>

      <div className="relative min-w-0">
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`${getBarGradient()} h-full rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(Math.max(barWidth, 0), 100)}%` }}
          />
        </div>

        <div className="flex justify-between mt-3 gap-0.5 sm:gap-1 min-w-0">
          {milestones.map((milestone) => {
            const position = milestonePositions[milestone] ?? 0;
            const isActive = current === milestone || 
              (milestone === "A1" && (current === "A2" || current === "B1")) ||
              (milestone === "A2" && current === "B1");

            return (
              <div key={milestone} className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 transition-all duration-300 shrink-0 ${
                    isActive
                      ? "bg-gradient-to-br from-[#5a47c7] to-[#9160a8] text-white border-[#5a47c7]"
                      : "bg-card text-muted-foreground border-border"
                  }`}
                >
                  {milestone}
                </div>
                <div className={`text-[10px] sm:text-xs mt-1 font-medium truncate w-full text-center ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {milestone}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
