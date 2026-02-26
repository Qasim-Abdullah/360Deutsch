from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from app.core.database import Base


class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    total_points = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(Date, nullable=True)
    game_levels_completed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PointsHistory(Base):
    __tablename__ = "points_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    points = Column(Integer, nullable=False)
    reason = Column(String, nullable=False) 
    reference_id = Column(String, nullable=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())


POINTS_CONFIG = {
    "word_started": 5,
    "word_learned": 10,
    "room_started": 20,
    "room_completed": 100,
    "level_completed": 10,  
    "daily_streak_3": 25,
    "daily_streak_7": 50,
    "daily_streak_30": 200,
}

LEVEL_THRESHOLDS = [
    (0, 1, "Beginner"),
    (100, 2, "Novice"),
    (300, 3, "Learner"),
    (600, 4, "Intermediate"),
    (1000, 5, "Advanced"),
    (1500, 6, "Expert"),
    (2500, 7, "Master"),
    (4000, 8, "Champion"),
    (6000, 9, "Legend"),
    (10000, 10, "Grandmaster"),
]


def get_level_from_points(points: int) -> dict:
    level = 1
    title = "Beginner"
    current_threshold = 0
    next_threshold = 100
    
    for threshold, lvl, lvl_title in LEVEL_THRESHOLDS:
        if points >= threshold:
            level = lvl
            title = lvl_title
            current_threshold = threshold
    
   
    for threshold, lvl, _ in LEVEL_THRESHOLDS:
        if threshold > points:
            next_threshold = threshold
            break
    else:
        next_threshold = points  
    
    points_in_level = points - current_threshold
    points_to_next = next_threshold - current_threshold
    progress_percentage = (points_in_level / points_to_next * 100) if points_to_next > 0 else 100
    
    return {
        "level": level,
        "title": title,
        "points_in_level": points_in_level,
        "points_to_next_level": max(0, next_threshold - points),
        "progress_percentage": round(progress_percentage, 1)
    }
