import React from 'react';
import { LevelStatus } from '@/types/levelroadmap';

interface LevelIconProps {
  status: LevelStatus;
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
    <path
      d="M4.5 11.5L9 16L17.5 6"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M7 9V6.5C7 4.567 8.567 3 10.5 3C12.433 3 14 4.567 14 6.5V9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="10.5" cy="13.5" r="1.5" fill="currentColor" />
  </svg>
);

const LevelIcon: React.FC<LevelIconProps> = ({ status }) => {
  if (status === 'completed') {
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0 w-10 h-10 p-[3px] shadow-[0_3px_12px_var(--palette-royal)/25%]"
        style={{
          background: 'linear-gradient(135deg, var(--palette-lavender) 0%, var(--palette-royal) 50%, var(--palette-purple) 100%)',
        }}
      >
        <div
          className="rounded-full w-full h-full flex items-center justify-center bg-[var(--palette-royal)]"
        >
          <CheckIcon />
        </div>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0 w-10 h-10 border-[3px] border-[var(--palette-royal)] dark:border-[var(--palette-peach)] bg-transparent shadow-[0_2px_10px_var(--palette-royal)/15%]"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 w-10 h-10 bg-neutral-200 dark:bg-neutral-600/80 border border-neutral-300/80 dark:border-neutral-500/80 text-neutral-500 dark:text-neutral-400"
    >
      <LockIcon />
    </div>
  );
};

export default LevelIcon;
