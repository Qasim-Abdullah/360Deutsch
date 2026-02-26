"use client";

import { useRef } from "react";
import { Lightbulb } from "lucide-react";

type InputSectionProps = {
  userInput: string;
  setUserInput: (value: string) => void;
  onCheckAnswer: () => void;
  isCorrect: boolean | null;
  currentWord: { article: string; word: string };
  disabled?: boolean;
};

export default function InputSection({
  userInput,
  setUserInput,
  onCheckAnswer,
  isCorrect,
  currentWord,
  disabled = false,
}: InputSectionProps) {
  const lastCheckAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled) onCheckAnswer();
  };

  const handleCheck = (e?: React.PointerEvent) => {
    if (disabled) return;
    const now = Date.now();
    if (now - lastCheckAt.current < 500) return;
    lastCheckAt.current = now;
    onCheckAnswer();
  };

  const handleInputAreaPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" && !disabled && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="Type what you heard"
        className="relative z-10 min-h-[80px] [touch-action:manipulation]"
        onPointerDown={handleInputAreaPointerDown}
      >
        <label className="block text-sm font-semibold mb-1.5 text-[var(--palette-purple)] dark:text-[var(--palette-peach)]">
          Type what you heard:
        </label>
        <form onSubmit={handleSubmit} className="[touch-action:manipulation]">
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="das Klavier"
            disabled={disabled}
            className="w-full min-h-[48px] px-3 py-2.5 text-base rounded-lg border-2 border-[var(--palette-purple)]/40 bg-[var(--palette-lavender)]/50 focus:border-[var(--palette-royal)] focus:outline-none focus:ring-1 focus:ring-[var(--palette-royal)]/30 dark:bg-[var(--palette-royal)]/10 dark:border-[var(--palette-purple)]/50 dark:focus:border-[var(--palette-peach)] disabled:opacity-60 disabled:cursor-not-allowed [touch-action:manipulation]"
          />
        </form>
        <p className="text-xs text-[var(--palette-terracotta)] mt-1.5 flex items-center gap-2 dark:text-[var(--palette-peach)]/90">
          💡 <span>Tip: Include the article (der, die, or das) before the word!</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => handleCheck()}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") handleCheck(e);
        }}
        disabled={disabled}
        className="w-full min-h-[44px] font-semibold py-3 px-4 rounded-lg text-sm transition-colors bg-[var(--palette-royal)] hover:bg-[var(--palette-purple)] text-white disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[var(--palette-royal)] [touch-action:manipulation] select-none"
      >
        Check Answer ✓
      </button>

      {isCorrect !== null && (
        <div
          className={`p-3 rounded-lg text-center text-sm font-semibold ${
            isCorrect
              ? "bg-[var(--palette-lavender)] text-[var(--palette-royal)] dark:bg-[var(--palette-royal)]/20 dark:text-[var(--palette-peach)]"
              : "bg-[var(--palette-peach)]/30 text-[var(--palette-terracotta)] dark:text-[var(--palette-peach)]"
          }`}
        >
          {isCorrect ? (
            <>
              ✓ Richtig! {currentWord.article.charAt(0).toUpperCase() + currentWord.article.slice(1)}{" "}
              {currentWord.word.charAt(0).toUpperCase() + currentWord.word.slice(1)} appears in the
              room!
            </>
          ) : (
            <>✗ Try again! Listen carefully and type with the article.</>
          )}
        </div>
      )}
    </div>
  );
}
