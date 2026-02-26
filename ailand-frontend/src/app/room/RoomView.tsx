"use client";

import { useEffect, useRef } from "react";
import "@/features/rooms/room1/style.scss";

type RoomViewProps = {
  /** When true, the 3D room is contained in its parent instead of full viewport */
  embedded?: boolean;
};

export default function RoomView({ embedded }: RoomViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let destroy: (() => void) | undefined;

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

  const content = (
    <div id="experience">
      <canvas id="experience-canvas" ref={canvasRef} />
    </div>
  );

  if (embedded) {
    return (
      <div className="room-embedded">
        {content}
      </div>
    );
  }

  return content;
}
