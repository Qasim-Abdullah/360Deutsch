import * as THREE from "three";

export type Helpers = {
  goTo: (view: string, context?: any) => void;
  createEdge: (from: THREE.Object3D, to: THREE.Object3D) => THREE.Line;
};

export type BuildResult = {
  anchor?: THREE.Object3D | null;
  children?: THREE.Object3D[];
  edges?: THREE.Object3D[];
};

export type ViewDefinition = {
  build: (
    scene: THREE.Scene,
    context: any,
    helpers: Helpers
  ) => BuildResult;
};
