const STORAGE_KEY = "ailand_learned_words";

export type LearnedWord = {
  id: string;
  german: string;
  english: string;
  learnedAt: string;
};

export function getLearnedWords(): LearnedWord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLearnedWord(word: Omit<LearnedWord, "learnedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const words = getLearnedWords();
    // Don't add duplicates
    if (words.some((w) => w.id === word.id)) return;
    words.push({
      ...word,
      learnedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch {
    // ignore
  }
}

export function isWordLearned(id: string): boolean {
  return getLearnedWords().some((w) => w.id === id);
}
