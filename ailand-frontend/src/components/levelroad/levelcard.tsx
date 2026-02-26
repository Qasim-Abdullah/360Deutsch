import React, { useRef } from 'react';
import { RoadmapLevel } from '@/types/levelroadmap';
import LevelIcon from '@/components/levelroad/levelicone';

interface LevelCardProps {
  level: RoadmapLevel;
  onContinue?: (id: number) => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, onContinue }) => {
  const isLocked = level.status === 'locked';
  const isTappable = level.status === 'active' || level.status === 'completed';
  const touchHandledRef = useRef(false);

  const handleOpen = () => {
    onContinue?.(level.id);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' && isTappable) {
      e.preventDefault();
      touchHandledRef.current = true;
      handleOpen();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isTappable) return;
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      e.preventDefault();
      return;
    }
    handleOpen();
  };

  const cardClass = `
    rounded-2xl px-4 py-3.5 transition-all duration-200 w-full text-left
    bg-white/50 dark:bg-card/50
    border border-border/60 dark:border-border
    ${!isLocked ? 'hover:border-[var(--palette-royal)]/40 dark:hover:border-[var(--palette-peach)]/40' : ''}
    ${isLocked ? 'opacity-80' : ''}
    ${level.status === 'completed' ? 'cursor-pointer touch-manipulation [touch-action:manipulation] select-none' : ''}
  `;

  const continueButton = (
    <button
      type="button"
      className="mt-2 self-start min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl text-white text-sm font-semibold
        bg-[var(--palette-royal)] hover:bg-[var(--palette-purple)]
        shadow-[0_4px_14px_var(--palette-royal)/35%] hover:shadow-[0_4px_18px_var(--palette-royal)/40%]
        transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0
        touch-manipulation cursor-pointer relative z-10 select-none
        [touch-action:manipulation]"
      onClick={(e) => {
        if (touchHandledRef.current) {
          touchHandledRef.current = false;
          e.preventDefault();
          return;
        }
        handleOpen();
      }}
      onPointerUp={(e) => {
        if (e.pointerType === 'touch') {
          e.preventDefault();
          e.stopPropagation();
          touchHandledRef.current = true;
          handleOpen();
        }
      }}
    >
      Continue
    </button>
  );

  const content = (
    <>
      <LevelIcon status={level.status} />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <h3 className="text-base font-bold text-[var(--palette-purple)] dark:text-[var(--palette-peach)]">
          {level.title}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-muted-foreground">
          {level.subtitle}
        </p>
        {level.status === "active" && continueButton}
      </div>
    </>
  );

  if (level.status === "completed") {
    return (
      <button
        type="button"
        className={`flex items-center gap-3 ${cardClass}`}
        onClick={handleClick}
        onPointerUp={handlePointerUp}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${cardClass}`}>
      {content}
    </div>
  );
};

export default LevelCard;
