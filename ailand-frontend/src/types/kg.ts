export type KGNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export class KG {
  nodes: KGNode[];

  constructor(label: string) {
    this.nodes = [
      { id: "center", label, x: 0, y: 0 },
      { id: "syn", label: "Synonyms", x: -120, y: -80 },
      { id: "tr", label: "Translations", x: 120, y: -80 },
      { id: "ex", label: "Examples", x: 0, y: 120 },
    ];
  }
}
