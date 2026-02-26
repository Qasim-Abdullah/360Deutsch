import * as THREE from "three";

export const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export function updateSizes(width, height) {
  sizes.width = width;
  sizes.height = height;
}

export const scene = new THREE.Scene();


const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 15, 10);
scene.add(directionalLight);

//scene.background = new THREE.Color("#9ca9dc");
