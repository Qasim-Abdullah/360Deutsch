import * as THREE from "three";
import { startTransition } from "./TransitionManager";

const ANCHOR_TARGET = new THREE.Vector3(0, 1.2, -2.4);

export function moveToAnchorPosition(anchor: THREE.Object3D) {
  const startPosition = anchor.position.clone();
  const startRotation = anchor.rotation.clone();

  startTransition({
    duration: 400,
    update: (progress) => {
      // Position interpolation
      anchor.position.lerpVectors(
        startPosition,
        ANCHOR_TARGET,
        progress
      );

      // Rotation interpolation
      anchor.rotation.x =
        startRotation.x + (-0.04 - startRotation.x) * progress;

      anchor.rotation.y =
        startRotation.y + (0 - startRotation.y) * progress;
    }
  });
}
