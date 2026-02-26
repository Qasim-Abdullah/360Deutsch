import * as THREE from "three";
import { createLevelCard } from "../cards/LevelCard";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";
import { levelConfigs } from "../config/levels.config";

export function buildLevelsView(
  scene: THREE.Scene,
  levelNodes: ARNode[],
  onEnterLevel: (levelNode: ARNode, card: THREE.Group) => void
) {
  const cards: THREE.Group[] = [];

  const layouts = [
    { x: -1, y: 0, z: -2, rx: -0, ry: 0.6, rz: 0 },
    { x: 1, y: 0, z: -2, rx: -0, ry: -0.6, rz: 0 },
    { x: -0.35, y: 0, z: -2.2, rx: -0, ry: 0.25, rz: 0 },
    { x: 0.35, y: 0, z: -2.2, rx: -0, ry: -0.25, rz: 0 },
  ];

  levelNodes.forEach((node, i) => {
    const L = layouts[i % layouts.length];

    const cfg = levelConfigs.find(
      x => x.level === node.label || x.level === node.id
    );

    const card = createLevelCard({
      level: node.label,
      subtitle: cfg?.subtitle ?? "",
      items: cfg?.items ?? (node.children ?? []).slice(0, 3).map(c => c.label),
      iconUrl: cfg?.iconUrl ?? "/assets/icons/AR/stair_1.png",
      cta: "BETRETEN",
    });

    card.position.set(L.x, L.y, L.z);
    card.rotation.set(L.rx, L.ry, L.rz);

    card.userData.node = node;
    card.userData.onEnter = () => onEnterLevel(node, card);

    scene.add(card);
    cards.push(card);
  });

  return cards;
}