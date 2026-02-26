from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class WordStatusEnum(str, Enum):
    IN_PROGRESS = "in_progress"
    LEARNED = "learned"


class WordStartRequest(BaseModel):
    word_id: str
    room_id: str  # A1, A2, B1, etc.


class WordCompleteRequest(BaseModel):
    word_id: str


class LearnedWord(BaseModel):
    word_id: str
    room_id: str
    german: Optional[str] = None
    english: Optional[str] = None
    pos: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    review_count: int = 0


class InProgressWord(BaseModel):
    word_id: str
    room_id: str
    german: Optional[str] = None
    english: Optional[str] = None
    pos: Optional[str] = None
    started_at: datetime
    review_count: int = 0
    last_reviewed_at: Optional[datetime] = None


class LearnedWordsResponse(BaseModel):
    total: int
    words: List[LearnedWord]


class InProgressWordsResponse(BaseModel):
    total: int
    words: List[InProgressWord]


class WordActionResponse(BaseModel):
    message: str
    word_id: str
    status: WordStatusEnum
    timestamp: datetime


class LevelStats(BaseModel):
    level: str
    total_words: int
    learned: int
    in_progress: int
    not_started: int
    progress_percentage: float


class DailyProgress(BaseModel):
    date: str
    words_learned: int
    words_started: int


class WordLearningStats(BaseModel):
    total_words_learned: int
    total_words_in_progress: int
    total_review_count: int
    learning_streak_days: int
    avg_words_per_day: float
    by_level: List[LevelStats]
    daily_progress: List[DailyProgress] 
    strongest_level: Optional[str] = None
    weakest_level: Optional[str] = None
