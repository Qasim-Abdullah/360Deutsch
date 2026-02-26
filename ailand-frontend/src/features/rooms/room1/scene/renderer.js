import * as THREE from "three";
import { sizes, updateSizes } from "./setup.js";
import { camera } from "./camera.js";

let renderer = null;
let resizeObserver = null;

function getCanvasSize(canvas) {
  const container = canvas.parentElement;
  let w = container?.clientWidth ?? canvas.clientWidth ?? window.innerWidth;
  let h = container?.clientHeight ?? canvas.clientHeight ?? window.innerHeight;
  if (!w || !h) {
    w = w || window.innerWidth;
    h = h || window.innerHeight;
  }
  return { width: w, height: h };
}

function applySize(canvas) {
  if (!renderer || !canvas) return;
  const { width, height } = getCanvasSize(canvas);
  if (!width || !height) return;
  updateSizes(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

export function setCanvas(canvas) {
  if (!canvas) return () => {};

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  // Use canvas container size so embedded room fits the panel (not full window)
  applySize(canvas);
  requestAnimationFrame(() => applySize(canvas));

  resizeObserver = new ResizeObserver(() => {
    applySize(canvas);
  });
  resizeObserver.observe(canvas.parentElement || canvas);

  return () => {
    resizeObserver?.disconnect();
    resizeObserver = null;
  };
}

export function getRenderer() {
  return renderer;
}

export const updateRendererOnResize = () => {
  if (!renderer) return;
  const canvas = renderer.domElement;
  applySize(canvas);
};

export { renderer };
