import * as THREE from "three";
import { sizes } from "./setup.js";

export const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  200
);

if (window.innerWidth < 768) {
  camera.position.set(29.567116827654726, 14.018476147584705, 31.37040363900147);
} else {
  camera.position.set(17.49173098423395, 9.108969527553887, 17.850992894238058);
}
