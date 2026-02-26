import * as THREE from "three";
import { ViewDefinition } from "../core/types";
import { buildWordView } from "./WordListView";
import { moveToAnchorPosition } from "../core/anchor";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";

function viewForNode(node: ARNode): string {
  if (node.type === "entry") return "wordDetails";
  return "levels";
}

export const WordView: ViewDefinition = {
  build(scene, context, helpers) {
    const anchor = context.anchor as THREE.Group | undefined;
    if (!anchor) return { children: [] };

    const node = context.node as ARNode;
    if (!node) return { anchor, children: [] };

    moveToAnchorPosition(anchor);

    const result = buildWordView(
      scene,
      anchor,
      node,
      (child: ARNode, card: THREE.Group) => {
        helpers.goTo(viewForNode(child), {
          node: child,
          parent: node,
          anchor: card
        });
      }
    );

    const edges = result.wordCards.map(card =>
      helpers.createEdge(anchor, card)
    );

    return {
      anchor,
      children: result.wordCards,
      edges
    };
  }
};