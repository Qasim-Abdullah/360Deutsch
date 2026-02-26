from fastapi import APIRouter, Depends, Query, Body, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.schemas.progress import (
    PointsResponse, PointsHistoryItem, PointsHistoryResponse,
    LevelResponse, RoadmapProgressResponse,
)
from app.models.user_progress import (
    UserProgress, PointsHistory, get_level_from_points
)
from app.models.model import Model
from app.core.database import get_db
from app.utils.dependencies import get_current_user
from app.services.progress_service import record_activity

router = APIRouter()

VALID_LEVEL_IDS = {"level1", "level2", "level3", "level4"}


class LevelCompleteRequest(BaseModel):
    level_id: str  


def get_or_create_user_progress(db: Session, user_id: int) -> UserProgress:
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not progress:
        progress = UserProgress(user_id=user_id, total_points=0, current_streak=0, longest_streak=0)
        db.add(progress)
        db.commit()
        db.refresh(progress)
    return progress


@router.post("/level-complete", response_model=PointsResponse)
async def level_complete(
    body: LevelCompleteRequest = Body(...),
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    level_id = body.level_id.strip().lower()
    if level_id not in VALID_LEVEL_IDS:
        raise HTTPException(400, detail=f"Invalid level_id. Use one of: {', '.join(VALID_LEVEL_IDS)}")
    record_activity(db, current_user.id, "level_completed", level_id)
    progress = get_or_create_user_progress(db, current_user.id)
    level_num = int(level_id.replace("level", ""))
    current = getattr(progress, "game_levels_completed", None) or 0
    progress.game_levels_completed = max(current, level_num)
    db.commit()
    db.refresh(progress)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    points_today = db.query(func.coalesce(func.sum(PointsHistory.points), 0)).filter(
        PointsHistory.user_id == current_user.id,
        PointsHistory.created_at >= today_start
    ).scalar() or 0
    week_start = today_start - timedelta(days=today_start.weekday())
    points_this_week = db.query(func.coalesce(func.sum(PointsHistory.points), 0)).filter(
        PointsHistory.user_id == current_user.id,
        PointsHistory.created_at >= week_start
    ).scalar() or 0
    return PointsResponse(
        total_points=progress.total_points,
        points_today=points_today,
        points_this_week=points_this_week
    )


@router.get("/points", response_model=PointsResponse)
async def get_points(
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    progress = get_or_create_user_progress(db, current_user.id)
    
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    points_today = db.query(func.coalesce(func.sum(PointsHistory.points), 0)).filter(
        PointsHistory.user_id == current_user.id,
        PointsHistory.created_at >= today_start
    ).scalar() or 0
    
    
    week_start = today_start - timedelta(days=today_start.weekday())
    points_this_week = db.query(func.coalesce(func.sum(PointsHistory.points), 0)).filter(
        PointsHistory.user_id == current_user.id,
        PointsHistory.created_at >= week_start
    ).scalar() or 0
    
    return PointsResponse(
        total_points=progress.total_points,
        points_today=points_today,
        points_this_week=points_this_week
    )


@router.get("/points/history", response_model=PointsHistoryResponse)
async def get_points_history(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    query = db.query(PointsHistory).filter(PointsHistory.user_id == current_user.id)
    total = query.count()
    
    history_items = query.order_by(PointsHistory.created_at.desc()).offset(offset).limit(limit).all()
    
    history = [
        PointsHistoryItem(
            points=h.points,
            reason=h.reason,
            reference_id=h.reference_id,
            created_at=h.created_at
        )
        for h in history_items
    ]
    
    return PointsHistoryResponse(total=total, history=history)


@router.get("/level", response_model=LevelResponse)
async def get_level(
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    progress = get_or_create_user_progress(db, current_user.id)
    level_info = get_level_from_points(progress.total_points)
    
    return LevelResponse(
        level=level_info["level"],
        title=level_info["title"],
        total_points=progress.total_points,
        points_in_level=level_info["points_in_level"],
        points_to_next_level=level_info["points_to_next_level"],
        progress_percentage=level_info["progress_percentage"]
    )


@router.get("/roadmap", response_model=RoadmapProgressResponse)
async def get_roadmap_progress(
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db),
):
   
    progress = get_or_create_user_progress(db, current_user.id)
    completed = getattr(progress, "game_levels_completed", None) or 0
    return RoadmapProgressResponse(rooms_completed=completed, total_rooms=4)



