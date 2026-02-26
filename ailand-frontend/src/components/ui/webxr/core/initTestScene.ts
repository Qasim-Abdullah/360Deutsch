import * as THREE from "three";
import { updateTransitions } from "./TransitionManager";
import { XRState } from "./XRState";
import { handleRaycast } from "./Interaction";

export function initTestScene(
  canvas: HTMLCanvasElement
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e293b);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    100
  );

  camera.position.set(0, 1.6, 1.3);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.3));

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function animate() {
    requestAnimationFrame(animate);

    updateTransitions();

    // update dynamic edges
    scene.traverse(obj => {
      obj.userData.update?.();
    });

    renderer.render(scene, camera);
  }


  animate();

  XRState.interactionEnabled = true;

  window.addEventListener("click", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    handleRaycast(raycaster, scene);
  });

  return {
    renderer,
    scene,
    camera,
  };
}
