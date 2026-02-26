import * as THREE from "three";
import { createRoomCard } from "../cards/RoomCard";
import { ARNode } from "../core/arTypes";


const layouts = [
  { x: -1.45, y: 0, z: -2, rx: -0.05, ry: 0.8, rz: 0 },
  { x: 1.45, y: 0, z: -2, rx: -0.05, ry: -0.8, rz: 0 },
  { x: -0.75, y: 0.1, z: -2.3, rx: -0, ry: 0.6, rz: 0 },
  { x: 0.75, y: 0.1, z: -2.3, rx: -0, ry: -0.6, rz: 0 },
  { x: 0.0, y: 0.1, z: -2.5, rx: -0.04, ry: 0.0, rz: 0 },
];

export function buildRoomsView(
  scene: THREE.Scene,
  children: ARNode[],
  onEnter: (child: ARNode, card: THREE.Group) => void,
) {
  const roomCards: THREE.Group[] = [];

  children.forEach((child, i) => {
    const L = layouts[i % layouts.length];

    const card = createRoomCard({
      title: child.label,
      subtitle: "",
      imageUrl: `/images/rooms/${child.id.toLowerCase()}.png`,
      cta: "Weiter",
      onOpenRoom: () => onEnter(child, card),
    });

    card.position.set(L.x, L.y, L.z);
    card.rotation.set(L.rx, L.ry, L.rz);

    card.userData.node = child;
    card.userData.onEnter = () => onEnter(child, card);

    scene.add(card);
    roomCards.push(card);
  });

  return { roomCards };
}