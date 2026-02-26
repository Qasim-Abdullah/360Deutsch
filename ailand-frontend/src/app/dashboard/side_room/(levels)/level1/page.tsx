"use client";

import { useEffect, useState, useRef } from "react";

import WordCard from "@/components/ui/cards/WordCard";
import FloatingObjects from "@/components/levels/LevelObjects";

import level1 from "@/data/levels/level1";

import {
  useLevel,
  Lives,
} from "@/components/levels/LevelContext";

type Word = {
  id: string;
  de: string;
  en: string;
  done: boolean;
};

type Model = {
  id: string;
  url: string;
  wordId: string;
  cameraOrbit?: string;
};

export default function LevelOne() {
  const task = level1.tasks[0];

  const baseWords = useRef(
    task.words.map((w) => ({
      ...w,
      done: false,
    }))
  );

  const baseLives = useRef(
    level1.progress.lives as Lives
  );

  const [words, setWords] = useState<Word[]>(
    baseWords.current
  );

  const [models] =
    useState<Model[]>(task.models);

  const [selected, setSelected] =
    useState<string | null>(null);

  const {
    status,
    setStatus,
    lives,
    setLives,
    setCompleted,
    setTotal,
    setResult,
    result,
  } = useLevel();

  const totalToMatch = models.length;


  useEffect(() => {
    setTotal(totalToMatch);
  }, [totalToMatch, setTotal]);

  useEffect(() => {
    if (result === "playing") {
      setWords(
        baseWords.current.map((w) => ({
          ...w,
          done: false,
        }))
      );

      setSelected(null);
    }
  }, [result]);

  // Update completed count when words change
  useEffect(() => {
    const doneCount = words.filter((w) => w.done).length;
    setCompleted(doneCount);
    
    if (doneCount === totalToMatch && doneCount > 0) {
      setTimeout(() => {
        setResult("success");
      }, 700);
    }
  }, [words, totalToMatch, setCompleted, setResult]);

  function handleMatch(wordId: string) {
    if (!selected) return;
    if (status !== "idle") return;
    if (lives === 0) return;

    /* CORRECT */
    if (selected === wordId) {
      setStatus("correct");

      setWords((prev) =>
        prev.map((w) =>
          w.id === selected
            ? { ...w, done: true }
            : w
        )
      );

      setTimeout(() => {
        setSelected(null);
        setStatus("idle");
      }, 700);

      return;
    }

    /* WRONG */
    setStatus("wrong");

    const nextLives = Math.max(
      lives - 1,
      0
    ) as Lives;

    setLives(nextLives);

    if (nextLives === 0) {
      setTimeout(() => {
        setResult("failed");
      }, 700);
    }

    setTimeout(() => {
      setStatus("idle");
    }, 700);
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-slate-100 px-10 py-7 relative">

      <div className="grid grid-cols-[420px_1fr] gap-7 h-[calc(100vh-200px)] max-[1000px]:grid-cols-1">

        {/* WORDS */}
        <section className="rounded-2xl p-6 border border-gray-200 bg-[#ffffff] shadow-sm flex flex-col gap-3 overflow-auto dark:border-white/10 dark:bg-slate-950/20 dark:backdrop-blur-xl">

          <h3 className="text-base mb-2 text-gray-900 dark:text-slate-100">
            Word Cards
          </h3>

          {words.map((word) => (
            <WordCard
              key={word.id}
              id={word.id}
              de={word.de}
              en={word.en}
              done={word.done}
              active={selected === word.id}
              status={status}
              onSelect={setSelected}
            />
          ))}

        </section>

        {/* OBJECTS */}
        <section
          className="
            relative rounded-2xl p-7 border shadow-sm flex flex-col
            border-gray-200 dark:border-white/10
            backdrop-blur-xl
            bg-white
            dark:bg-[#020617]
            bg-[radial-gradient(circle_at_top_right,rgba(124,108,255,.12),transparent_75%),radial-gradient(circle_at_bottom_left,rgba(255,159,90,.12),transparent_75%)]
            dark:bg-[radial-gradient(circle_at_top_right,rgba(124,108,255,.22),transparent_75%),radial-gradient(circle_at_bottom_left,rgba(255,159,90,.18),transparent_75%),#020617]
          "
        >

          <div className="text-center mb-5">
            <h3 className="text-lg mb-1 text-gray-900 dark:text-slate-100">
              Click the matching object
            </h3>

            <p className="text-sm text-gray-500 dark:text-slate-300/80">
              Select a word first
            </p>
          </div>

          <FloatingObjects
            onSelect={handleMatch}
            objects={models.map((m) => ({
              id: m.wordId,
              src: m.url,
              cameraOrbit: m.cameraOrbit,
            }))}
          />

        </section>
      </div>
    </div>
  );
}
