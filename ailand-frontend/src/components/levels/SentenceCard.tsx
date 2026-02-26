"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";

import AnswerFeedback from "./AnswerFeedback";

/* ---------------- TYPES ---------------- */

type Word = {
  id: string;
  text: string;
};

type Props = {
  pool: Word[];
  answer: Word[];
  status: "idle" | "correct" | "wrong";
  onAdd: (w: Word, index?: number) => void;
  onRemove: (w: Word) => void;
  onReorder: (from: number, to: number) => void;
  onCheck: () => void;
};

/* ---------------- CHIP ---------------- */

function SortableChip({
  word,
  disabled,
  onRemove,
}: {
  word: Word;
  disabled: boolean;
  onRemove: (w: Word) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: word.id });

  /* ---- LOCK SIZE (prevents jump) ---- */
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,

    width: "fit-content",
    minWidth: "max-content",
    height: "32px",

    boxSizing: "border-box",
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      disabled={disabled}
      onClick={() => onRemove(word)}
      className="
        px-4 py-1.5 rounded-full
        bg-linear-to-r from-[#6f5cff] to-[#9385f7]
        text-white text-sm font-medium
        shadow-md
        transition
        cursor-grab active:cursor-grabbing
        disabled:opacity-50
        flex-shrink-0
        select-none
      "
    >
      {word.text}
    </button>
  );
}

/* ---------------- MAIN ---------------- */

export default function SentenceCard({
  pool,
  answer,
  status,
  onAdd,
  onRemove,
  onReorder,
  onCheck,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = answer.findIndex(
      (w) => w.id === active.id
    );

    const newIndex = answer.findIndex(
      (w) => w.id === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  }

  return (
    <section
      className="
        relative rounded-2xl p-7 border shadow-sm flex flex-col gap-5
        border-gray-200 dark:border-white/10
        backdrop-blur-xl
        bg-white
        bg-[radial-gradient(circle_at_top_right,rgba(124,108,255,.12),transparent_75%),radial-gradient(circle_at_bottom_left,rgba(255,159,90,.12),transparent_75%)]
        dark:bg-none dark:bg-[oklch(0.24_0.025_290)]
      "
    >
      {/* HEADER */}
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
          Translate this sentence
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          Baue den Satz
        </h3>
      </div>

      {/* ANSWER AREA */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={answer.map((w) => w.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div
            className="
              min-h-[90px] p-4 rounded-xl border
              border-gray-200 dark:border-white/10
              bg-white/70 dark:bg-slate-900/40

              flex flex-wrap items-start content-start gap-3
              leading-none
            "
          >
            {answer.length === 0 && (
              <span className="text-sm text-gray-400 dark:text-slate-400">
                Ziehe Wörter hierher
              </span>
            )}

            {answer.map((w) => (
              <SortableChip
                key={w.id}
                word={w}
                disabled={status !== "idle"}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* POOL */}
      <div className="flex flex-wrap gap-3 items-start content-start">
        {pool.map((w) => (
          <button
            key={w.id}
            onClick={() => onAdd(w)}
            disabled={status !== "idle"}
            className="
              px-4 py-1.5 rounded-full text-sm font-medium
              border border-gray-200 dark:border-white/15
              bg-white/60 dark:bg-slate-900/30
              text-gray-800 dark:text-slate-200
              hover:bg-white/90 dark:hover:bg-slate-800/60
              transition
              disabled:opacity-40 cursor-pointer
              flex-shrink-0
              select-none
            "
          >
            {w.text}
          </button>
        ))}
      </div>

      {/* CHECK */}
      <button
        onClick={onCheck}
        disabled={status !== "idle"}
        className="
          mt-3 h-11 rounded-xl
          bg-[#5a47c7]
          text-white font-semibold
          transition hover:brightness-110
          disabled:opacity-50 cursor-pointer
        "
      >
        Check Answer ✓
      </button>

      {/* FEEDBACK */}
      {status !== "idle" && (
        <AnswerFeedback
          isCorrect={status === "correct"}
          message={
            status === "correct"
              ? "✓ Richtig! Gut gemacht."
              : "✗ Falsch. Versuche es nochmal."
          }
        />
      )}
    </section>
  );
}
