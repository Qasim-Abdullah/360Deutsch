"use client";

import { createContext, useContext, useState } from "react";

export type Status = "idle" | "correct" | "wrong";
export type Lives = 0 | 1 | 2 | 3;
export type GameResult = "playing" | "failed" | "success";

type LevelState = {
  completed: number;
  total: number;
  status: Status;
  lives: Lives;
  result: GameResult;

  setCompleted: (n: number) => void;
  setTotal: (n: number) => void;
  setStatus: (s: Status) => void;
  setLives: (n: Lives) => void;
  setResult: (r: GameResult) => void;

  reset: () => void;
};

const LevelContext = createContext<LevelState | null>(null);

export function LevelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [lives, setLives] = useState<Lives>(3);
  const [result, setResult] =
    useState<GameResult>("playing");

  function reset() {
    setCompleted(0);
    setStatus("idle");
    setLives(3);
    setResult("playing");
  }

  return (
    <LevelContext.Provider
      value={{
        completed,
        total,
        status,
        lives,
        result,

        setCompleted,
        setTotal,
        setStatus,
        setLives,
        setResult,

        reset,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
}

export function useLevel() {
  const ctx = useContext(LevelContext);

  if (!ctx) {
    throw new Error(
      "useLevel must be inside LevelProvider"
    );
  }

  return ctx;
}
