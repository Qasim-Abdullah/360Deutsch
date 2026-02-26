export type PosType =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "number";

export type PosConfig = {
  title: string;
  subtitle: string;
  iconUrl: string;
  type: PosType;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
};

export const posConfigs: PosConfig[] = [
  {
    title: "Nomen",
    subtitle: "Dinge & Objekte",
    iconUrl: "/images/pos/nomen.png",
    type: "noun",
    position: { x: 0, y: -0.5, z: -2.5 },
    rotation: { x: -0.06, y: 0, z: 0 },
  },
  {
    title: "Verben",
    subtitle: "Handlungen",
    iconUrl: "/images/pos/verben.png",
    type: "verb",
    position: { x: -0.65, y: 0.15, z: -2.4 },
    rotation: { x: -0, y: 0.4, z: 0 },
  },
  {
    title: "Adjektive",
    subtitle: "Eigenschaften",
    iconUrl: "/images/pos/adjektive.png",
    type: "adjective",
    position: { x: 0.65, y: 0.15, z: -2.4 },
    rotation: { x: -0, y: -0.4, z: 0 },
  },
  {
    title: "Adverbien",
    subtitle: "Umstände",
    iconUrl: "/images/pos/adverbien.png",
    type: "adverb",
    position: { x: 2, y: 0.15, z: -2 },
    rotation: { x: -0.06, y: -0.8, z: 0 },
  },
  {
    title: "Pronomen",
    subtitle: "Stellvertreter",
    iconUrl: "/images/pos/pronomen.png",
    type: "pronoun",
    position: { x: -1.3, y: -0.5, z: -2.2 },
    rotation: { x: -0, y: 0.6, z: 0 },
  },
  {
    title: "Präpositionen",
    subtitle: "Verhältnisse",
    iconUrl: "/images/pos/prapositionen.png",
    type: "preposition",
    position: { x: -2, y: 0.15, z: -2 },
    rotation: { x: -0, y: 0.8, z: 0 },
  },
  {
    title: "Zahlen",
    subtitle: "Numerische Formen",
    iconUrl: "/images/pos/zahlen.png",
    type: "number",
    position: { x: 1.3, y: -0.5, z: -2.2 },
    rotation: { x: -0, y: -0.6, z: 0 },
  },
];

export const posLabelToType: Record<string, PosType> = {
  Noun: "noun",
  Nouns: "noun",

  Verb: "verb",
  Verbs: "verb",

  Adjective: "adjective",
  Adjectives: "adjective",

  Adverb: "adverb",
  Adverbs: "adverb",

  Pronoun: "pronoun",
  Pronouns: "pronoun",

  Preposition: "preposition",
  Prepositions: "preposition",

  Number: "number",
  Numbers: "number",
};