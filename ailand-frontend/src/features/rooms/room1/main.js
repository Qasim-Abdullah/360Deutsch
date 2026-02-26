import * as THREE from "three";

/* =========================
   SCENE CORE
========================= */
import { scene } from "./scene/setup.js";
import { camera } from "./scene/camera.js";
import { renderer, setCanvas, updateRendererOnResize } from "./scene/renderer.js";
import { createControls } from "./scene/controls.js";

/* =========================
   AUDIO
========================= */
import "./audio/music.js";
import "./audio/piano.js";
import "./audio/button.js";

/* =========================
   MATERIALS / EFFECTS
========================= */
import { smoke } from "./materials/smoke.js";

/* =========================
   MODELS
========================= */
import { loadRoom, playIntroAnimation, showAllIntroObjects } from "./models/objects.js";
import { manager } from "./models/loadRoom.js";

/* =========================
   UPDATE LOOP
========================= */
import { animate } from "./update/loop.js";
import { enableHover } from "./update/hover.js";


export default function initRoom(canvas) {
  if (!canvas) return;

  const cleanupCanvas = setCanvas(canvas);
  createControls();


  scene.add(smoke);
  loadRoom(scene);

  manager.onLoad = () => {
    setTimeout(() => {
      document.dispatchEvent(new Event("intro:start"));
    }, 0);
  };

  document.addEventListener("intro:start", () => {
    if (typeof window !== "undefined" && window.__ROOM_LEVEL2) {
      showAllIntroObjects(scene);
      enableHover();
    } else {
      playIntroAnimation();
      enableHover();
    }
  });

  animate();

  return () => {
    if (typeof window !== "undefined" && window.__roomRevealCleanup) {
      window.__roomRevealCleanup();
      window.__roomRevealCleanup = undefined;
    }
    cleanupCanvas?.();
    renderer.dispose?.();
  };
}
