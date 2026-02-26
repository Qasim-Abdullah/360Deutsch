/** German vocabulary words that match objects in the 3D room (Level 2) */
export type VocabularyWord = {
  word: string;
  article: string;
  english: string;
  category: string;
};

export const vocabularyWords: VocabularyWord[] = [
  { word: "klavier", article: "das", english: "piano", category: "furniture" },
  { word: "lampe", article: "die", english: "lamp", category: "furniture" },
  { word: "stuhl", article: "der", english: "chair", category: "furniture" },
  { word: "blume", article: "die", english: "flower", category: "decoration" },
  { word: "kasten", article: "der", english: "box / crate", category: "object" },
  { word: "ei", article: "das", english: "egg", category: "object" },
  { word: "rahmen", article: "der", english: "frame", category: "object" },
  { word: "hausschuh", article: "der", english: "slipper", category: "object" },
  { word: "fisch", article: "der", english: "fish", category: "object" },
];
