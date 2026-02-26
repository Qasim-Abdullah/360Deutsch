import * as THREE from "three";
import { ViewDefinition } from "../core/types";
import { buildPosView } from "./PosView";
import { moveToAnchorPosition } from "../core/anchor";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";

function viewForNode(node: ARNode): string {
  if (node.type === "pos") return "word";
  if (node.type === "entry") return "wordDetails";
  return "levels";
}

export const PosView: ViewDefinition = {
  build(scene, context, helpers) {
    const anchor = context.anchor as THREE.Group | undefined;
    if (!anchor) return { children: [] };

    const node = context.node as ARNode;
    if (!node) return { anchor, children: [] };

    moveToAnchorPosition(anchor);

    const result = buildPosView(
      scene,
      node,
      (child: ARNode, card: THREE.Group) => {
        helpers.goTo(viewForNode(child), {
          node: child,
          anchor: card,
        });
      }
    );

    const edges = result.posCards.map(card =>
      helpers.createEdge(anchor, card)
    );

    return {
      anchor,
      children: result.posCards,
      edges
    };
  }
};