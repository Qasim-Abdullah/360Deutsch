import * as THREE from "three";
import { ViewDefinition } from "../core/types";
import { buildLevelsView } from "../views/LevelsView";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";

function viewForNode(node: ARNode): string {
  if (node.type === "level") return "category";
  if (node.type === "category") return "rooms";
  if (node.type === "subcategory") return "pos";
  if (node.type === "pos") return "word";
  if (node.type === "entry") return "wordDetails";
  return "levels";
}

export const LevelsView: ViewDefinition = {
  build(scene, context, helpers) {
    const root = context.node as ARNode | undefined;
    if (!root) return { children: [] };

    const levelNodes =
      root.type === "root" ? (root.children ?? []) : (root.children ?? []);

    const cards = buildLevelsView(scene, levelNodes, (levelNode, card) => {
      helpers.goTo(viewForNode(levelNode), {
        node: levelNode,
        anchor: card,
      });
    });

    return { children: cards };
  },
};