import * as THREE from "three";
import { loader } from "./loadRoom.js";
import {
  roomMaterials,
  glassMaterial,
  whiteMaterial,
} from "../materials/materials.js";
import { textureMap } from "../materials/textures.js";
import {
  xAxisFans,
  yAxisFans,
  objectsWithIntroAnimations,
  hasIntroAnimation,
} from "./loadRoom.js";

export let extractedChair = null;

const invisibleMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  visible: false,
});

export const raycasterObjects = [];
export const hitboxToObjectMap = new Map();

export function playHoverAnimation(objectHitbox, isHovering) {
  let scale = 1.4;
  const object = hitboxToObjectMap.get(objectHitbox);
  if (!object) return;

  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);

  if (object.name.includes("Fish")) scale = 1.2;

  if (isHovering) {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * scale,
      y: object.userData.initialScale.y * scale,
      z: object.userData.initialScale.z * scale,
      duration: 0.5,
      ease: "back.out(2)",
    });

    if (object.name.includes("About_Button")) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x - Math.PI / 10,
        duration: 0.5,
        ease: "back.out(2)",
      });
    }

    if (
      object.name.includes("Contact_Button") ||
      object.name.includes("My_Work_Button") ||
      object.name.includes("GitHub") ||
      object.name.includes("YouTube") ||
      object.name.includes("Twitter")
    ) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x + Math.PI / 10,
        duration: 0.5,
        ease: "back.out(2)",
      });
    }

    if (object.name.includes("Boba") || object.name.includes("Name_Letter")) {
      gsap.to(object.position, {
        y: object.userData.initialPosition.y + 0.2,
        duration: 0.5,
        ease: "back.out(2)",
      });
    }
  } else {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "back.out(2)",
    });

    gsap.to(object.rotation, {
      x: object.userData.initialRotation.x,
      duration: 0.3,
      ease: "back.out(2)",
    });

    gsap.to(object.position, {
      y: object.userData.initialPosition.y,
      duration: 0.3,
      ease: "back.out(2)",
    });
  }
}

export function createDelayedHitboxes() {
  objectsNeedingHitboxes.forEach((mesh) => {
    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const sizeMultiplier = { x: 1.1, y: 1.75, z: 1.1 };

    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(
        size.x * sizeMultiplier.x,
        size.y * sizeMultiplier.y,
        size.z * sizeMultiplier.z,
      ),
      invisibleMaterial,
    );

    hitbox.position.copy(center);
    hitbox.name = `${mesh.name}_Raycaster`;

    raycasterObjects.push(hitbox);
    hitboxToObjectMap.set(hitbox, mesh);

    mesh.parent.add(hitbox);
  });

  objectsNeedingHitboxes.length = 0;
}

/** Create a hitbox for an object (for raycast pick). Used by load pipeline and Level 3 fallback. */
export function createStaticHitbox(originalObject) {
  // store initial transforms once
  if (!originalObject.userData.initialScale) {
    originalObject.userData.initialScale = originalObject.scale.clone();
    originalObject.userData.initialPosition = originalObject.position.clone();
    originalObject.userData.initialRotation = originalObject.rotation.clone();
  }

  const box = new THREE.Box3().setFromObject(originalObject);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const sizeMultiplier = { x: 1.1, y: 1.75, z: 1.1 };

  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(
      size.x * sizeMultiplier.x,
      size.y * sizeMultiplier.y,
      size.z * sizeMultiplier.z,
    ),
    invisibleMaterial,
  );

  hitbox.position.copy(center);
  hitbox.name = `${originalObject.name}_Raycaster`;

  return hitbox;
}

const pianoKeyMap = {
  C1_Key: true,
  "C#1_Key": true,
  D1_Key: true,
  "D#1_Key": true,
  E1_Key: true,
  F1_Key: true,
  "F#1_Key": true,
  G1_Key: true,
  "G#1_Key": true,
  A1_Key: true,
  "A#1_Key": true,
  B1_Key: true,
  C2_Key: true,
  "C#2_Key": true,
  D2_Key: true,
  "D#2_Key": true,
  E2_Key: true,
  F2_Key: true,
  "F#2_Key": true,
  G2_Key: true,
  "G#2_Key": true,
  A2_Key: true,
  "A#2_Key": true,
  B2_Key: true,
};

export const pianoKeys = {};

export let fish, chairTop, hourHand, minuteHand, coffeePosition;
export let plank1, plank2, workBtn, aboutBtn, contactBtn;
export let boba, github, youtube, twitter;
export let letter1,
  letter2,
  letter3,
  letter4,
  letter5,
  letter6,
  letter7,
  letter8;
export let flower1, flower2, flower3, flower4, flower5;
export let box1, box2, box3, lamp, slippers1, slippers2;
export let egg1, egg2, egg3, frame1, frame2, frame3;

