// models/objectsAr.js
import * as THREE from "three";
import gsap from "gsap";

import { loader } from "./loadRoomAr.js";
import { hasIntroAnimation } from "./loadRoomAr.js";
import { roomMaterials, glassMaterial, whiteMaterial } from "../materials/materials.js";
import { textureMap } from "../materials/textures.js";

export const raycasterObjects = [];
export const hitboxToObjectMap = new Map();
export const objectsNeedingHitboxes = [];

const invisibleMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  visible: false,
});

let roomRoot = null;
let delayedVideoMeshes = [];
let didFinalize = false;

export function loadRoom(parent) {
  loader.load("/models/Room_Portfolio.glb", (glb) => {
    roomRoot = glb.scene;

    roomRoot.traverse((child) => {
      if (!child.isMesh) return;

      if (child.name.includes("Kirby")) {
        child.visible = false;
        return;
      }

      if (hasIntroAnimation(child.name)) {
        child.scale.set(0, 0, 0);
      }

      if (child.name.includes("Water")) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x558bc8,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
        });
        return;
      }

      if (child.name.includes("Glass")) {
        child.material = glassMaterial;
        return;
      }

      if (child.name.includes("Bubble")) {
        child.material = whiteMaterial;
        return;
      }

      if (child.name.includes("Screen")) {
        delayedVideoMeshes.push(child);
        child.material = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.9,
        });
        return;
      }

      Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          child.material = roomMaterials[key];
        }
      });

      if (child.name.includes("Raycaster")) {
        if (hasIntroAnimation(child.name)) {
          objectsNeedingHitboxes.push(child);
        } else {
          createStaticHitbox(child.parent, parent);
        }
      }
    });

    ["Second"].forEach((name) => {
      const obj = roomRoot.getObjectByName(name);
      obj?.parent?.remove(obj);
    });

    parent.add(roomRoot);
  });
}

function createStaticHitbox(object, parent) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(size.x * 1.1, size.y * 1.75, size.z * 1.1),
    invisibleMaterial
  );

  hitbox.position.copy(center);
  parent.add(hitbox);

  raycasterObjects.push(hitbox);
  hitboxToObjectMap.set(hitbox, object);
}

const raf = () => new Promise((resolve) => requestAnimationFrame(resolve));

export function finalizeRoom(scene) {
  if (didFinalize) return;
  didFinalize = true;

  setTimeout(() => {
    delayedVideoMeshes.forEach((mesh) => {
      const video = document.createElement("video");
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.src = "/textures/video/Screen.mp4";
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});

      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;

      mesh.material.map = texture;
      mesh.material.needsUpdate = true;
    });
  }, 500);

  (async () => {
    await raf();
    await raf();
    createDelayedHitboxesBatched(scene, 25);
    setTimeout(() => {
      playIntroAnimation();
    }, 250);
  })();
}

function createDelayedHitboxesBatched(scene, batchSize = 25) {
  let i = 0;

  const step = () => {
    const end = Math.min(i + batchSize, objectsNeedingHitboxes.length);

    for (; i < end; i++) {
      const mesh = objectsNeedingHitboxes[i];

      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const hitbox = new THREE.Mesh(
        new THREE.BoxGeometry(size.x * 1.1, size.y * 1.75, size.z * 1.1),
        invisibleMaterial
      );

      hitbox.position.copy(center);
      scene.add(hitbox);

      raycasterObjects.push(hitbox);
      hitboxToObjectMap.set(hitbox, mesh);
    }

    if (i < objectsNeedingHitboxes.length) {
      requestAnimationFrame(step);
    } else {
      objectsNeedingHitboxes.length = 0;
    }
  };

  requestAnimationFrame(step);
}

function playIntroAnimation() {
  if (!roomRoot) return;

  roomRoot.traverse((child) => {
    if (!child.isMesh) return;
    if (!hasIntroAnimation(child.name)) return;

    gsap.to(child.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.8,
      ease: "back.out(1.8)",
    });
  });
}
