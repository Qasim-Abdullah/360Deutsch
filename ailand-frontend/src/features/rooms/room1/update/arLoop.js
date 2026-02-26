import * as THREE from "three";

const camera = new THREE.PerspectiveCamera();
camera.position.set(0, 1.6, 0);

export function startARLoop({ renderer, scene }) {
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

export function stopARLoop(renderer) {
  if (!renderer) return;
  renderer.setAnimationLoop(null);
}
