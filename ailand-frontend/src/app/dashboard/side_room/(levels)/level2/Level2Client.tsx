"use client";

import { useState, useEffect } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import InputSection from "@/components/InputSection";
import RoomViewEmbedded from "@/app/room/RoomViewEmbedded";
import type { Level2Word } from "@/data/levels/level2";
import { useLevel, type Lives } from "@/components/levels/LevelContext";

type Level2ClientProps = {
  words: Level2Word[];
};

export default function Level2Client({ words }: Level2ClientProps) {
  const {
    setResult,
    setTotal,
    setCompleted,
    setStatus,
    setLives,
    lives,
  } = useLevel();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [revealedObjects, setRevealedObjects] = useState<Level2Word[]>([]);

  const totalObjects = words.length;
  const currentWord = totalObjects > 0 ? words[currentWordIndex] : null;
  const outOfLives = lives <= 0;

  useEffect(() => {
    setTotal(totalObjects);
  }, [totalObjects, setTotal]);

  useEffect(() => {
    setCompleted(revealedObjects.length);
  }, [revealedObjects.length, setCompleted]);

  const handleCheckAnswer = () => {
    if (!currentWord || outOfLives) return;
    const normalizedInput = userInput.trim().toLowerCase();
    const correctAnswer = `${currentWord.article} ${currentWord.word}`.toLowerCase();

    if (normalizedInput === correctAnswer) {
      setIsCorrect(true);
      setStatus("correct");
      const nextRevealed = [...revealedObjects, currentWord];
      setRevealedObjects(nextRevealed);
      setCompleted(nextRevealed.length);

      const allDone = nextRevealed.length === words.length;
      setTimeout(() => {
        if (allDone) {
          setResult("success");
        } else {
          setCurrentWordIndex((prev) =>
            prev < words.length - 1 ? prev + 1 : prev
          );
        }
        setUserInput("");
        setIsCorrect(null);
        setStatus("idle");
      }, 1500);
    } else {
      setIsCorrect(false);
      setStatus("wrong");
      const nextLives = Math.max(0, lives - 1) as Lives;
      setLives(nextLives);
      if (nextLives === 0) {
        setTimeout(() => setResult("failed"), 700);
      }
      setTimeout(() => setStatus("idle"), 700);
    }
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
        <p className="text-muted-foreground">No vocabulary loaded.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div
        className="absolute inset-0 pointer-events-none min-h-full"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--palette-lavender)]/30 via-transparent to-[var(--palette-peach)]/20 dark:opacity-0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 sm:gap-6 lg:gap-8">
          <div className="relative z-[100] isolate pointer-events-auto space-y-4 sm:space-y-6 min-w-0">
            <AudioPlayer word={currentWord} />

            <InputSection
              userInput={userInput}
              setUserInput={setUserInput}
              onCheckAnswer={handleCheckAnswer}
              isCorrect={isCorrect}
              currentWord={currentWord}
              disabled={outOfLives}
            />
            {outOfLives && (
              <p className="text-sm text-[var(--palette-terracotta)] dark:text-[var(--palette-peach)]">
                No lives left — use &quot;Try again&quot; in the popup to restart.
              </p>
            )}
          </div>

          <div className="relative z-0 pointer-events-none rounded-xl sm:rounded-2xl overflow-hidden border border-border bg-card shadow-md dark:shadow-none self-start w-full min-h-[240px] h-[45vh] sm:h-[55vh] md:h-[min(60vh,420px)] lg:h-[480px]">
            <div className="pointer-events-auto h-full w-full">
              <RoomViewEmbedded
                height="100%"
                revealedObjects={revealedObjects}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
