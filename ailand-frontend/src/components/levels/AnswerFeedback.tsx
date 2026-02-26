"use client";

type Props = {
  isCorrect: boolean;
  message: string;
};

export default function AnswerFeedback({
  isCorrect,
  message,
}: Props) {
  return (
    <div
      className={`p-3 rounded-lg text-center text-sm font-semibold ${
        isCorrect
          ? "bg-[var(--palette-lavender)] text-[var(--palette-royal)] dark:bg-[var(--palette-royal)]/20 dark:text-[var(--palette-peach)]"
          : "bg-[var(--palette-peach)]/30 text-[var(--palette-terracotta)] dark:text-[var(--palette-peach)]"
      }`}
    >
      {message}
    </div>
  );
}
