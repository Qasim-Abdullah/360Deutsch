import { OrbitControls } from "../utils/OrbitControls.js";
import { camera } from "./camera.js";
import { getRenderer, updateRendererOnResize } from "./renderer.js";

let controls = null;

export function createControls() {
  const renderer = getRenderer();
  if (!renderer) return null;

  controls = new OrbitControls(camera, renderer.domElement);

  controls.minDistance = 5;
  controls.maxDistance = 45;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minAzimuthAngle = 0;
  controls.maxAzimuthAngle = Math.PI / 2;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.update();

  if (window.innerWidth < 768) {
    controls.target.set(
      -0.08206262548844094,
      3.3119233527087255,
      -0.7433922282864018
    );
  } else {
    controls.target.set(
      0.4624746759408973,
      1.9719940043010387,
      -0.8300979125494505
    );
  }

  window.addEventListener("resize", () => {
    updateRendererOnResize();
    controls.update();
  });

  return controls;
}

export function getControls() {
  return controls;
}
