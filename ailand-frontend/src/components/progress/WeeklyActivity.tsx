"use client";

import React from "react";
import type { UserProgressUI } from "@/types/progress";

type Props = {
  weeklyActivity: UserProgressUI["weeklyActivity"];
};

export const WeeklyActivity: React.FC<Props> = ({ weeklyActivity }) => {
  const { currentWeek, days, mostActiveDay } = weeklyActivity;
  const maxValue = Math.max(...days.map((d) => d.value), 0);

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Weekly Activity</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-[#5a47c7] rounded-full"></div>
          <span>Week {currentWeek}</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-48 mb-6">
        {days.map((day) => {
          const heightPercent =
            maxValue > 0
              ? 10 + (day.value / maxValue) * 90
              : 0;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div className="relative w-full h-40 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-[#5a47c7] to-[#9160a8] rounded-t-lg transition-all duration-300"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-2">
                {day.day}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">Most Active</span>
        <span className="text-sm font-semibold text-foreground">{mostActiveDay}</span>
      </div>
    </div>
  );
};
