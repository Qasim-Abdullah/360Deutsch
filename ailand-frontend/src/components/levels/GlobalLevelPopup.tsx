"use client";

import { useState, useRef } from "react";
import { XCircle, Trophy } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useLevel } from "./LevelContext";
import { usePoints } from "./PointsContext";
import OutOfLivesPopup from "@/components/ui/alerts/OutOfLivesPopup";

const POINTS_PER_LEVEL = 10;
const MAX_LEVEL = 4;

function getNextRoute(pathname: string): string {
  const m = pathname.match(/\/level(\d+)$/);
  if (!m) return "/dashboard";
  const current = parseInt(m[1], 10);
  if (current < MAX_LEVEL) {
    // Go back to roadmap so user can see progress and pick the next level
    return "/dashboard/level-roadmap";
  }
  // All levels in the room completed — go back to dashboard
  return "/dashboard";
}

export default function GlobalLevelPopup() {
  const pathname = usePathname();
  const router = useRouter();
  const { result, reset } = useLevel();
  const { reportLevelComplete } = usePoints();
  const [claiming, setClaiming] = useState(false);
  const lastClaimAt = useRef(0);

  async function handleClaim() {
    if (!pathname || claiming) return;
    const now = Date.now();
    if (now - lastClaimAt.current < 600) return;
    lastClaimAt.current = now;
    setClaiming(true);
    const nextRoute = getNextRoute(pathname);
    try {
      await reportLevelComplete(pathname);
      reset();
      router.push(nextRoute);
    } catch {
      reset();
      router.push(nextRoute);
    } finally {
      setClaiming(false);
    }
  }

  if (result === "playing") return null;

  if (result === "failed") {
    return (
      <OutOfLivesPopup
        open
        onClose={reset}
        icon={XCircle}
        title="Out of Lives"
        subtitle="Try again"
      />
    );
  }

  if (result === "success") {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 dark:bg-black/55 backdrop-blur-sm">
        <div
          className="w-[420px] rounded-2xl border shadow-xl p-6
            border-[var(--palette-purple)]/30 dark:border-[var(--palette-purple)]/40
            bg-white dark:bg-[radial-gradient(circle_at_top_right,rgba(90,71,199,.18),transparent 60%),radial-gradient(circle_at_bottom_left,rgba(235,198,174,.12),transparent 60%),var(--card)]"
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <Trophy className="w-10 h-10 text-[var(--palette-royal)] dark:text-[var(--palette-peach)] drop-shadow-sm" />
            </div>
            <p className="text-2xl font-semibold text-[var(--palette-purple)] dark:text-[var(--palette-peach)]">
              +{POINTS_PER_LEVEL} points
            </p>
            <p className="text-sm text-[var(--palette-terracotta)] dark:text-[var(--palette-peach)]/80 mt-1">
              Level complete!
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleClaim()}
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse") handleClaim();
            }}
            disabled={claiming}
            className="w-full min-h-[44px] rounded-lg font-medium py-2.5 px-4 transition-all [touch-action:manipulation]
              bg-[var(--palette-royal)] hover:bg-[var(--palette-purple)] text-white
              dark:bg-[var(--palette-royal)] dark:hover:bg-[var(--palette-purple)] dark:shadow-[0_0_20px_var(--palette-royal)/30%]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {claiming ? "Claiming…" : "Claim"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
