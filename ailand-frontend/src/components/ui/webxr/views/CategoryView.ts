import * as THREE from "three";
import { createCategoryCard } from "../cards/CategoryCard";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";

export function buildCategoryView(
  scene: THREE.Scene,
  node: ARNode,
  onEnter: (child: ARNode, card: THREE.Group) => void,
  anchor: THREE.Group
) {
  const cards: THREE.Group[] = [];
  const children = node.children ?? [];

  const maxFirstRow = 6;

  const firstRow = children.slice(0, maxFirstRow);
  const secondRow = children.slice(maxFirstRow);

  function placeRow(rowNodes: ARNode[], rowIndex: number) {
    const count = rowNodes.length;

    // Adaptive spacing
    const radius =
      count <= 3 ? 1.8 :
        count <= 5 ? 2.2 :
          2.6;

    const angleStep =
      count <= 3 ? 0.18 :
        count <= 5 ? 0.24 :
          0.28;

    const baseY = -1.2 - rowIndex * 0.8;
    const baseZ = 0;

    const mid = (count - 1) / 2;

    rowNodes.forEach((child, i) => {
      const card = createCategoryCard({
        category: child.label,
        subtitle: "",
        items: (child.children ?? []).slice(0, 3).map(c => c.label),
        iconUrl: `/images/category/${child.id.toLowerCase()}.png`,
        cta: "ÖFFNEN",
        onEnter: () => onEnter(child, card),
      });

      const offset = i - mid;
      const angle = offset * angleStep;

      const x = Math.sin(angle) * radius;
      const z = baseZ - Math.cos(angle) * 0.4;

      card.position.set(x, baseY, z);
      card.rotation.set(-0.05, -angle, 0);

      card.userData.node = child;

      anchor.add(card);
      cards.push(card);
    });
  }

  placeRow(firstRow, 0);
  placeRow(secondRow, 1);

  return cards;
}