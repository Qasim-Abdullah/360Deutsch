"use client";

import { useState, useRef, useCallback } from "react";
import type { Mission } from "@/types/types";

type WordCardProps = {
  mission: Mission;
  completed?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onDragStart?: () => void;
  shake?: boolean;
};

export default function WordCard({ mission, completed = false, selected = false, onSelect, onDragStart, shake = false }: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const dragGhostRef = useRef<HTMLDivElement | null>(null);
  const pointerHandledRef = useRef(false);

  const handleCardClick = useCallback(() => {
    if (completed) return;
    if (onSelect) {
      if (selected) setIsFlipped((prev) => !prev);
      else onSelect();
      return;
    }
    setIsFlipped((prev) => !prev);
  }, [completed, onSelect, selected]);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (completed) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
      pointerHandledRef.current = true;
      handleCardClick();
    },
    [completed, handleCardClick]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (pointerHandledRef.current) {
        e.preventDefault();
        pointerHandledRef.current = false;
        return;
      }
      handleCardClick();
    },
    [handleCardClick]
  );

  const handleDragStart = (e: React.DragEvent) => {
    if (completed) {
      e.preventDefault();
      return;
    }
    onDragStart?.();
    e.dataTransfer.setData("text/plain", mission.object);
    e.dataTransfer.effectAllowed = "move";

   
    const ghost = document.createElement("div");
    ghost.className = "inline-flex items-baseline gap-1.5 px-3 py-2 rounded-lg font-medium text-sm text-white select-none shadow-lg";
    ghost.textContent = `${mission.article} ${mission.word}`;
    Object.assign(ghost.style, {
      position: "absolute",
      top: "-9999px",
      left: "-9999px",
      pointerEvents: "none",
      background: "var(--palette-royal, #6b4e9e)",
      border: "1px solid rgba(107, 78, 158, 0.5)",
    });
    document.body.appendChild(ghost);
    dragGhostRef.current = ghost;
    void ghost.offsetWidth; 
    e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
  };

  const handleDragEnd = () => {
    dragGhostRef.current?.remove();
    dragGhostRef.current = null;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`min-h-[72px] rounded-2xl border-2 flex items-center justify-center relative overflow-hidden transition-all duration-200 touch-manipulation ${completed ? "cursor-default opacity-90 border-green-500/60 bg-green-500/10 dark:bg-green-500/10" : selected ? "cursor-pointer border-[var(--palette-royal)] bg-[var(--palette-lavender)]/80 dark:bg-[var(--palette-royal)]/20 ring-2 ring-[var(--palette-royal)]" : "cursor-pointer border-[var(--palette-purple)]/40 bg-[var(--palette-lavender)]/50 dark:bg-[var(--palette-royal)]/10 dark:border-[var(--palette-purple)]/50 hover:border-[var(--palette-royal)] hover:bg-[var(--palette-lavender)]/70 dark:hover:border-[var(--palette-peach)]/50"} ${shake ? "shake" : ""}`}
      onClick={handleClick}
      onPointerUp={handlePointerUp}
      draggable={!completed}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      style={{ perspective: "1000px", touchAction: "manipulation" }}
    >
      <div
        className="relative w-full min-h-[72px] flex flex-col items-center justify-center text-center transition-transform duration-500 [transform-style:preserve-3d] py-2 px-2"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
      
        <div
          className="absolute inset-0 flex flex-col items-center justify-center w-full px-2 py-2 [backface-visibility:hidden]"
          style={{ backfaceVisibility: "hidden" }}
        >
          {completed && (
            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold" aria-hidden>
              ✓
            </div>
          )}
          <div className="inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm text-white bg-[var(--palette-royal)] select-none transition-all hover:bg-[var(--palette-purple)]">
            <span>{mission.article}</span>
            <span>{mission.word}</span>
          </div>
        </div>

       
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl m-0.5 bg-[var(--palette-lavender)] text-[var(--palette-royal)] dark:bg-[var(--palette-royal)]/20 dark:text-[var(--palette-peach)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">
            Translation
          </span>
          <span className="text-sm font-semibold leading-tight">
            {mission.translation}
          </span>
        </div>
      </div>
    </div>
  );
}
