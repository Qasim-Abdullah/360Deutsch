"use client";

import { useState, useEffect, useRef } from "react";
import { useLevel, Lives } from "@/components/levels/LevelContext";
import RoomViewEmbedded from "@/app/room/RoomViewEmbedded";
import SentenceCard from "@/components/levels/SentenceCard";
import { getLevel4 } from "@/lib/api/levels";
import { arrayMove } from "@dnd-kit/sortable";

type Word = {
  id: string;
  text: string;
};

type Sentence = {
  id: string;
  de: string;
  en: string;
};

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function Page() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentSentence, setCurrentSentence] = useState("");
  const [sentenceIndex, setSentenceIndex] = useState(0);

  const {
    status,
    lives,
    completed,
    setLives,
    setStatus,
    setCompleted,
    setTotal,
    setResult,
    result,
  } = useLevel();

  const [pool, setPool] = useState<Word[]>([]);
  const [answer, setAnswer] = useState<Word[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getLevel4();
      const list = data.tasks[0].sentences;

      setSentences(list);
      setTotal(list.length);
      setSentenceIndex(0);
    }

    load();
  }, [setTotal]);

  function initSentence(sentence: string) {
    setCurrentSentence(sentence);

    const words = sentence.split(" ").map((w, i) => ({
      id: i.toString(),
      text: w,
    }));

    setPool(shuffle(words));
    setAnswer([]);
  }


  useEffect(() => {
    if (sentences.length === 0) return;
    const idx = Math.min(sentenceIndex, sentences.length - 1);
    initSentence(sentences[idx].de);
  }, [sentenceIndex, sentences]);

  const prevResult = useRef(result);
  useEffect(() => {
    if (prevResult.current === "failed" && result === "playing") {
      setSentenceIndex(0);
    }
    prevResult.current = result;
  }, [result]);

  function addWord(w: Word, index?: number) {
    if (status !== "idle") return;

    setPool((p) => p.filter((x) => x.id !== w.id));

    setAnswer((prev) => {
      const copy = [...prev];

      if (index === undefined) copy.push(w);
      else copy.splice(index, 0, w);

      return copy;
    });
  }

  function removeWord(w: Word) {
    if (status !== "idle") return;

    setAnswer((a) => a.filter((x) => x.id !== w.id));
    setPool((p) => [...p, w]);
  }

  function reorderWord(from: number, to: number) {
    if (status !== "idle") return;

    setAnswer((prev) => {
      const copy = [...prev];
      const reordered = arrayMove(copy, from, to);
      return reordered;
    });
  }

  const totalSentences = sentences.length;

  function check() {
    if (status !== "idle") return;

    const built = answer.map((w) => w.text).join(" ");

    if (built === currentSentence) {
      setStatus("correct");
      const newCompleted = completed + 1;
      setCompleted(newCompleted);

      if (newCompleted >= totalSentences) {
        setTimeout(() => setResult("success"), 600);
      } else {
        setTimeout(() => {
          setSentenceIndex((i) => Math.min(i + 1, totalSentences - 1));
          setStatus("idle");
        }, 600);
      }

      return;
    }

    setStatus("wrong");

    const next = Math.max(lives - 1, 0) as Lives;
    setLives(next);

    if (next === 0) {
      setTimeout(() => {
        setResult("failed");
      }, 600);
    }

    setTimeout(() => {
      setStatus("idle");
    }, 600);
  }

  return (
    <div className="grid grid-cols-[420px_1fr] gap-7 min-h-[70vh] max-[1000px]:grid-cols-1">
      <SentenceCard
        pool={pool}
        answer={answer}
        status={status}
        onAdd={addWord}
        onRemove={removeWord}
        onReorder={reorderWord}
        onCheck={check}
      />

      <section className="rounded-2xl border bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
        <RoomViewEmbedded height="70vh" />
      </section>
    </div>
  );
}
