/**
 * Static vocabulary data service.
 * Loads vocabulary from bundled JSON instead of backend API.
 */

import vocabularyData from '@/data/vocabulary.json';

export interface WordData {
  id: string;
  german: string;
  level: string;
  pos: string;
  gender: string | null;
  ipa: string | null;
  translations: string[];
  meanings_de: string[];
  meanings_en: string[];
  examples: string[];
}

export interface LevelData {
  word_count: number;
  words: string[];
}

interface VocabularyData {
  words: Record<string, WordData>;
  levels: Record<string, LevelData>;
}

const data = vocabularyData as VocabularyData;

/**
 * Get all levels with word counts.
 */
export function getLevels(): Array<{ level: string; word_count: number }> {
  return Object.entries(data.levels).map(([level, levelData]) => ({
    level,
    word_count: levelData.word_count,
  }));
}

/**
 * Get total word count for a specific level.
 */
export function getLevelWordCount(level: string): number {
  return data.levels[level]?.word_count ?? 0;
}

/**
 * Get subjects (words) for a level with pagination.
 */
export function getSubjectsByLevel(
  level: string,
  limit: number = 20,
  offset: number = 0
): {
  level: string;
  limit: number;
  offset: number;
  subjects: Array<{
    id: string;
    german: string;
    english: string;
    pos: string;
  }>;
} {
  const levelData = data.levels[level];
  if (!levelData) {
    return { level, limit, offset, subjects: [] };
  }

  const wordIds = levelData.words.slice(offset, offset + limit);
  const subjects = wordIds.map((wordId) => {
    const word = data.words[wordId];
    return {
      id: wordId,
      german: word?.german ?? wordId,
      english: word?.translations[0] ?? '',
      pos: word?.pos ?? 'unknown',
    };
  });

  return { level, limit, offset, subjects };
}

/**
 * Get all words for a level (no pagination).
 */
export function getAllWordsForLevel(level: string): WordData[] {
  const levelData = data.levels[level];
  if (!levelData) return [];

  return levelData.words
    .map((wordId) => data.words[wordId])
    .filter((word): word is WordData => word !== undefined);
}

/**
 * Get detailed information for a specific word.
 */
export function getWordDetails(wordId: string): WordData | null {
  return data.words[wordId] ?? null;
}

/**
 * Get word as graph visualization data.
 */
export function getWordAsGraph(wordId: string): {
  word: WordData;
  graph: {
    nodes: Array<{ id: string; type: string; label: string; data?: Record<string, unknown> }>;
    edges: Array<{ source: string; target: string; relation: string }>;
  };
} | null {
  const word = data.words[wordId];
  if (!word) return null;

  const nodes: Array<{ id: string; type: string; label: string; data?: Record<string, unknown> }> = [
    {
      id: 'center',
      type: 'word',
      label: word.german,
      data: {
        ipa: word.ipa,
        pos: word.pos,
        gender: word.gender,
        level: word.level,
      },
    },
  ];
  const edges: Array<{ source: string; target: string; relation: string }> = [];

  // Add translation nodes
  word.translations.slice(0, 3).forEach((trans, i) => {
    const nodeId = `trans_${i}`;
    nodes.push({ id: nodeId, type: 'translation', label: trans });
    edges.push({ source: 'center', target: nodeId, relation: 'translates_to' });
  });

  // Add meaning nodes
  word.meanings_en.slice(0, 3).forEach((meaning, i) => {
    const nodeId = `meaning_${i}`;
    const label = meaning.length > 150 ? meaning.slice(0, 150) + '...' : meaning;
    nodes.push({ id: nodeId, type: 'meaning', label });
    edges.push({ source: 'center', target: nodeId, relation: 'means' });
  });

  // Add example nodes
  word.examples.slice(0, 3).forEach((example, i) => {
    const nodeId = `example_${i}`;
    nodes.push({ id: nodeId, type: 'example', label: example });
    edges.push({ source: 'center', target: nodeId, relation: 'used_in' });
  });

  return { word, graph: { nodes, edges } };
}

/**
 * Search words by query string.
 */
export function searchWords(
  query: string,
  level?: string,
  limit: number = 10
): Array<{ id: string; german: string; english: string; level: string; pos: string }> {
  const normalizedQuery = query.toLowerCase();
  const results: Array<{ id: string; german: string; english: string; level: string; pos: string }> = [];

  for (const [wordId, word] of Object.entries(data.words)) {
    if (level && word.level !== level) continue;

    const matchesGerman = word.german.toLowerCase().includes(normalizedQuery);
    const matchesEnglish = word.translations.some((t) =>
      t.toLowerCase().includes(normalizedQuery)
    );

    if (matchesGerman || matchesEnglish) {
      results.push({
        id: wordId,
        german: word.german,
        english: word.translations[0] ?? '',
        level: word.level,
        pos: word.pos,
      });

      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Get room info (for compatibility with existing UI).
 */
export function getRooms(): Array<{
  room_id: string;
  name: string;
  description: string;
  word_count: number;
  status: string;
  is_unlocked: boolean;
}> {
  const roomInfo: Record<string, { name: string; description: string }> = {
    A1: { name: 'Beginner Room', description: 'Start your German journey with basic vocabulary' },
    A2: { name: 'Elementary Room', description: 'Build upon basics with everyday expressions' },
    B1: { name: 'Intermediate Room', description: 'Handle most travel and work situations' },
  };

  return ['A1', 'A2', 'B1'].map((level) => ({
    room_id: level,
    name: roomInfo[level].name,
    description: roomInfo[level].description,
    word_count: data.levels[level]?.word_count ?? 0,
    status: 'not_started',
    is_unlocked: true,
  }));
}
