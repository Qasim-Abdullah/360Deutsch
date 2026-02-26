import * as THREE from "three";

let arRenderer = null;

export function setARCanvas(canvas) {
  arRenderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  arRenderer.setSize(window.innerWidth, window.innerHeight);
  arRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  arRenderer.xr.enabled = true;

  window.addEventListener("resize", () => {
    if (!arRenderer) return;
    arRenderer.setSize(window.innerWidth, window.innerHeight);
    arRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

export function getARRenderer() {
  return arRenderer;
}


