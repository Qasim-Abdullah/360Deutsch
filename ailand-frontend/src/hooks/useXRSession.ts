"use client";

import { useRef, useState } from "react";

export function useXRSession() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const sessionRef = useRef<XRSession | null>(null);
  const glBindingRef = useRef<any>(null);
  const fboRef = useRef<WebGLFramebuffer | null>(null);

  const [running, setRunning] = useState(false);

  const startXR = async (
    onFrame: (view: XRView) => Promise<void>
  ) => {
    const navXR = (navigator as any).xr;
    if (!navXR) throw new Error("WebXR not supported");

    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl") as WebGLRenderingContext;
    glRef.current = gl;

    const isMobile =
      typeof window !== "undefined" &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const features: string[] = ["local-floor", "dom-overlay"];

    // Only real phones support camera-access
    if (isMobile) {
      features.push("camera-access");
    }

    const session = await navXR.requestSession("immersive-ar", {
      requiredFeatures: features,
      domOverlay: { root: document.body },
    } as any);

    sessionRef.current = session;

    await (gl as any).makeXRCompatible();
    const layer = new (window as any).XRWebGLLayer(session, gl);
    session.updateRenderState({ baseLayer: layer });

    if (isMobile) {
      glBindingRef.current = new (window as any).XRWebGLBinding(session, gl);
      fboRef.current = gl.createFramebuffer();
    }

    const refSpace = await session.requestReferenceSpace("local-floor");
    setRunning(true);

    const loop = async (_: number, frame: XRFrame) => {
      const pose = frame.getViewerPose(refSpace);
      if (pose && isMobile) {
        for (const view of pose.views) {
          if ((view as any).camera) {
            await onFrame(view);
            break;
          }
        }
      }
      session.requestAnimationFrame(loop);
    };

    session.requestAnimationFrame(loop);
  };

  const stopXR = async () => {
    await sessionRef.current?.end();
    sessionRef.current = null;
    setRunning(false);
  };

  return {
    canvasRef,
    glRef,
    glBindingRef,
    fboRef,
    running,
    startXR,
    stopXR,
  };
}
