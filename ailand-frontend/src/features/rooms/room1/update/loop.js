import * as THREE from "three";
import { getRenderer } from "../scene/renderer.js";
import { camera } from "../scene/camera.js";
import { scene } from "../scene/setup.js";
import { controls, getControls } from "../scene/controls.js";
import { smokeMaterial } from "../materials/smoke.js";
import { fish, hourHand, minuteHand } from "../models/objects.js";
import { handleHover } from "./hover.js";

const clock = new THREE.Clock();

function updateClock() {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();

  if (hourHand) hourHand.rotation.z = -(hours + minutes / 60) * (Math.PI / 6);
  if (minuteHand) minuteHand.rotation.z = -minutes * (Math.PI / 30);
}

export function animate() {
  const elapsed = clock.getElapsedTime();

  if (smokeMaterial?.uniforms?.uTime) {
    smokeMaterial.uniforms.uTime.value = elapsed;
  }

  if (fish?.userData?.initialPosition) {
    fish.position.y =
      fish.userData.initialPosition.y + Math.sin(elapsed * 2) * 0.05;
  }

  updateClock();
getControls()?.update();
  handleHover(scene, camera);

  const renderer = getRenderer();
  if (renderer) {
    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}
