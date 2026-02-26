import React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        "camera-controls"?: boolean;
        "disable-zoom"?: boolean;
        "interaction-prompt"?: string;
        "disable-tap"?: boolean;
      };
    }
  }
}
  

declare global {
  interface HTMLModelViewerElement extends HTMLElement {
    cameraOrbit: string;
  }
}

export {};