export const objectsNeedingHitboxes = [];

export let roomRoot = null;

export function loadRoom(scene) {
  loader.load("/models/Room_Portfolio.glb", (glb) => {
    glb.scene.traverse((child) => {
      if (!child.isMesh) return;

      if (child.name.includes("Kirby")) {
        child.visible = false;
        return;
      }

      /* ---------- references & initial state ---------- */

      if (child.name.includes("Fish_Fourth")) {
        fish = child;
        child.position.x += 0.04;
        child.position.z -= 0.03;
        child.userData.initialPosition = child.position.clone();
      }

      if (child.name.includes("Chair_Top")) {
        chairTop = child;
        child.userData.initialRotation = child.rotation.clone();
      }

      if (child.name.includes("Hour_Hand")) {
        hourHand = child;
        child.userData.initialRotation = child.rotation.clone();
      }

      if (child.name.includes("Minute_Hand")) {
        minuteHand = child;
        child.userData.initialRotation = child.rotation.clone();
      }

      if (child.name.includes("Coffee")) {
        coffeePosition = child.position.clone();
      }

      if (child.name.includes("Hover") || child.name.includes("Key")) {
        child.userData.initialScale = child.scale.clone();
        child.userData.initialPosition = child.position.clone();
        child.userData.initialRotation = child.rotation.clone();
      }

      /* ---------- hard-mapped intro objects (same as original) ---------- */

      if (child.name.includes("Hanging_Plank_1")) {
        plank1 = child;
        child.scale.set(0, 0, 1);
      } else if (child.name.includes("Hanging_Plank_2")) {
        plank2 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("My_Work_Button")) {
        workBtn = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("About_Button")) {
        aboutBtn = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Contact_Button")) {
        contactBtn = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Boba")) {
        boba = child;

        // ✅ CLONE BEFORE INTRO SCALE
        if (!extractedChair) {
          extractedChair = child.clone(true);
          extractedChair.position.set(0, 0, 0);
          extractedChair.rotation.set(0, 0, 0);
          extractedChair.scale.set(1, 1, 1);
        }

        // room intro animation scale
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("GitHub")) {
        github = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("YouTube")) {
        youtube = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Twitter")) {
        twitter = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Name_Letter_1")) {
        letter1 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Name_Letter_2")) {
        letter2 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Name_Letter_3")) {
        letter3 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Name_Letter_4")) {
        letter4 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Name_Letter_5")) {
        letter5 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Name_Letter_6")) {
        letter6 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Name_Letter_7")) {
        letter7 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Name_Letter_8")) {
        letter8 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Flower_1")) {
        flower1 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Flower_2")) {
        flower2 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Flower_3")) {
        flower3 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Flower_4")) {
        flower4 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Flower_5")) {
        flower5 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Box_1")) {
        box1 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Box_2")) {
        box2 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Box_3")) {
        box3 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Lamp")) {
        lamp = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Slipper_1")) {
        slippers1 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Slipper_2")) {
        slippers2 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Egg_1")) {
        egg1 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Egg_2")) {
        egg2 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Egg_3")) {
        egg3 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Frame_1")) {
        frame1 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Frame_2")) {
        frame2 = child;
        child.scale.set(0, 0, 0);
      } else if (child.name.includes("Frame_3")) {
        frame3 = child;
        child.scale.set(0, 0, 0);
      }

      Object.keys(pianoKeyMap).forEach((keyName) => {
        if (child.name.includes(keyName)) {
          pianoKeys[keyName] = child;
          child.scale.set(0, 0, 0);
          child.userData.initialPosition = child.position.clone();
        }
      });

      /* ---------- materials ---------- */

      if (child.name.includes("Water")) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x558bc8,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
        });
      } else if (child.name.includes("Glass")) {
        child.material = glassMaterial;
      } else if (child.name.includes("Bubble")) {
        child.material = whiteMaterial;
      } else if (child.name.includes("Screen")) {
        const videoElement = document.createElement("video");
        // videoElement.src = "/textures/video/Screen.mp4";
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.playsInline = true;
        videoElement.autoplay = true;
        videoElement.play();

        const videoTexture = new THREE.VideoTexture(videoElement);
        videoTexture.colorSpace = THREE.SRGBColorSpace;
        videoTexture.flipY = false;

        child.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
          transparent: true,
          opacity: 0.9,
        });
      } else {
        Object.keys(textureMap).forEach((key) => {
          if (child.name.includes(key)) {
            child.material = roomMaterials[key];
            if (child.name.includes("Fan")) {
              if (
                child.name.includes("Fan_2") ||
                child.name.includes("Fan_4")
              ) {
                xAxisFans.push(child);
              } else {
                yAxisFans.push(child);
              }
            }
          }
        });
      }

      // if (child.name.includes("Lamp")) {
      //   child.material = new THREE.MeshStandardMaterial({
      //     color: 0xffccaa,
      //     roughness: 0.4,
      //     metalness: 0.1,
      //   });
      // }

      /* ---------- delayed hitbox pipeline ---------- */

      if (child.name.includes("Raycaster")) {
        if (hasIntroAnimation(child.name)) {
          child.userData.originalScale = new THREE.Vector3(1, 1, 1);
          objectsNeedingHitboxes.push(child);
        } else {
          const visualObject = child.parent;
          const hitbox = createStaticHitbox(visualObject);

          raycasterObjects.push(hitbox);
          hitboxToObjectMap.set(hitbox, visualObject);

          scene.add(hitbox);
        }
      }
    });
    roomRoot = glb.scene;
    scene.add(roomRoot);



    console.groupEnd();
  });
}

