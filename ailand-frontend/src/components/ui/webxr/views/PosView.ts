import * as THREE from "three";
import { createPosCard } from "../cards/PosCard";
import { posConfigs, posLabelToType, PosType } from "../config/pos.config";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";

export function buildPosView(
  scene: THREE.Scene,
  node: ARNode,
  onEnter: (child: ARNode, card: THREE.Group) => void
) {
  const posCards: THREE.Group[] = [];

  const children = node.children ?? [];

  children.forEach((child, index) => {
    const type: PosType =
      posLabelToType[child.label] ?? "noun";

    const cfg = posConfigs.find(x => x.type === type);

    const card = createPosCard({
      title: cfg?.title ?? child.label,
      subtitle: cfg?.subtitle ?? "",
      iconUrl: cfg?.iconUrl ?? "/images/pos/nomen.png",
      cta: "ÖFFNEN",
    });

    const pos = cfg?.position ?? {
      x: -0.6 + index * 0.6,
      y: 0,
      z: -2,
    };

    const rot = cfg?.rotation ?? {
      x: 0,
      y: 0,
      z: 0,
    };

    card.position.set(pos.x, pos.y, pos.z);
    card.rotation.set(rot.x, rot.y, rot.z);

    card.userData.node = child;
    card.userData.onEnter = () => onEnter(child, card);

    scene.add(card);
    posCards.push(card);
  });

  return { posCards };
}