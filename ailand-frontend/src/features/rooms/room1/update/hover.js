import * as THREE from "three";
import gsap from "gsap";
import { getRenderer } from "../scene/renderer.js";
import { roomRoot } from "../models/objects.js";

import {
    raycasterObjects,
    hitboxToObjectMap,
    playHoverAnimation,
} from "../models/objects.js";

import { playPianoSound, pianoKeyMap } from "../audio/piano.js";

function shiftRoomLeft() {
  if (!roomRoot) return;

  gsap.to(roomRoot.position, {
    x: -2,
    duration: 0.8,
    ease: "power3.out",
  });
}

function resetRoomPosition() {
  if (!roomRoot) return;

  gsap.to(roomRoot.position, {
    x: 0,
    duration: 0.8,
    ease: "power3.out",
  });
}


let pianoPanelOpen = false;

const pianoPanel = document.getElementById("piano-panel");
const closePianoPanelBtn = document.getElementById("close-piano-panel");

function showPianoPanel() {
  if (!pianoPanel || pianoPanelOpen) return;
  pianoPanel.classList.remove("hidden");
  pianoPanelOpen = true;
  shiftRoomLeft(); // ← ADD
}

function hidePianoPanel() {
  if (!pianoPanel) return;
  pianoPanel.classList.add("hidden");
  pianoPanelOpen = false;
  resetRoomPosition(); // ← ADD
}



closePianoPanelBtn?.addEventListener("click", hidePianoPanel);


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let currentHoveredHitbox = null;
let enabled = false;

let currentIntersects = []; // for piano
let _scene = null;
let _camera = null;

export function enableHover() {
    enabled = true;
}


function updatePointerFromClient(clientX, clientY) {
    const canvas = getRenderer()?.domElement;
    if (canvas) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    } else {
        pointer.x = (clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    }
}


window.addEventListener("mousemove", (e) => {
    updatePointerFromClient(e.clientX, e.clientY);
});

window.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) {
        updatePointerFromClient(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: true });

window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
        updatePointerFromClient(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: true });



export function handleHover(scene, camera) {
  _scene = scene;
  _camera = camera;
  if (!enabled) return;
  if (!raycasterObjects.length) return;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(raycasterObjects, false);

  currentIntersects = intersects; 

  if (intersects.length > 0) {
    const hitbox = intersects[0].object;
    const object = hitboxToObjectMap.get(hitbox);

    if (!object) return;

    const isPianoKey = Object.keys(pianoKeyMap).some((key) =>
      object.name.includes(key)
    );
    const isVocabularyObject = objectToWord(object) != null;

    if (hitbox.name.includes("Pointer") || isPianoKey || isVocabularyObject) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }

   
    if (!hitbox.name.includes("Hover") && !isVocabularyObject) {
      return;
    }

    if (currentHoveredHitbox !== hitbox) {
      if (currentHoveredHitbox) {
        playHoverAnimation(currentHoveredHitbox, false);
      }

      currentHoveredHitbox = hitbox;
      playHoverAnimation(hitbox, true);
    }
  } else {
    if (currentHoveredHitbox) {
      playHoverAnimation(currentHoveredHitbox, false);
      currentHoveredHitbox = null;
    }
    document.body.style.cursor = "default";
  }
}




function handlePianoInteraction(clientX, clientY) {
    let intersects = currentIntersects;
    if (clientX != null && clientY != null && _camera && raycasterObjects.length) {
        updatePointerFromClient(clientX, clientY);
        raycaster.setFromCamera(pointer, _camera);
        intersects = raycaster.intersectObjects(raycasterObjects, false);
    }
    if (!intersects.length) return;

    const hitbox = intersects[0].object;
    const object = hitboxToObjectMap.get(hitbox);
    if (!object) return;

    Object.keys(pianoKeyMap).forEach((keyName) => {
        if (object.name.includes(keyName)) {
            playPianoSound(keyName);
            showPianoPanel();
            const initialRot = object.userData.initialRotation;
            if (initialRot) {
                gsap.to(object.rotation, {
                    x: initialRot.x + Math.PI / 42,
                    duration: 0.4,
                    ease: "back.out(2)",
                    onComplete: () => {
                        gsap.to(object.rotation, {
                            x: initialRot.x,
                            duration: 0.25,
                            ease: "back.out(2)",
                        });
                    },
                });
            }
        }
    });
}

window.addEventListener("click", (e) => {
    handlePianoInteraction(e.clientX, e.clientY);
});

window.addEventListener(
    "touchend",
    (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
            const t = e.changedTouches[0];
            handlePianoInteraction(t.clientX, t.clientY);
        } else {
            handlePianoInteraction();
        }
        // Only preventDefault when the event is cancelable (e.g. not during scroll)
        if (e.cancelable) {
            e.preventDefault();
        }
    },
    { passive: false }
);


function objectNameToWord(objectName) {
    if (!objectName || typeof objectName !== "string") return null;
    const n = objectName;
    if (n.includes("Lamp")) return "lampe";
    if (n.includes("Fish")) return "fisch";
    if (n.includes("Chair")) return "stuhl";
    if (n.includes("Flower")) return "blume";
    if (n.includes("Box")) return "kasten";
    if (n.includes("Egg")) return "ei";
    if (n.includes("Frame")) return "rahmen";
    if (n.includes("Slipper")) return "hausschuh";
    if (n.includes("Key") || n.includes("Piano")) return "klavier";
    return null;
}

function objectToWord(object) {
    if (!object) return null;
    let w = objectNameToWord(object.name);
    if (w) return w;
    if (object.parent && object.parent !== object) {
        w = objectNameToWord(object.parent.name);
        if (w) return w;
    }
    return null;
}

window.addEventListener("room:pickAt", (e) => {
    const { clientX, clientY } = e.detail || {};
    let word = null;
    const hasHitboxes = raycasterObjects.length > 0;
    const hasCamera = !!_camera;
    if (hasHitboxes && hasCamera && clientX != null && clientY != null) {
        updatePointerFromClient(clientX, clientY);
        raycaster.setFromCamera(pointer, _camera);
        const intersects = raycaster.intersectObjects(raycasterObjects, false);
        if (intersects.length > 0) {
            const hitbox = intersects[0].object;
            const object = hitboxToObjectMap.get(hitbox);
            if (object) {
                word = objectToWord(object);
            }
        }
    }
    if (typeof console !== "undefined" && console.log) {
        console.log("[room pick] hitboxes:", raycasterObjects.length, "camera:", hasCamera, "-> word:", word ?? "null");
    }
    document.dispatchEvent(new CustomEvent("room:objectPicked", { detail: { word } }));
});
