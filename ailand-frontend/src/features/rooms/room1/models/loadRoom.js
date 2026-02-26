import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { roomMaterials, glassMaterial, whiteMaterial } from "../materials/materials.js";
import { textureMap } from "../materials/textures.js";

export const manager = new THREE.LoadingManager();

manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
  if (typeof document !== "undefined") {
    document.dispatchEvent(
      new CustomEvent("room:loadProgress", {
        detail: { loaded: itemsLoaded, total: itemsTotal },
      })
    );
  }
};

export const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

export const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);

export const useOriginalMeshObjects = ["Bulb", "Cactus", "Kirby"];
export const xAxisFans = [];
export const yAxisFans = [];

export const objectsWithIntroAnimations = [
  "Hanging_Plank_1",
  "Hanging_Plank_2",
  "My_Work_Button",
  "About_Button",
  "Contact_Button",
  "Boba",
  "GitHub",
  "YouTube",
  "Twitter",
  "Name_Letter_1",
  "Name_Letter_2",
  "Name_Letter_3",
  "Name_Letter_4",
  "Name_Letter_5",
  "Name_Letter_6",
  "Name_Letter_7",
  "Name_Letter_8",
  "Flower_1",
  "Flower_2",
  "Flower_3",
  "Flower_4",
  "Flower_5",
  "Box_1",
  "Box_2",
  "Box_3",
  "Lamp",
  "Slipper_1",
  "Slipper_2",
  "Fish_Fourth",
  "Egg_1",
  "Egg_2",
  "Egg_3",
  "Frame_1",
  "Frame_2",
  "Frame_3",
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
];

export function hasIntroAnimation(objectName) {
  return objectsWithIntroAnimations.some((name) => objectName.includes(name));
}
