"use client";

import { useState } from "react";
import type { Mission } from "@/types/types";

type ObjectCardProps = {
  mission: Mission;
  isActive: boolean;
  onDrop: (targetObject: string) => void;
};

export default function ObjectCard({
  mission,
  isActive,
  onDrop,
}: ObjectCardProps) {
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    onDrop(mission.object);
  };

  const base =
    "min-h-[120px] rounded-xl border-2 flex flex-col items-center justify-center p-6 transition-all duration-300 cursor-pointer relative bg-muted/50 border-border";
  const highlighted = isActive
    ? "animate-glow border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30"
    : "";
  const completed = mission.completed
    ? "border-green-400 bg-green-50 dark:bg-green-950/30 opacity-70"
    : "";
  const dropTarget = isDropTarget
    ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/50 dark:to-green-900/30 scale-105"
    : "";
  const hover =
    !mission.completed && !isDropTarget
      ? "hover:-translate-y-1 hover:shadow-lg"
      : "";

  return (
    <div
      data-object={mission.object}
      className={`${base} ${highlighted} ${completed} ${dropTarget} ${hover}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {mission.completed && (
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-green-400 text-white flex items-center justify-center text-lg shadow-sm">
          ✓
        </div>
      )}
      <div className="text-4xl mb-2">{mission.emoji}</div>
      <div
        className={`text-base font-semibold text-center text-[#2d3748] dark:text-foreground ${isActive ? "text-amber-700 dark:text-amber-400" : ""}`}
      >
        {mission.fullName}
      </div>
    </div>
  );
}
