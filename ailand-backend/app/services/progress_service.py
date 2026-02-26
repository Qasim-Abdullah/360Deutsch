
from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.models.user_progress import UserProgress, PointsHistory, POINTS_CONFIG


def get_or_create_user_progress(db: Session, user_id: int) -> UserProgress:
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not progress:
        progress = UserProgress(
            user_id=user_id, 
            total_points=0, 
            current_streak=0, 
            longest_streak=0
        )
        db.add(progress)
        db.flush()
    return progress


def add_points(db: Session, user_id: int, points: int, reason: str, reference_id: str = None) -> int:
    
    progress = get_or_create_user_progress(db, user_id)
    progress.total_points += points
    

    history = PointsHistory(
        user_id=user_id,
        points=points,
        reason=reason,
        reference_id=reference_id
    )
    db.add(history)
    
    return points


def update_streak(db: Session, user_id: int) -> dict:
  
    progress = get_or_create_user_progress(db, user_id)
    
    today = date.today()
    yesterday = today - timedelta(days=1)
    bonus_points = 0
    streak_increased = False
    
    if progress.last_activity_date == today:
        
        return {
            "streak_increased": False,
            "current_streak": progress.current_streak,
            "bonus_points": 0
        }
    
    if progress.last_activity_date == yesterday:
        
        progress.current_streak += 1
        streak_increased = True
    else:
        
        progress.current_streak = 1
        streak_increased = True
    
    
    if progress.current_streak > progress.longest_streak:
        progress.longest_streak = progress.current_streak
    
    progress.last_activity_date = today
    
    
    if progress.current_streak == 3:
        bonus_points = POINTS_CONFIG["daily_streak_3"]
    elif progress.current_streak == 7:
        bonus_points = POINTS_CONFIG["daily_streak_7"]
    elif progress.current_streak == 30:
        bonus_points = POINTS_CONFIG["daily_streak_30"]
    elif progress.current_streak > 30 and progress.current_streak % 30 == 0:
        bonus_points = POINTS_CONFIG["daily_streak_30"]
    
    if bonus_points > 0:
        progress.total_points += bonus_points
        
        history = PointsHistory(
            user_id=user_id,
            points=bonus_points,
            reason=f"streak_{progress.current_streak}_days"
        )
        db.add(history)
    
    return {
        "streak_increased": streak_increased,
        "current_streak": progress.current_streak,
        "bonus_points": bonus_points
    }


def record_activity(db: Session, user_id: int, action: str, reference_id: str = None) -> dict:
    
    points = POINTS_CONFIG.get(action, 0)
    
    
    if points > 0:
        add_points(db, user_id, points, action, reference_id)
    
    
    streak_info = update_streak(db, user_id)
    
    total_points = points + streak_info["bonus_points"]
    
    return {
        "action": action,
        "points_earned": points,
        "streak_bonus": streak_info["bonus_points"],
        "total_points_earned": total_points,
        "current_streak": streak_info["current_streak"],
        "streak_increased": streak_info["streak_increased"]
    }
