declare module "troika-three-text" {
  import { Object3D } from "three";

  export class Text extends Object3D {
    text: string;
    fontSize: number;
    maxWidth: number;
    anchorX: string;
    anchorY: string;
    color: number | string;
    sync(): void;
  }
}
