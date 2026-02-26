import * as THREE from "three";
import { createLevelCard } from "@/components/ui/webxr/cards/LevelCard";
import { createCategoryCard } from "@/components/ui/webxr/cards/CategoryCard";
import { createPosCard } from "@/components/ui/webxr/cards/PosCard";
import { createRoomCard } from "@/components/ui/webxr/cards/RoomCard";
import { createWordCard } from "@/components/ui/webxr/cards/WordCard";

import { levelConfigs } from "@/components/ui/webxr/config/levels.config";
import { posConfigs, posLabelToType, PosType } from "@/components/ui/webxr/config/pos.config";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";

function topItems(node: ARNode, n = 3): string[] {
    return (node.children ?? []).slice(0, n).map((c) => c.label);
}

function findLevelConfig(node: ARNode) {
    return levelConfigs.find((x) => x.level === node.label || x.level === node.id);
}

function findPosConfig(node: ARNode) {
    const t: PosType = posLabelToType[node.label] ?? "noun";
    return posConfigs.find((x) => x.type === t);
}

export function createAnchorForNode(node: ARNode): THREE.Group {
    if (node.type === "root") {
        return createLevelCard({
            level: node.label,
            subtitle: "",
            items: topItems(node),
            iconUrl: "/assets/icons/AR/stair_1.png",
            cta: "OPEN",
        });
    }
    if (node.type === "level") {
        const cfg = findLevelConfig(node);

        return createLevelCard({
            level: cfg?.level ?? node.label,
            subtitle: cfg?.subtitle ?? "",
            items: cfg?.items ?? topItems(node),
            iconUrl: cfg?.iconUrl ?? "/assets/icons/AR/stair_1.png",
            cta: "BETRETEN",
        });
    }

    if (node.type === "pos") {
        const cfg = findPosConfig(node);

        return createPosCard({
            title: cfg?.title ?? node.label,
            subtitle: cfg?.subtitle ?? "",
            iconUrl: cfg?.iconUrl ?? "/images/pos/nomen.png",
            cta: "ÖFFNEN",
        });
    }

    if (node.type === "category") {
        return createCategoryCard({
            category: node.label,
            subtitle: "",
            items: topItems(node),
            iconUrl: `/images/category/${node.id.toLowerCase()}.png`,
            cta: "ÖFFNEN",
        });
    }

    if (node.type === "subcategory") {
        return createRoomCard({
            title: node.label,
            subtitle: "",
            imageUrl: `/images/rooms/${node.id.toLowerCase()}.png`,
            cta: "ÖFFNEN",
        });
    }



    return createWordCard({
        word: node.label,
        cta: "ÖFFNEN",
    });
}