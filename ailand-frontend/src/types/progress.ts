
export type PointsResponseBE = {
  total_points: number;
  points_today: number;
  points_this_week: number;
};

export type LevelResponseBE = {
  level: number;
  title: string;
  total_points: number;
  points_in_level: number;
  points_to_next_level: number;
  progress_percentage: number;
};

export type StreakResponseBE = {
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string | null; 
  streak_active_today: boolean;
};

export type LevelStatsBE = {
  level: string;
  total_words: number;
  learned: number;
  in_progress: number;
  not_started: number;
  progress_percentage: number;
};

export type WordStatsBE = {
  total_words_learned: number;
  total_words_in_progress: number;
  total_review_count: number;
  learning_streak_days: number;
  avg_words_per_day: number;
  daily_progress: Array<{
    date: string;
    words_learned: number;
    words_started: number;
  }>;
  by_level?: LevelStatsBE[];
};

export type RoomsProgressBE = {
  total_rooms: number;
  completed_rooms: number;
  in_progress_rooms: number;
  progress_summary: string;
  rooms: Array<{
    room_id: string;
    status: "not_started" | "in_progress" | "completed";
    started_at?: string | null;
    completed_at?: string | null;
    words_learned?: number;
  }>;
};


export type UserProgressUI = {
  roomsCompleted: number;
  totalRooms: number;

  levelsCompleted: number;

  wordsLearned: number;
  totalWords: number;

  dayStreak: number;

  vocabularyProgress: {
    mastered: number;
    learning: number;
    inProgress: number;
    notStarted: number;
  };

  weeklyActivity: {
    currentWeek: number;
    days: { day: string; value: number; date: string }[];
    mostActiveDay: string;
  };

  levelProgress: {
    current: string;             
    progressPercent: number;     
    overallProgressPercent: number; 
    milestones: string[];        
  };

  
  totalPoints: number;
  pointsToday: number;
  pointsThisWeek: number;
};
