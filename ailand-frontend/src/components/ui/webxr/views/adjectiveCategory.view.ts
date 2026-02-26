import * as THREE from "three";
import { ViewDefinition } from "../core/types";
import { createPosCard } from "../cards/PosCard";
import { moveToAnchorPosition } from "../core/anchor";

type AdjectiveCategory = "regular" | "irregular";

const adjectiveCategoryConfig: {
  title: string;
  subtitle: string;
  iconUrl: string;
  category: AdjectiveCategory;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}[] = [
  {
    title: "Regelmäßig",
    subtitle: "Regular",
    iconUrl: "/images/pos/adjektive.png",
    category: "regular",
    position: { x: -0.45, y: 1.1, z: -2.2 },
    rotation: { x: -0.06, y: 0.25, z: 0 },
  },
  {
    title: "Unregelmäßig",
    subtitle: "Irregular",
    iconUrl: "/images/pos/adjektive.png",
    category: "irregular",
    position: { x: 0.45, y: 1.1, z: -2.2 },
    rotation: { x: -0.06, y: -0.25, z: 0 },
  },
];

export const AdjectiveCategoryView: ViewDefinition = {
  build(scene, context, helpers) {
    const anchor = context.anchor as THREE.Group | undefined;
    if (!anchor) return { children: [] };

    moveToAnchorPosition(anchor);

    const categoryCards: THREE.Group[] = [];

    adjectiveCategoryConfig.forEach((config) => {
      const card = createPosCard({
        title: config.title,
        subtitle: config.subtitle,
        iconUrl: config.iconUrl,
        cta: "ÖFFNEN",
      });

      card.position.set(
        config.position.x,
        config.position.y,
        config.position.z
      );

      card.rotation.set(
        config.rotation.x,
        config.rotation.y,
        config.rotation.z
      );

      card.userData.category = config.category;
      card.userData.onEnter = () =>
        helpers.goTo("word", {
          type: "adjective",
          adjectiveCategory: config.category,
          anchor: card,
        });

      scene.add(card);
      categoryCards.push(card);
    });

    const edges = categoryCards.map((card) =>
      helpers.createEdge(anchor, card)
    );

    return {
      anchor,
      children: categoryCards,
      edges,
    };
  },
};
