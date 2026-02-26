export type Room = {
  room_id: string;
  name: string;
  word_count: number;
  description?: string;
  image?: string;
};

export type WordStatusUI = "learned" | "in_progress" | "new";

export type WordUI = {
  id: string;
  german: string;
  english: string;
  status: WordStatusUI;
  pos?: string;
  isDifficult?: boolean;
  image?: string;
};

export type VocabularyUI = {
  level: string;
  rooms: Room[];
  selectedRoomId: string | null;

  totals: {
    totalWords: number;
    learned: number;
    inProgress: number;
  };

  words: WordUI[];
};

// Backend response types
export type RoomInfoBE = {
  room_id: string;
  name: string;
  description?: string;
  word_count: number;
  status?: string;
  is_unlocked?: boolean;
};

export type RoomsListResponseBE = {
  rooms: RoomInfoBE[];
};

export type SubjectBE = {
  id: string;
  german: string;
  english: string;
  pos: string;
};

export type RoomSubjectsResponseBE = {
  level: string;
  limit: number;
  offset: number;
  subjects: SubjectBE[];
};

export type LearnedWordBE = {
  word_id: string;
  room_id: string;
  german?: string;
  english?: string;
  pos?: string;
  started_at: string;
  completed_at?: string;
  review_count: number;
};

export type LearnedWordsResponseBE = {
  total: number;
  words: LearnedWordBE[];
};

export type InProgressWordBE = {
  word_id: string;
  room_id: string;
  german?: string;
  english?: string;
  pos?: string;
  started_at: string;
  review_count: number;
  last_reviewed_at?: string;
};

export type InProgressWordsResponseBE = {
  total: number;
  words: InProgressWordBE[];
};