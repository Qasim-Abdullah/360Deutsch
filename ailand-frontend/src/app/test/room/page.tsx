"use client";

import { useRef, useState } from "react";
import * as THREE from "three";

import { initXRScene } from "@/components/ui/webxr/core/XRSceneCore";

import {
  loadRoom,
  finalizeRoom,
} from "@/features/rooms/room1/models/objectsAr";

export default function RoomARPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const xrRef = useRef<any>(null);

  const [status, setStatus] = useState("Idle");

  const startAR = async () => {
    if (!canvasRef.current) return;

    const xr = await initXRScene(canvasRef.current);

    if (!xr) {
      setStatus("XR Not Supported");
      return;
    }

    xrRef.current = xr;

    const { scene } = xr;

    // Position room in front of user
    const root = new THREE.Group();
    root.position.set(0, -0.2, -1);
    root.scale.setScalar(0.08);

    scene.add(root);

    // Load your AR room
    loadRoom(root);

    // Finalize when loaded
    setTimeout(() => {
      finalizeRoom(scene);
    }, 1500);

    setStatus("AR Running");
  };

  const stopAR = async () => {
    if (!xrRef.current) return;

    await xrRef.current.stop();

    xrRef.current = null;
    setStatus("Stopped");
  };

  return (
    <div className="w-full h-screen relative bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 z-10 flex gap-3">

        <button
          onClick={startAR}
          className="px-4 py-2 bg-white text-black rounded-lg"
        >
          Start AR
        </button>

        <button
          onClick={stopAR}
          className="px-4 py-2 bg-white text-black rounded-lg"
        >
          Stop
        </button>

        <div className="px-4 py-2 bg-white/80 text-black rounded-lg">
          {status}
        </div>

      </div>
    </div>
  );
}
