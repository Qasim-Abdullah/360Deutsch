from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from enum import Enum


class PointsReason(str, Enum):
    WORD_STARTED = "word_started"
    WORD_LEARNED = "word_learned"
    ROOM_STARTED = "room_started"
    ROOM_COMPLETED = "room_completed"
    DAILY_STREAK_3 = "daily_streak_3"
    DAILY_STREAK_7 = "daily_streak_7"
    DAILY_STREAK_30 = "daily_streak_30"
    CUSTOM = "custom"


class AddPointsRequest(BaseModel):
    points: int
    reason: PointsReason
    reference_id: Optional[str] = None 


class AddPointsResponse(BaseModel):
    message: str
    points_added: int
    total_points: int
    reason: str


class PointsResponse(BaseModel):
    total_points: int
    points_today: int
    points_this_week: int


class PointsHistoryItem(BaseModel):
    points: int
    reason: str
    reference_id: Optional[str] = None
    created_at: datetime


class PointsHistoryResponse(BaseModel):
    total: int
    history: List[PointsHistoryItem]


class LevelResponse(BaseModel):
    level: int
    title: str
    total_points: int
    points_in_level: int
    points_to_next_level: int
    progress_percentage: float


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[date] = None
    streak_active_today: bool


class StreakUpdateResponse(BaseModel):
    message: str
    current_streak: int
    streak_increased: bool
    bonus_points: int


class RoadmapProgressResponse(BaseModel):
    rooms_completed: int  # 0–4
    total_rooms: int = 4


class ProgressOverview(BaseModel):
    total_points: int
    level: int
    level_title: str
    progress_percentage: float
    current_streak: int
    longest_streak: int
    words_learned: int
    rooms_completed: int
