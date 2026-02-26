"use client";

import { useEffect, useRef, useState } from "react";
import "@/features/rooms/room1/style-embedded.scss";

type RevealedWord = { word: string; article: string; english?: string; category?: string };

type RoomViewEmbeddedProps = {
  height?: string;
  revealedObjects?: RevealedWord[];
  /** Called when a word is dropped on the room. objectWord is the vocabulary word at drop position (or null). */
  onDropWord?: (droppedWord: string, objectWord: string | null) => void;
  /** Called when an object in the room is clicked. objectWord is the vocabulary word for that object (or null). Use for click-to-match. */
  onRoomObjectClick?: (objectWord: string | null) => void;
};

function dispatchRevealed(words: string[]) {
  if (typeof document !== "undefined") {
    document.dispatchEvent(
      new CustomEvent("room:setRevealed", { detail: { words } })
    );
  }
}

export default function RoomViewEmbedded({
  height = "480px",
  revealedObjects = [],
  onDropWord,
  onRoomObjectClick,
}: RoomViewEmbeddedProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const didSetLevel2 = useRef(false);
  const onDropWordRef = useRef(onDropWord);
  const onRoomObjectClickRef = useRef(onRoomObjectClick);
  const [roomReady, setRoomReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 1 });
  onDropWordRef.current = onDropWord;
  onRoomObjectClickRef.current = onRoomObjectClick;

  useEffect(() => {
    let destroy: (() => void) | undefined;

    if (
      typeof window !== "undefined" &&
      !didSetLevel2.current &&
      revealedObjects !== undefined
    ) {
      (window as unknown as { __ROOM_LEVEL2?: boolean }).__ROOM_LEVEL2 = true;
      didSetLevel2.current = true;
    }

    const init = async () => {
      const module = await import("@/features/rooms/room1/main");
      if (module?.default) {
        destroy = module.default(canvasRef.current);
      }
    };

    init();

    return () => {
      destroy?.();
    };
  }, []);

  useEffect(() => {
    const words = revealedObjects.map((o) => o.word.toLowerCase());
    if (words.length > 0) dispatchRevealed(words);
  }, [revealedObjects]);

  useEffect(() => {
    const onReady = () => {
      const words = revealedObjects.map((o) => o.word.toLowerCase());
      if (words.length > 0) dispatchRevealed(words);
    };
    document.addEventListener("room:ready", onReady);
    return () => document.removeEventListener("room:ready", onReady);
  }, [revealedObjects]);

  
  useEffect(() => {
    const onIntroStart = () => setRoomReady(true);
    document.addEventListener("intro:start", onIntroStart);

    const onProgress = (e: Event) => {
      const { loaded, total } = (e as CustomEvent<{ loaded: number; total: number }>).detail;
      setLoadProgress({ loaded, total });
    };
    document.addEventListener("room:loadProgress", onProgress);

    const useFallback =
      typeof window !== "undefined" &&
      (window as unknown as { __ROOM_LEVEL2?: boolean }).__ROOM_LEVEL2;
    const fallbackId = useFallback
      ? setTimeout(() => setRoomReady(true), 2000)
      : null;
    return () => {
      document.removeEventListener("intro:start", onIntroStart);
      document.removeEventListener("room:loadProgress", onProgress);
      if (fallbackId != null) clearTimeout(fallbackId);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = container?.querySelector("canvas");
    if (!container || !onDropWordRef.current) return;

    const handleDragEnter = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const de = e as DragEvent;
      if (de.dataTransfer) de.dataTransfer.dropEffect = "move";
    };

    const handleDragOver = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const de = e as DragEvent;
      if (de.dataTransfer) de.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: Event) => {
      const de = e as DragEvent;
      de.preventDefault();
      de.stopPropagation();
      const droppedWord = de.dataTransfer?.getData("text/plain")?.trim()?.toLowerCase();
      if (!droppedWord) return;

      let didCall = false;
      const invoke = (objectWord: string | null) => {
        if (didCall) return;
        didCall = true;
        document.removeEventListener("room:objectPicked", onPicked);
        clearTimeout(fallbackId);
        onDropWordRef.current?.(droppedWord, objectWord);
      };

      const onPicked = (ev: Event) => {
        const word = (ev as CustomEvent<{ word: string | null }>).detail?.word ?? null;
        invoke(word);
      };
      document.addEventListener("room:objectPicked", onPicked);

     
      const clientX = de.clientX;
      const clientY = de.clientY;
      requestAnimationFrame(() => {
        window.dispatchEvent(
          new CustomEvent("room:pickAt", {
            detail: { clientX, clientY },
          })
        );
      });

    
      const fallbackId = setTimeout(() => invoke(null), 200);
    };

    const targets: (HTMLDivElement | HTMLCanvasElement | Element)[] = [container];
    if (canvasRef.current) targets.push(canvasRef.current);
    else if (canvas) targets.push(canvas);
    for (const el of targets) {
      el.addEventListener("dragenter", handleDragEnter, true);
      el.addEventListener("dragover", handleDragOver, true);
      el.addEventListener("drop", handleDrop, true);
    }
    return () => {
      for (const el of targets) {
        el.removeEventListener("dragenter", handleDragEnter, true);
        el.removeEventListener("dragover", handleDragOver, true);
        el.removeEventListener("drop", handleDrop, true);
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onRoomObjectClickRef.current || !roomReady) return;

    if (process.env.NODE_ENV === "development") {
      console.log("[Level3 room] Click-to-match ready");
    }

    const runPick = (clientX: number, clientY: number) => {
      const onPicked = (ev: Event) => {
        document.removeEventListener("room:objectPicked", onPicked);
        const word = (ev as CustomEvent<{ word: string | null }>).detail?.word ?? null;
        if (process.env.NODE_ENV === "development") {
          console.log("[Level3 room] Object clicked -> word:", word);
        }
        onRoomObjectClickRef.current?.(word);
      };
      document.addEventListener("room:objectPicked", onPicked);
      const ev = new CustomEvent("room:pickAt", { detail: { clientX, clientY } });
      window.dispatchEvent(ev);
    };

    const isInsideRoom = (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    };

    let lastPickAt = 0;
    const runPickIfInside = (clientX: number, clientY: number, source: string) => {
      if (!isInsideRoom(clientX, clientY)) return;
      const now = Date.now();
      if (now - lastPickAt < 300) return;
      lastPickAt = now;
      if (process.env.NODE_ENV === "development") {
        console.log("[Level3 room] Run pick from", source, { x: clientX, y: clientY });
      }
      runPick(clientX, clientY);
    };

    const isNavbarTouch = (target: EventTarget | null) => {
      if (!target || !(target instanceof Node)) return false;
      const nav = document.querySelector("[data-mobile-navbar]");
      return nav ? nav.contains(target) : false;
    };

    const handleClick = (e: MouseEvent) => {
      if (isNavbarTouch(e.target)) return;
      const inside = isInsideRoom(e.clientX, e.clientY);
      if (process.env.NODE_ENV === "development") {
        console.log("[Level3 room] Click", inside ? "(inside room)" : "(outside, ignored)", { x: e.clientX, y: e.clientY });
      }
      if (!inside) return;
      runPickIfInside(e.clientX, e.clientY, "click");
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isNavbarTouch(e.target)) return;
      runPickIfInside(e.clientX, e.clientY, "pointerup");
    };

    document.addEventListener("click", handleClick as EventListener, false);
    document.addEventListener("pointerup", handlePointerUp as EventListener, false);
    return () => {
      document.removeEventListener("click", handleClick as EventListener, false);
      document.removeEventListener("pointerup", handlePointerUp as EventListener, false);
    };
  }, [roomReady]);

  return (
    <div
      ref={containerRef}
      className="room-embedded"
      style={{ height, position: "relative" }}
    >
      {/* Loading overlay */}
      {!roomReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm rounded-xl transition-opacity duration-300">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
            Loading room...
            {loadProgress.total > 1 &&
              ` (${Math.round((loadProgress.loaded / loadProgress.total) * 100)}%)`}
          </p>
        </div>
      )}
      <div id="experience">
        <canvas id="experience-canvas" ref={canvasRef} />
      </div>
    </div>
  );
}
