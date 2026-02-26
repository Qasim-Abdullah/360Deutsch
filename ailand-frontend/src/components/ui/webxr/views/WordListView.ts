import * as THREE from "three";
import { createWordCard } from "../cards/WordCard";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";

export function buildWordView(
  scene: THREE.Scene,
  anchorCard: THREE.Group,
  node: ARNode,
  onEnterWord: (child: ARNode, card: THREE.Group) => void
) {
  const wordCards: THREE.Group[] = [];

  anchorCard.position.set(0, 2.2, -1.8);
  anchorCard.rotation.set(-0.05, 0, 0);

  const words = node.children ?? [];

  const maxFirstRow = 6;

  const firstRow = words.slice(0, maxFirstRow);
  const secondRow = words.slice(maxFirstRow);

  function placeRow(rowWords: ARNode[], rowIndex: number) {
    const radius = 2.8;
    const baseY = 0.1 - rowIndex * 0.7;
    const baseZ = -2.3;

    const angleStep = 0.28;
    const mid = (rowWords.length - 1) / 2;

    rowWords.forEach((child, i) => {
      const card = createWordCard({
        word: child.label,
        article: child.gender,
        ipa: child.ipa,
        cta: "WEITER",
      });

      const offset = i - mid;
      const angle = offset * angleStep;

      const x = Math.sin(angle) * radius;
      const z = baseZ - Math.cos(angle) * 0.5;

      card.position.set(x, baseY, z);
      card.rotation.set(-0.05, -angle, 0);

      card.userData.node = child;
      card.userData.onEnter = () =>
        onEnterWord(child, card);

      const cta = card.getObjectByName("cta");
      if (cta) {
        cta.userData.onEnter = () =>
          onEnterWord(child, card);
      }

      scene.add(card);
      wordCards.push(card);
    });
  }

  placeRow(firstRow, 0);
  placeRow(secondRow, 1);

  return { wordCards };
}