import gsap from "gsap";

export function playIntroAnimation() {
  const t1 = gsap.timeline({
    defaults: {
      duration: 0.8,
      ease: "back.out(1.8)",
    },
  });
  t1.timeScale(0.8);

  // t1.to(plank1.scale, { x: 1, y: 1 })
  //   .to(plank2.scale, { x: 1, y: 1, z: 1 }, "-=0.5")
  // .to(workBtn.scale, { x: 1, y: 1, z: 1 }, "-=0.6")
  // .to(aboutBtn.scale, { x: 1, y: 1, z: 1 }, "-=0.6")
  // .to(contactBtn.scale, { x: 1, y: 1, z: 1 }, "-=0.6");

  const tFrames = gsap.timeline({
    defaults: { duration: 0.8, ease: "back.out(1.8)" },
  });
  tFrames.timeScale(0.8);

  tFrames
    .to(frame1.scale, { x: 1, y: 1, z: 1 })
    .to(frame2.scale, { x: 1, y: 1, z: 1 }, "-=0.5")
    .to(frame3.scale, { x: 1, y: 1, z: 1 }, "-=0.5");

  const t2 = gsap.timeline({
    defaults: { duration: 0.8, ease: "back.out(1.8)" },
  });
  t2.timeScale(0.8);

  t2.to(boba.scale, { x: 1, y: 1, z: 1, delay: 0.4 });
  // .to(github.scale, { x: 1, y: 1, z: 1 }, "-=0.5")
  // .to(youtube.scale, { x: 1, y: 1, z: 1 }, "-=0.6")
  // .to(twitter.scale, { x: 1, y: 1, z: 1 }, "-=0.6");

  const tFlowers = gsap.timeline({
    defaults: { duration: 0.8, ease: "back.out(1.8)" },
  });
  tFlowers.timeScale(0.8);

  tFlowers
    .to(flower5.scale, { x: 1, y: 1, z: 1 })
    .to(flower4.scale, { x: 1, y: 1, z: 1 }, "-=0.5")
    .to(flower3.scale, { x: 1, y: 1, z: 1 }, "-=0.5")
    .to(flower2.scale, { x: 1, y: 1, z: 1 }, "-=0.5")
    .to(flower1.scale, { x: 1, y: 1, z: 1 }, "-=0.5");

  const tBoxes = gsap.timeline({
    defaults: { duration: 0.8, ease: "back.out(1.8)" },
  });
  tBoxes.timeScale(0.8);

  tBoxes
    .to(box1.scale, { x: 1, y: 1, z: 1 })
    .to(box2.scale, { x: 1, y: 1, z: 1 }, "-=0.5")
    .to(box3.scale, { x: 1, y: 1, z: 1 }, "-=0.5");

  const tLamp = gsap.timeline({
    defaults: { duration: 0.8, delay: 0.2, ease: "back.out(1.8)" },
  });
  tLamp.timeScale(0.8);

  tLamp.to(lamp.scale, { x: 1, y: 1, z: 1 });

  const tSlippers = gsap.timeline({
    defaults: { duration: 0.8, ease: "back.out(1.8)" },
  });
  tSlippers.timeScale(0.8);

  tSlippers
    .to(slippers1.scale, { x: 1, y: 1, z: 1, delay: 0.5 })
    .to(slippers2.scale, { x: 1, y: 1, z: 1 }, "-=0.5");

  const tEggs = gsap.timeline({
    defaults: { duration: 0.8, ease: "back.out(1.8)" },
  });
  tEggs.timeScale(0.8);

  tEggs
    .to(egg1.scale, { x: 1, y: 1, z: 1 })
    .to(egg2.scale, { x: 1, y: 1, z: 1 }, "-=0.5")
    .to(egg3.scale, { x: 1, y: 1, z: 1 }, "-=0.5");

  const tFish = gsap.timeline({
    defaults: { delay: 0.8, duration: 0.8, ease: "back.out(1.8)" },
  });
  tFish.timeScale(0.8);

  tFish.to(fish.scale, { x: 1, y: 1, z: 1 });

  const pianoKeysTl = gsap.timeline({
    defaults: {
      duration: 0.4,
      ease: "back.out(1.7)",
      onComplete: () => {
        setTimeout(() => {
          createDelayedHitboxes();
        }, 1950);
      },
    },
  });

  pianoKeysTl.timeScale(1.2);

  const orderedKeys = [
    "C1_Key",
    "C#1_Key",
    "D1_Key",
    "D#1_Key",
    "E1_Key",
    "F1_Key",
    "F#1_Key",
    "G1_Key",
    "G#1_Key",
    "A1_Key",
    "A#1_Key",
    "B1_Key",
    "C2_Key",
    "C#2_Key",
    "D2_Key",
    "D#2_Key",
    "E2_Key",
    "F2_Key",
    "F#2_Key",
    "G2_Key",
    "G#2_Key",
    "A2_Key",
    "A#2_Key",
    "B2_Key",
  ]
    .map((k) => pianoKeys[k])
    .filter(Boolean);

  orderedKeys.forEach((key, index) => {
    pianoKeysTl
      .to(
        key.position,
        {
          y: key.userData.initialPosition.y + 0.2,
          duration: 0.4,
          ease: "back.out(1.8)",
        },
        index * 0.1,
      )
      .to(
        key.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.4,
          ease: "back.out(1.8)",
        },
        "<",
      )
      .to(
        key.position,
        {
          y: key.userData.initialPosition.y,
          duration: 0.4,
          ease: "back.out(1.8)",
        },
        ">-0.2",
      );
  });
}

