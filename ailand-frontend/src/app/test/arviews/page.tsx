// "use client";

// import { useEffect, useRef } from "react";
// import * as THREE from "three";

// import { initTestScene } from "@/components/ui/webxr/core/initTestScene";
// import { XRViewManager } from "@/components/ui/webxr/core/XRViewManager";

// export default function XRTestPage() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const { scene, camera } = initTestScene(canvasRef.current);

//     const manager = new XRViewManager(scene, camera);
//     manager.init();

//   }, []);

//   return (
//     <div style={{ width: "100vw", height: "100vh" }}>
//       <canvas
//         ref={canvasRef}
//         style={{ width: "100%", height: "100%" }}
//       />
//     </div>
//   );
// }
