export type ARNodeType =
  | "root"
  | "level"
  | "category"
  | "subcategory"
  | "pos"
  | "entry";

export type ARNode = {
  id: string;
  label: string;
  type: ARNodeType;
  children?: ARNode[];

  gender?: string;
  plural?: string;
  ipa?: string;
  comparative?: string;
  superlative?: string;
  conjugation?: Record<string, string>;
  examples?: { de: string; en: string }[];
};