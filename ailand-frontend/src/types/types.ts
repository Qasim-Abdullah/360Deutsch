export interface Mission {
  id: number;
  title: string;
  word: string;
  article: string;
  fullName: string;
  translation: string;
  object: string;
  emoji: string;
  completed: boolean;
}

export interface GameState {
  missions: Mission[];
  currentMissionIndex: number;
  completedCount: number;
  timeRemaining: number;
}
