import * as THREE from "three";
import { ViewDefinition } from "../core/types";
import { buildCategoryView } from "./CategoryView";
import { moveToAnchorPosition } from "../core/anchor";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";

function viewForNode(node: ARNode): string {
  if (node.type === "level") return "category";
  if (node.type === "category") return "rooms";
  if (node.type === "subcategory") return "pos";
  if (node.type === "pos") return "word";
  if (node.type === "entry") return "wordDetails";
  return "levels";
}

export const CategoryView: ViewDefinition = {
  build(scene, context, helpers) {
    const anchor = context.anchor as THREE.Group | undefined;
    if (!anchor) return { children: [] };

    const node = context.node as ARNode;
    if (!node) return { anchor, children: [] };

    moveToAnchorPosition(anchor);

    const cards = buildCategoryView(
      scene,
      node,
      (child: ARNode, card: THREE.Group) => {
        const wp = new THREE.Vector3();
        card.getWorldPosition(wp);

        if (card.parent) card.parent.remove(card);
        scene.add(card);
        card.position.copy(wp);

        helpers.goTo(viewForNode(child), {
          node: child,
          anchor: card,
        });
      },
      anchor
    );

    const edges = cards.map((card) =>
      helpers.createEdge(anchor, card)
    );

    return {
      anchor,
      children: cards,
      edges,
    };
  },
};