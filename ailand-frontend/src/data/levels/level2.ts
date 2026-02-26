import { vocabularyWords } from "@/data/vocabulary";
import type { Lives } from "@/components/levels/LevelContext";

export type Level2Word = {
  id: string;
  word: string;
  article: string;
  english: string;
  category: string;
};

const level2 = {
  levelId: "level2",

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

  progress: {
    completedTasks: [] as string[],
    currentTask: "task1",
    lives: 3 as Lives,
    maxLives: 3,
  },

  perWordStats: {} as Record<string, unknown>,
};

export default level2;
