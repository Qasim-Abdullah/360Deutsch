"use client";

import { Heart } from "lucide-react";

type LevelProgressBarProps = {
  /** Number completed */
  current: number;
  /** Total count */
  total: number;
  /** Optional. Lives remaining (filled hearts). When provided, one heart is lost per wrong answer. */
  heartsFilled?: number;
};

export default function LevelProgressBar({
  current,
  total,
  heartsFilled,
}: LevelProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const filled = heartsFilled != null ? heartsFilled : Math.min(3, current);
  const hearts = 3;

  return (
    <div className="flex items-center gap-3 w-full py-2 px-1">
      <span className="text-sm font-medium text-[var(--palette-purple)] dark:text-[var(--palette-peach)] shrink-0 tabular-nums">
        {current} of {total} completed
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-[var(--palette-lavender)] dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, var(--palette-royal), var(--palette-purple), var(--palette-terracotta))`,
            }}
          />
        </div>
        <span className="text-sm font-medium text-[var(--palette-purple)] dark:text-[var(--palette-peach)] shrink-0 tabular-nums w-8">
          {percentage}%
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          {Array.from({ length: hearts }).map((_, i) => (
            <Heart
              key={i}
              size={16}
              className={
                i < filled
                  ? "fill-[var(--palette-royal)] text-[var(--palette-royal)]"
                  : "text-[var(--palette-lavender)] dark:text-white/30"
              }
              strokeWidth={2}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