/** Show all intro objects at full scale (no animation). Used when embedded in dashboard so the room matches the main /room view. */
export function showAllIntroObjects(scene) {
  if (frame1) frame1.scale.set(1, 1, 1);
  if (frame2) frame2.scale.set(1, 1, 1);
  if (frame3) frame3.scale.set(1, 1, 1);
  if (boba) boba.scale.set(1, 1, 1);
  if (flower1) flower1.scale.set(1, 1, 1);
  if (flower2) flower2.scale.set(1, 1, 1);
  if (flower3) flower3.scale.set(1, 1, 1);
  if (flower4) flower4.scale.set(1, 1, 1);
  if (flower5) flower5.scale.set(1, 1, 1);
  if (box1) box1.scale.set(1, 1, 1);
  if (box2) box2.scale.set(1, 1, 1);
  if (box3) box3.scale.set(1, 1, 1);
  if (lamp) lamp.scale.set(1, 1, 1);
  if (slippers1) slippers1.scale.set(1, 1, 1);
  if (slippers2) slippers2.scale.set(1, 1, 1);
  if (egg1) egg1.scale.set(1, 1, 1);
  if (egg2) egg2.scale.set(1, 1, 1);
  if (egg3) egg3.scale.set(1, 1, 1);
  if (fish) fish.scale.set(1, 1, 1);

  const orderedKeys = [
    "C1_Key", "C#1_Key", "D1_Key", "D#1_Key", "E1_Key", "F1_Key", "F#1_Key",
    "G1_Key", "G#1_Key", "A1_Key", "A#1_Key", "B1_Key",
    "C2_Key", "C#2_Key", "D2_Key", "D#2_Key", "E2_Key", "F2_Key", "F#2_Key",
    "G2_Key", "G#2_Key", "A2_Key", "A#2_Key", "B2_Key",
  ]
    .map((k) => pianoKeys[k])
    .filter(Boolean);
  orderedKeys.forEach((key) => {
    if (key && key.userData.initialPosition) {
      key.position.y = key.userData.initialPosition.y;
      key.scale.set(1, 1, 1);
    }
  });

  createDelayedHitboxes();

  // Level 3: always add hitboxes for vocabulary objects so drag-and-drop matching works (GLB may not have "Raycaster" meshes for these).
  if (scene) {
    const vocabObjects = [
      lamp,
      fish,
      chairTop,
      flower1,
      flower2,
      flower3,
      flower4,
      flower5,
      box1,
      box2,
      box3,
      egg1,
      egg2,
      egg3,
      frame1,
      frame2,
      frame3,
      slippers1,
      slippers2,
    ].filter(Boolean);
    Object.values(pianoKeys).forEach((k) => k && vocabObjects.push(k));
    vocabObjects.forEach((obj) => {
      const hitbox = createStaticHitbox(obj);
      scene.add(hitbox);
      raycasterObjects.push(hitbox);
      hitboxToObjectMap.set(hitbox, obj);
    });
  }
}
