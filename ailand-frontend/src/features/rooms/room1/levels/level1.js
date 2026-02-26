import * as THREE from "three";
import { camera } from "../scene/camera.js";
import { renderer } from "../scene/renderer.js";
import { extractedChair } from "../models/objects.js";

import { scene } from "../scene/setup.js"; // or correct relative path
scene.background = new THREE.Color(0x1a1a1a);

scene.add(
  new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: "hotpink" })
  )
);


camera.position.set(0, 1.5, 3);
camera.lookAt(0, 0, 0);

function animate() {
  requestAnimationFrame(animate);

  if (extractedChair) {
    extractedChair.rotation.y += 0.005;
    extractedChair.position.y = Math.sin(Date.now() * 0.002) * 0.05;
  }

  renderer.render(scene, camera);
}

function init() {
  if (extractedChair) {
    scene.add(extractedChair);
  }

  animate();
}


init();
