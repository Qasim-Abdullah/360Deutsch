"use client";

import { useRef, useState, useCallback } from "react";

import { initXRScene, XRRuntime } from "@/components/ui/webxr/core/XRSceneCore";
import { XRViewManager } from "@/components/ui/webxr/core/XRViewManager";
import { createAnchorForNode } from "@/components/ui/webxr/core/AnchorFactory";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";
import AIButton from "@/components/ui/webxr/buttons/AIButton";
import { getARDataAction } from "../actions/arApi";
import kg from "@/data/kg.json";

function viewForNode(node: ARNode): string {
  if (node.type === "root") return "levels";
  if (node.type === "level") return "category";
  if (node.type === "category") return "rooms";
  if (node.type === "subcategory") return "pos";
  if (node.type === "pos") return "word";
  if (node.type === "entry") return "wordDetails";
  return "levels";
}

export default function XRScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const runtimeRef = useRef<XRRuntime | null>(null);
  const managerRef = useRef<XRViewManager | null>(null);

  const [status, setStatus] = useState("Idle");
  const [isARActive, setIsARActive] = useState(false);

  const mountTree = useCallback((root: ARNode) => {
    const xr = runtimeRef.current;
    const manager = managerRef.current;
    if (!xr || !manager) return;

    if (root.type === "root") {
      manager.setRoot("levels", {
        node: root,
        anchor: undefined,
      });
    } else {
      const anchor = createAnchorForNode(root);
      anchor.position.set(0, 0, -2);
      xr.scene.add(anchor);

      manager.setRoot(viewForNode(root), {
        node: root,
        anchor,
      });
    }

    setStatus(`AR Data: ${root.label}`);
  }, []);

  const startAR = useCallback(async () => {
    const canvas = canvasRef.current;
    const overlayRoot = overlayRef.current;

    if (!canvas || !overlayRoot) return;
    if (runtimeRef.current) return;

    const xr = await initXRScene({
      canvas,
      domOverlayRoot: overlayRoot,
      onSessionEnd: () => {
        managerRef.current = null;
        runtimeRef.current = null;
        setIsARActive(false);
        setStatus("Idle");
      },
    });

    if (!xr) return;

    runtimeRef.current = xr;

    const manager = new XRViewManager(xr.scene);
    managerRef.current = manager;
    manager.init();

    setIsARActive(true);
    setStatus("AR Running");

    // Initial load → local KG only
    mountTree(kg as ARNode);
    setStatus("Loaded default KG");

    
  }, [mountTree]);

  const leaveAR = useCallback(async () => {
    await runtimeRef.current?.stop();
  }, []);

  const onARData = useCallback(
    (root: ARNode) => {
      mountTree(root);
    },
    [mountTree],
  );

  return (
    <div
      ref={overlayRef}
      id="xr-root"
      className="w-full h-screen relative overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className={[
          "absolute inset-0 w-full h-full z-0",
          isARActive ? "pointer-events-none" : "pointer-events-auto",
        ].join(" ")}
      />

      <div className="absolute top-4 left-4 z-50 flex gap-3">
        {!isARActive ? (
          <button
            onClick={startAR}
            className="px-4 py-2 bg-white text-white text-black rounded-lg  bg-gradient-to-r  from-[#9160a8] to-[#dc9b6c]"
          >
            Start AR
          </button>
        ) : (
          <>
            <button
              onClick={leaveAR}
              className="px-4 py-2 rounded-lg text-white font-semibold
             bg-gradient-to-r  from-[#9160a8] to-[#dc9b6c]
             hover:opacity-90 transition-all duration-200
             shadow-lg shadow-[#5a47c7]/30"
            >
              Leave AR
            </button>

            <AIButton onARData={onARData} />
          </>
        )}

        {/* <div className="px-4 py-2 bg-white/80 text-black rounded-lg">
          {status}
        </div> */}
      </div>
    </div>
  );
}
