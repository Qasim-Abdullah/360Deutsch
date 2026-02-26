import { vocabularyWords } from "@/data/vocabulary";
import type { Mission } from "@/types/types";

export type Level3WordFromApi = {
  id: string;
  word: string;
  article: string;
  english: string;
  category: string;
};


export const wordToEmoji: Record<string, string> = {
  klavier: "🎹",
  lampe: "💡",
  stuhl: "🪑",
  blume: "🌸",
  kasten: "📦",
  ei: "🥚",
  rahmen: "🖼️",
  hausschuh: "👟",
  fisch: "🐟",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Build Mission[] from API level data (tasks[0].words) */
export function missionsFromLevelData(words: Level3WordFromApi[]): Mission[] {
  return words.map((w, i) => {
    const wordLower = w.word.toLowerCase();
    const wordDisplay = capitalize(w.word);
    const articleDisplay = capitalize(w.article);
    return {
      id: i + 1,
      title: `Find ${articleDisplay} ${wordDisplay}`,
      word: wordDisplay,
      article: w.article,
      fullName: `${w.article} ${wordDisplay}`,
      translation: w.english,
      object: wordLower,
      emoji: wordToEmoji[wordLower] ?? "📌",
      completed: false,
    };
  });
}

/** Level 3 data shape for API / fallback (same structure as level2 so backend can return tasks[0].words) */
const level3 = {
  levelId: "level3",
  tasks: [
    {
      taskId: "task1",
      words: vocabularyWords.map((w, i) => ({
        id: `w${i + 1}`,
        word: w.word,
        article: w.article,
        english: w.english,
        category: w.category,
      })),
    },
  ],
};

export default level3;
