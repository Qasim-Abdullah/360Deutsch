import * as THREE from "three";
import { updateTransitions } from "./TransitionManager";
import { XRState } from "./XRState";
import { handleRaycast } from "./Interaction";

export type XRRuntime = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  session: XRSession;
  stop: () => Promise<void>;
};

type InitXRSceneArgs = {
  canvas: HTMLCanvasElement;
  domOverlayRoot: HTMLElement;
  onFrame?: (scene: THREE.Scene, camera: THREE.Camera) => void;
  onSessionEnd?: () => void;
};

export async function initXRScene(args: InitXRSceneArgs): Promise<XRRuntime | null> {
  const { canvas, domOverlayRoot, onFrame, onSessionEnd } = args;

  if (!navigator.xr) return null;

  const supported = await navigator.xr.isSessionSupported("immersive-ar");
  if (!supported) return null;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: false,   // ADD THIS
  });

  renderer.setClearAlpha(0);
  renderer.setClearColor(0x000000, 0);  // ADD THIS

renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.xr.enabled = true;

  const scene = new THREE.Scene();
  scene.position.set(0, -1.6, 0); 

  scene.background = null;              

  const camera = new THREE.PerspectiveCamera();
scene.add(camera); // ← THIS WAS MISSING
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.3));

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tempMatrix = new THREE.Matrix4();

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  };
  window.addEventListener("resize", onResize);

  const onWindowClick = (e: MouseEvent) => {
    // Works for non-AR testing, but in AR you should rely on controller select.
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    handleRaycast(raycaster, scene);
  };
  window.addEventListener("click", onWindowClick);

  const controller = renderer.xr.getController(0);
  scene.add(controller);

  const onSelect = () => {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    handleRaycast(raycaster, scene);
  };
  controller.addEventListener("select", onSelect);

  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType("local");

  const session = await navigator.xr.requestSession("immersive-ar", {
    requiredFeatures: ["local"],
    optionalFeatures: ["dom-overlay", "hit-test"],
    domOverlay: { root: domOverlayRoot },
  });

  const cleanup = () => {
    renderer.setAnimationLoop(null);

    controller.removeEventListener("select", onSelect);
    window.removeEventListener("click", onWindowClick);
    window.removeEventListener("resize", onResize);

    renderer.dispose();
  };

  session.addEventListener("end", () => {
    XRState.interactionEnabled = false;
    onSessionEnd?.();
    cleanup();
  });



  renderer.xr.setSession(session);

  XRState.interactionEnabled = true;

  renderer.setAnimationLoop(() => {
    updateTransitions();

    scene.traverse((obj) => {
      obj.userData.update?.();
    });

    onFrame?.(scene, camera);
    renderer.render(scene, camera);
  });

  return {
    renderer,
    scene,
    camera,
    session,
    stop: async () => {
      const s = renderer.xr.getSession();
      if (s) await s.end();
    },
  };
}