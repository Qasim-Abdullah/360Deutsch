"use client";

import "@google/model-viewer";
import { useEffect, useRef, useState } from "react";

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
}: {
  obj: FloatingObject;
  position: string;
  onSelect: (id: string) => void;
}) {
  const viewerRef = useRef<HTMLModelViewerElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

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
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", up);
    };
  }, [obj]);

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

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="relative flex-1 overflow-visible select-none">
      {objects.map((obj, index) => (
        <FloatingModel
          key={obj.id}
          obj={obj}
          position={positions[index]}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
