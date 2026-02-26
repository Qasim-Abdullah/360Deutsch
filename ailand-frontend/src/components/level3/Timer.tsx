"use client";

import { useEffect } from "react";

type TimerProps = {
  timeRemaining: number;
  setTimeRemaining: (value: number | ((prev: number) => number)) => void;
  running?: boolean;
};

export default function Timer({ timeRemaining, setTimeRemaining, running = true }: TimerProps) {
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [setTimeRemaining, running]);

  const minutes = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const display = `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="bg-[var(--palette-lavender)] border border-[var(--palette-purple)]/30 dark:bg-[var(--palette-royal)]/90 dark:border-[var(--palette-purple)]/50 text-[var(--palette-royal)] dark:text-white px-3 py-1.5 rounded-lg text-sm font-semibold shrink-0">
      {display}
    </div>
  );
}
