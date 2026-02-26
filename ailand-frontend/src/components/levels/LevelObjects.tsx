"use client";

import "@google/model-viewer";
import { useCallback, useEffect, useRef, useState } from "react";

type FloatingObject = {
  id: string;
  src: string;
  cameraOrbit?: string;
};

type Props = {
  objects: FloatingObject[];
  onSelect: (id: string) => void;
};

const positions = [
  "top-12 left-12",
  "top-12 right-12",
  "bottom-12 right-12",
  "bottom-12 left-12",
  "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
];

function FloatingModel({
  obj,
  position,
  onSelect,
  onLoad,
}: {
  obj: FloatingObject;
  position: string;
  onSelect: (id: string) => void;
  onLoad: () => void;
}) {
  const viewerRef = useRef<HTMLModelViewerElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const handleLoad = () => onLoad();
    el.addEventListener("load", handleLoad);

    const baseOrbit = obj.cameraOrbit || "0deg 75deg auto";
    const [h, v, d] = baseOrbit.split(" ");
    const baseAngle = parseFloat(h) || 0;

    let angle = baseAngle;
    let dir = 1;
    let userInteracting = false;

    el.cameraOrbit = baseOrbit;

    const down = () => (userInteracting = true);
    const up = () => (userInteracting = false);

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);

    const interval = setInterval(() => {
      if (userInteracting) return;

      angle += dir * 0.2;

      if (angle >= baseAngle + 30) dir = -1;
      if (angle <= baseAngle - 30) dir = 1;

      el.cameraOrbit = `${angle}deg ${v} ${d}`;
    }, 16);

    return () => {
      clearInterval(interval);
      el.removeEventListener("load", handleLoad);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", up);
    };
  }, [obj, onLoad]);

  function handleClick() {
    setActive(true);
    onSelect(obj.id);

    setTimeout(() => {
      setActive(false);
    }, 300);
  }

  return (
    <div
      className={`absolute ${position} flex items-center justify-center cursor-pointer`}
      onClick={handleClick}
    >
      <div
        className={`
          w-[160px] h-[160px]
          xl:w-[180px] xl:h-[180px]
          animate-float
          will-change-transform
          dark:bg-transparent
          rounded-xl
          transition-transform duration-200
          ${active ? "scale-110" : "scale-100"}
        `}
      >
        <model-viewer
          ref={viewerRef}
          src={obj.src}
          camera-controls
          disable-zoom
          interaction-prompt="none"
          disable-tap
          className="w-full h-full"
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}

export default function FloatingObjects({ objects, onSelect }: Props) {
  const [ready, setReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const allLoaded = loadedCount >= objects.length;

  useEffect(() => {
    setReady(true);
  }, []);

  // Fallback: dismiss overlay after 30s even if models haven't loaded
  useEffect(() => {
    if (allLoaded) return;
    const timeout = setTimeout(() => setLoadedCount(objects.length), 30000);
    return () => clearTimeout(timeout);
  }, [allLoaded, objects.length]);

  const handleModelLoad = useCallback(() => {
    setLoadedCount((prev) => prev + 1);
  }, []);

  if (!ready) return null;

  return (
    <div className="relative flex-1 overflow-visible select-none">
      {/* Loading overlay */}
      {!allLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm rounded-xl transition-opacity duration-300">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
            Loading 3D models... ({loadedCount}/{objects.length})
          </p>
        </div>
      )}
      {objects.map((obj, index) => (
        <FloatingModel
          key={obj.id}
          obj={obj}
          position={positions[index]}
          onSelect={onSelect}
          onLoad={handleModelLoad}
        />
      ))}
    </div>
  );
}
