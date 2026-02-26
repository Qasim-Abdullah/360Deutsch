import * as THREE from "three";
import { XRState } from "./XRState";
import { isTransitioning } from "./TransitionManager";

export function handleRaycast(
  raycaster: THREE.Raycaster,
  scene: THREE.Scene
) {
  if (!XRState.interactionEnabled) return;
  if (isTransitioning()) return;

  const interactive: THREE.Object3D[] = [];
  scene.traverse(obj => {
    if (
      obj.name === "cta" ||
      obj.name === "chat" ||
      obj.name === "audio" ||
      obj.name === "prev" ||
      obj.name === "next" ||
      obj.name === "icon"
    ) {
      interactive.push(obj);
    }
  });


  const hits = raycaster.intersectObjects(interactive, true);
  if (!hits.length) return;

  const hit = hits[0];

  if (hit.object.name === "prev") {
    hit.object.parent?.userData.prev?.();
    return;
  }

  if (hit.object.name === "next") {
    hit.object.parent?.userData.next?.();
    return;
  }



  //audio part
  if (hit.object.name === "audio") {
    const audio: HTMLAudioElement | undefined = hit.object.userData.audio;

    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => { });
    }

    return;
  }

  //3d room 
  if (hit.object.name === "icon") {
    hit.object.userData.onClick?.();
    return;
  }


  //cta
  let root: THREE.Object3D | null = hit.object;
  while (root && !(root as any).userData?.onEnter) {
    root = root.parent;
  }

  if (!root) return;
  if ((root as any).userData.disabled) return;

  (root as any).userData.onEnter?.();
}
