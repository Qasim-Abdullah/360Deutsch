"use client";

import { useState, useEffect, useCallback } from "react";
import WordCard from "@/components/level3/WordCard";
import Timer from "@/components/level3/Timer";
import RoomViewEmbedded from "@/app/room/RoomViewEmbedded";
import type { Mission } from "@/types/types";
import { useLevel, type Lives } from "@/components/levels/LevelContext";

type Level3ClientProps = {
  missions: Mission[];
};

const INITIAL_TIME_SECONDS = 300; // 5 minutes

export default function Level3Client({ missions: initialMissions }: Level3ClientProps) {
  const { setResult, setTotal, setCompleted, setStatus, setLives, lives } = useLevel();
  const [missions] = useState<Mission[]>(initialMissions);
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME_SECONDS);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wrongMatchWord, setWrongMatchWord] = useState<string | null>(null);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    setTotal(missions.length);
  }, [missions.length, setTotal]);

  useEffect(() => {
    setCompleted(completedIds.size);
  }, [completedIds.size, setCompleted]);

  useEffect(() => {
    if (timeRemaining === 0) {
      setResult("failed");
    }
  }, [timeRemaining, setResult]);

  const handleSelectWord = useCallback((object: string) => {
    setTimerStarted(true);
    setSelectedWord((prev) => (prev === object ? null : object));
  }, []);

  const handleInteractionStart = useCallback(() => {
    setTimerStarted(true);
  }, []);

  const matchWordToObject = useCallback(
    (wordFromUser: string, objectWord: string | null) => {
      const a = wordFromUser.toLowerCase().trim();
      const b = (objectWord ?? "").toLowerCase().trim();
      if (!b) return false;
      if (a !== b) return false;
      const mission = missions.find((m) => m.object?.toLowerCase().trim() === a);
      if (mission) {
        setCompletedIds((prev) => {
          const next = new Set(prev).add(mission.id);
          if (next.size === missions.length) setResult("success");
          return next;
        });
      }
      return true;
    },
    [missions, setResult]
  );

  const applyWrongMatch = useCallback(() => {
    setStatus("wrong");
    const nextLives = Math.max(0, lives - 1) as Lives;
    setLives(nextLives);
    if (nextLives === 0) {
      setTimeout(() => setResult("failed"), 700);
    }
    setTimeout(() => setStatus("idle"), 700);
  }, [lives, setLives, setStatus, setResult]);

  const handleRoomObjectClick = useCallback(
    (objectWord: string | null) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Level3 match] selectedWord:", selectedWord, "objectWord:", objectWord);
      }
      if (!selectedWord) return;
      if (matchWordToObject(selectedWord, objectWord)) {
        setSelectedWord(null);
      } else {
        setWrongMatchWord(selectedWord);
        setShowTryAgain(true);
        setSelectedWord(null);
        applyWrongMatch();
        setTimeout(() => setWrongMatchWord(null), 600);
        setTimeout(() => setShowTryAgain(false), 2000);
      }
    },
    [selectedWord, matchWordToObject, applyWrongMatch]
  );

  const handleDropWord = useCallback(
    (droppedWord: string, objectWord: string | null) => {
      if (matchWordToObject(droppedWord, objectWord)) {
        setSelectedWord(null);
      } else {
        const word = droppedWord.toLowerCase().trim();
        const mission = missions.find((m) => m.object?.toLowerCase().trim() === word);
        setWrongMatchWord(mission ? mission.object : droppedWord);
        setShowTryAgain(true);
        applyWrongMatch();
        setTimeout(() => setWrongMatchWord(null), 600);
        setTimeout(() => setShowTryAgain(false), 2000);
      }
    },
    [matchWordToObject, missions, applyWrongMatch]
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground p-8">
      <div
        className="absolute inset-0 pointer-events-none min-h-full"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--palette-lavender)]/30 via-transparent to-[var(--palette-peach)]/20 dark:opacity-0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-[var(--palette-purple)] dark:text-[var(--palette-peach)]">
                Vocabulary Challange
              </h3>
              <Timer
                timeRemaining={timeRemaining}
                setTimeRemaining={setTimeRemaining}
                running={timerStarted}
              />
            </div>
            <p className="text-sm text-[var(--palette-terracotta)] dark:text-[var(--palette-peach)]/90 -mt-2">
              Click / Drag&Drop to match with the 3D objects !
            </p>
            <div className="grid grid-cols-2 gap-3">
              {missions.map((mission) => (
                <WordCard
                  key={mission.id}
                  mission={mission}
                  completed={completedIds.has(mission.id)}
                  selected={selectedWord === mission.object}
                  onSelect={() => handleSelectWord(mission.object)}
                  onDragStart={handleInteractionStart}
                  shake={wrongMatchWord === mission.object}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-md dark:shadow-none self-start relative">
            {showTryAgain && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-lg bg-amber-500/95 text-white text-sm font-medium shadow-lg animate-in fade-in duration-200">
                Try again — pick the object that matches the word
              </div>
            )}
            {selectedWord && (
              <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-[var(--palette-royal)]/90 text-white text-sm font-medium">
                Now click the matching object in the room
              </div>
            )}
            <RoomViewEmbedded
              height="480px"
              revealedObjects={[]}
              onRoomObjectClick={handleRoomObjectClick}
              onDropWord={handleDropWord}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
