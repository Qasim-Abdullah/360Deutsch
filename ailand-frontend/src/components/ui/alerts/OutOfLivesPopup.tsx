"use client";

import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;

  icon: LucideIcon;
  title: string;
  subtitle: string;
};

export default function OutOfLivesPopup({
  open,
  onClose,
  icon: Icon,
  title,
  subtitle,
}: Props) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!open) return;

    setProgress(100);
    const start = Date.now();

    const interval = setInterval(() => {
      const diff = Date.now() - start;
      const percent = Math.max(0, 100 - (diff / 3000) * 100);

      setProgress(percent);

      if (diff >= 3000) {
        clearInterval(interval);
        onClose();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/55 backdrop-blur-sm">
      <div
        className="w-[420px] rounded-2xl border shadow-xl p-6
          border-[var(--palette-purple)]/30 dark:border-[var(--palette-purple)]/40
          bg-white dark:bg-[radial-gradient(circle_at_top_right,rgba(90,71,199,.18),transparent 60%),radial-gradient(circle_at_bottom_left,rgba(235,198,174,.12),transparent 60%),var(--card)]"
      >
        <div className="text-center mb-4">
          {/* Icon */}
          <div className="flex justify-center mb-2">
            <Icon className="w-8 h-8 text-[var(--palette-royal)] dark:text-[var(--palette-peach)]" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-[var(--palette-purple)] dark:text-[var(--palette-peach)]">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-sm text-[var(--palette-terracotta)] dark:text-[var(--palette-peach)]/80 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-[var(--palette-lavender)] dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--palette-royal), var(--palette-purple), var(--palette-terracotta))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
