export type LevelConfig = {
  level: string;
  subtitle: string;
  items: string[];
  iconUrl: string;
};

export const levelConfigs: LevelConfig[] = [
  {
    level: "A1",
    subtitle: "Anfänger · Grundlagen",
    items: ["120 Wörter", "Alltag & Räume", "Grundgrammatik"],
    iconUrl: "/assets/icons/AR/stair_1.png",
  },
  {
    level: "B2",
    subtitle: "Fließend · Akademisch",
    items: ["900 Wörter", "Diskussion & Debatte", "Nuancen"],
    iconUrl: "/assets/icons/AR/stair_4.png",
  },
  {
    level: "A2",
    subtitle: "Grundlagen · Erweiterung",
    items: ["250 Wörter", "Alltag & Arbeit", "Satzbau"],
    iconUrl: "/assets/icons/AR/stair_2.png",
  },
  {
    level: "B1",
    subtitle: "Fortgeschritten · Kommunikation",
    items: ["500 Wörter", "Beruf & Reisen", "Komplexe Sätze"],
    iconUrl: "/assets/icons/AR/stair_3.png",
  },
];