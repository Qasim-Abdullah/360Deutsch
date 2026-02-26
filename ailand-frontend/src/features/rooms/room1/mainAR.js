import * as THREE from "three";

import { scene } from "./scene/setup.js";
import { setARCanvas, getARRenderer } from "./scene/arRenderer.js";

import "./audio/music.js";
import "./audio/piano.js";
import "./audio/button.js";

import { loadRoom, playIntroAnimation } from "./models/objects.js";
import { manager } from "./models/loadRoom.js";

import { startARLoop, stopARLoop } from "./update/arLoop.js";

export default function initRoomAR(canvas) {
    if (!canvas) return;

    setARCanvas(canvas);


    const roomRoot = new THREE.Group();

    roomRoot.visible = true;
    
    roomRoot.position.set(0, -0.2, -1);
    roomRoot.scale.setScalar(0.08);


    scene.add(roomRoot);

    loadRoom(roomRoot);

    manager.onLoad = () => {
        document.dispatchEvent(new Event("intro:start"));
    };

    document.addEventListener("intro:start", () => {
        playIntroAnimation();
    });

    const renderer = getARRenderer();
    let session = null;

    const start = async () => {
        if (!navigator.xr) throw new Error("WebXR not available");

        session = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["local-floor", "dom-overlay"],
            domOverlay: { root: document.body },
        });

        renderer.xr.enabled = true;
        await renderer.xr.setSession(session);

        startARLoop({ renderer, scene });


        session.addEventListener("end", () => {
            roomRoot.visible = false;
            stopARLoop(renderer);
            session = null;
        });

        return session;
    };

    const end = async () => {
        if (session) await session.end();
    };

    return {
        start,
        end,
        destroy: () => {
            try {
                stopARLoop(getARRenderer());
            } catch { }
            try {
                renderer.dispose?.();
            } catch { }
        },
    };
}
