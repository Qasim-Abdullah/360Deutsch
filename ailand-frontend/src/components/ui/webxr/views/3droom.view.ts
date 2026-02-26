import * as THREE from "three";
import { ViewDefinition } from "../core/types";

export const RoomView: ViewDefinition = {
    build(scene, context, helpers) {

        if (typeof window === "undefined") {
            return { children: [] };
        }

        const root = new THREE.Group();
        root.position.set(0, 0.2, -2);
        root.rotation.y = - 0.75;  
        root.rotation.x = 0.3;  
        root.scale.setScalar(0.08);

        scene.add(root);

        import("@/features/rooms/room1/models/objectsAr").then(({ loadRoom, finalizeRoom }) => {
            loadRoom(root);
            setTimeout(() => {
                finalizeRoom(scene);
            }, 1500);
        });

        return {
            anchor: root,
            children: [root],
            edges: []
        };
    }

};
