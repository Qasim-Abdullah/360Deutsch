import * as THREE from "three";
import { ViewDefinition } from "../core/types";
import { moveToAnchorPosition } from "../core/anchor";
import { createSentenceCard } from "../cards/SentenceCard";
import { createPluralCard } from "../cards/PluralCard";
import { createConjugationCard } from "../cards/ConjugationCard";
import type { Conjugation } from "../cards/ConjugationCard";
import {
  createHelloCard,
  createAdjectiveCard,
  createNumberCard,
  createPronounCard,
  createPrepositionCard
} from "../cards/TestCard";
import type { ARNode } from "@/components/ui/webxr/core/arTypes";

const detailCardConfig: Record<string, string[]> = {
  noun: ["example", "plural"],
  verb: ["example", "conjugation", "test"],
  adjective: ["example", "comparativeSuperlative"],
  adverb: ["example"],
  number: ["example", "numberForm"],
  pronoun: ["example", "pronounForm"],
  preposition: ["example", "prepositionForm"],
};

function normalizePosLabel(label: string | undefined): string {
  const v = (label ?? "").toLowerCase().trim();
  if (v === "nouns" || v === "noun") return "noun";
  if (v === "verbs" || v === "verb") return "verb";
  if (v === "adjectives" || v === "adjective") return "adjective";
  if (v === "adverbs" || v === "adverb") return "adverb";
  if (v === "numerals" || v === "numeral" || v === "number" || v === "numbers") return "number";
  if (v === "pronouns" || v === "pronoun") return "pronoun";
  if (v === "prepositions" || v === "preposition") return "preposition";
  return v || "noun";
}

function toExamples(node: ARNode): { de: string; en: string }[] | null {
  const ex = (node as any).examples;
  if (!Array.isArray(ex) || ex.length === 0) return null;
  return ex
    .map((e: any) => ({
      de: typeof e?.de === "string" ? e.de : "",
      en: typeof e?.en === "string" ? e.en : "",
    }))
    .filter((e) => e.de.length > 0 || e.en.length > 0);
}

function toPlural(node: ARNode): { singular: string; plural: string } | null {
  const s = node.label;
  const p = (node as any).plural;
  if (typeof p !== "string" || p.trim().length === 0) return null;
  return { singular: s, plural: p };
}

function toConjugation(node: ARNode): { infinitive: string; forms: Conjugation } | null {
  const conj = (node as any).conjugation;
  if (!conj || typeof conj !== "object") return null;

  const forms = conj.forms ?? conj;
  if (!forms || typeof forms !== "object") return null;

  const hasAny =
    typeof forms.ich === "string" ||
    typeof forms.du === "string" ||
    typeof forms.er === "string" ||
    typeof forms.wir === "string" ||
    typeof forms.ihr === "string" ||
    typeof forms.sie === "string";

  if (!hasAny) return null;

  return {
    infinitive: node.label,
    forms: {
      ich: (forms.ich ?? "") as string,
      du: (forms.du ?? "") as string,
      er: (forms.er ?? "") as string,
      wir: forms.wir as any,
      ihr: forms.ihr as any,
      sie: forms.sie as any,
    },
  };
}

export const WordDetailsView: ViewDefinition = {
  build(scene, context, helpers) {
    const anchor = context.anchor as THREE.Group | undefined;
    if (!anchor) return { children: [] };

    const node = context.node as ARNode | undefined;
    if (!node) return { anchor, children: [] };

    const parent = context.parent as ARNode | undefined;
    const posKey = normalizePosLabel(parent?.label ?? (context.posLabel as string | undefined));

    moveToAnchorPosition(anchor);

    const cardTypes = detailCardConfig[posKey] || ["example"];

    const detailCards: THREE.Group[] = [];
    const edges: THREE.Line[] = [];

    cardTypes.forEach((type, index) => {
      let card: THREE.Group | null = null;

      if (type === "example") {
        const examples = toExamples(node);
        if (examples && examples.length > 0) {
          card = createSentenceCard({ examples });
        }
      }

      if (type === "plural") {
        const pl = toPlural(node);
        if (pl) card = createPluralCard(pl);
      }

      if (type === "conjugation") {
        const cj = toConjugation(node);
        if (cj) card = createConjugationCard(cj);
      }

      if (type === "test") {
        card = createHelloCard();
      }

      if (type === "comparativeSuperlative") {
        const comparative = (node as any).comparative;
        const superlative = (node as any).superlative;
        if (typeof comparative === "string" && typeof superlative === "string") {
          card = createAdjectiveCard({ comparative, superlative });
        }
      }

      if (type === "numberForm") {
        const ordinal = (node as any).ordinal;
        if (typeof ordinal === "string") {
          card = createNumberCard({ word: node.label, ordinal });
        }
      }

      if (type === "pronounForm") {
        const nominative = (node as any).nominative;
        const accusative = (node as any).accusative;
        const dative = (node as any).dative;
        const genitive = (node as any).genitive;
        if (
          typeof nominative === "string" &&
          typeof accusative === "string" &&
          typeof dative === "string" &&
          typeof genitive === "string"
        ) {
          card = createPronounCard({
            word: node.label,
            nominative,
            accusative,
            dative,
            genitive,
          });
        }
      }

      if (type === "prepositionForm") {
        const meaning = (node as any).meaning;
        if (typeof meaning === "string") {
          card = createPrepositionCard({ word: node.label, meaning });
        }
      }

      if (!card) return;

      card.position.set((index - 0.5) * 0.9, 0.1, -1.6);
      card.rotation.x = -0.06;

      scene.add(card);
      detailCards.push(card);

      const edge = helpers.createEdge(anchor, card);
      scene.add(edge);
      edges.push(edge);
    });

    return {
      anchor,
      children: detailCards,
      edges,
    };
  },
};