import * as THREE from "three";
import { ViewDefinition } from "../core/types";
import { buildRoomsView } from "./RoomsView";
import { moveToAnchorPosition } from "../core/anchor";
import { ARNode } from "../core/arTypes";

function viewForNode(node: ARNode): string {
  if (node.type === "level") return "category";
  if (node.type === "category") return "rooms";
  if (node.type === "subcategory") return "pos";
  if (node.type === "pos") return "word";
  if (node.type === "entry") return "wordDetails";
  return "levels";
}

export const RoomsView: ViewDefinition = {
  build(scene, context, helpers) {
    const anchor = context.anchor as THREE.Group | undefined;
    if (!anchor) return { children: [] };

    const node = context.node as ARNode | undefined;
    if (!node) return { anchor, children: [] };

    moveToAnchorPosition(anchor);

    const result = buildRoomsView(
      scene,
      node.children ?? [],
      (child: ARNode, card: THREE.Group) => {
        helpers.goTo(viewForNode(child), {
          node: child,
          anchor: card,
        });
      },
    );

    const edges = result.roomCards.map((card) =>
      helpers.createEdge(anchor, card),
    );

    return {
      anchor,
      children: result.roomCards,
      edges,
    };
  },
};