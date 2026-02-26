from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.services.kg_service import kg_service
from app.services.progress_service import record_activity
from app.schemas.kg import (
    LevelsResponse, LevelInfo,
    RoomSubjectsResponse,
    WordDetails,
    WordGraphResponse,
    RoomInfo, RoomDetailResponse, RoomsListResponse,
    RoomProgressResponse, UserProgressResponse, RoomActionResponse,
    RoomStatusEnum
)
from app.models.room_progress import RoomProgress, RoomStatus
from app.models.model import Model
from app.core.database import get_db
from app.utils.dependencies import get_current_user

router = APIRouter()

VALID_LEVELS = ["A1", "A2", "B1"]

ROOM_INFO = {
    "A1": {"name": "Beginner Room", "description": "Start your German journey with basic vocabulary"},
    "A2": {"name": "Elementary Room", "description": "Build upon basics with everyday expressions"},
    "B1": {"name": "Intermediate Room", "description": "Handle most travel and work situations"},
}



@router.get("/rooms", response_model=RoomsListResponse)
async def get_rooms(db: Session = Depends(get_db)):
  
    levels = kg_service.get_levels()
    level_counts = {l["level"]: l["word_count"] for l in levels}
    
    rooms = []
    for level in VALID_LEVELS:
        info = ROOM_INFO.get(level, {"name": f"Room {level}", "description": f"Level {level} vocabulary"})
        rooms.append(RoomInfo(
            room_id=level,
            name=info["name"],
            description=info["description"],
            word_count=level_counts.get(level, 0),
            status=RoomStatusEnum.NOT_STARTED,
            is_unlocked=True
        ))
    
    return RoomsListResponse(rooms=rooms)


@router.get("/rooms/progress", response_model=UserProgressResponse)
async def get_user_progress(
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   

    progress_records = db.query(RoomProgress).filter(
        RoomProgress.user_id == current_user.id
    ).all()
    
    progress_map = {p.room_id: p for p in progress_records}
    
    completed_count = 0
    in_progress_count = 0
    rooms_progress = []
    
    for level in VALID_LEVELS:
        progress = progress_map.get(level)
        if progress:
            status = RoomStatusEnum(progress.status)
            if status == RoomStatusEnum.COMPLETED:
                completed_count += 1
            elif status == RoomStatusEnum.IN_PROGRESS:
                in_progress_count += 1
            
            rooms_progress.append(RoomProgressResponse(
                room_id=level,
                status=status,
                started_at=progress.started_at,
                completed_at=progress.completed_at,
                words_learned=progress.words_learned or 0
            ))
        else:
            rooms_progress.append(RoomProgressResponse(
                room_id=level,
                status=RoomStatusEnum.NOT_STARTED,
                words_learned=0
            ))
    
    return UserProgressResponse(
        total_rooms=len(VALID_LEVELS),
        completed_rooms=completed_count,
        in_progress_rooms=in_progress_count,
        progress_summary=f"{completed_count}/{len(VALID_LEVELS)}",
        rooms=rooms_progress
    )


@router.get("/rooms/{room_id}", response_model=RoomDetailResponse)
async def get_room_details(
    room_id: str,
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
  
    room_id_upper = room_id.upper()
    if room_id_upper not in VALID_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid room '{room_id}'. Valid rooms are: {', '.join(VALID_LEVELS)}"
        )
    
    info = ROOM_INFO.get(room_id_upper, {"name": f"Room {room_id_upper}", "description": f"Level {room_id_upper}"})
    
    kg_data = kg_service.get_subjects_by_level(room_id_upper, limit=50, offset=0)
    
    progress = db.query(RoomProgress).filter(
        RoomProgress.user_id == current_user.id,
        RoomProgress.room_id == room_id_upper
    ).first()
    
    status = RoomStatusEnum.NOT_STARTED
    started_at = None
    completed_at = None
    words_learned = 0
    
    if progress:
        status = RoomStatusEnum(progress.status)
        started_at = progress.started_at
        completed_at = progress.completed_at
        words_learned = progress.words_learned or 0
    
    return RoomDetailResponse(
        room_id=room_id_upper,
        name=info["name"],
        description=info["description"],
        level=room_id_upper,
        word_count=len(kg_data["subjects"]),
        status=status,
        started_at=started_at,
        completed_at=completed_at,
        words_learned=words_learned,
        subjects=kg_data["subjects"]
    )


@router.post("/rooms/{room_id}/start", response_model=RoomActionResponse)
async def start_room(
    room_id: str,
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
  
    room_id_upper = room_id.upper()
    if room_id_upper not in VALID_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid room '{room_id}'. Valid rooms are: {', '.join(VALID_LEVELS)}"
        )
    
    progress = db.query(RoomProgress).filter(
        RoomProgress.user_id == current_user.id,
        RoomProgress.room_id == room_id_upper
    ).first()
    
    now = datetime.utcnow()
    
    if progress:
        if progress.status == RoomStatus.COMPLETED.value:
            raise HTTPException(
                status_code=400,
                detail=f"Room '{room_id_upper}' is already completed"
            )
        elif progress.status == RoomStatus.IN_PROGRESS.value:
            return RoomActionResponse(
                message=f"Room '{room_id_upper}' is already in progress",
                room_id=room_id_upper,
                status=RoomStatusEnum.IN_PROGRESS,
                timestamp=progress.started_at
            )
    else:
        progress = RoomProgress(
            user_id=current_user.id,
            room_id=room_id_upper,
            status=RoomStatus.IN_PROGRESS.value,
            started_at=now,
            words_learned=0
        )
        db.add(progress)
        
        activity = record_activity(db, current_user.id, "room_started", room_id_upper)
    
    progress.status = RoomStatus.IN_PROGRESS.value
    progress.started_at = now
    db.commit()
    db.refresh(progress)
    
    msg = f"Room '{room_id_upper}' started"
    if 'activity' in dir():
        msg += f" (+{activity['points_earned']} pts"
        if activity['streak_bonus'] > 0:
            msg += f", +{activity['streak_bonus']} streak bonus"
        msg += f", streak: {activity['current_streak']})"
    
    return RoomActionResponse(
        message=msg,
        room_id=room_id_upper,
        status=RoomStatusEnum.IN_PROGRESS,
        timestamp=now
    )


@router.post("/rooms/{room_id}/complete", response_model=RoomActionResponse)
async def complete_room(
    room_id: str,
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
 
    room_id_upper = room_id.upper()
    if room_id_upper not in VALID_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid room '{room_id}'. Valid rooms are: {', '.join(VALID_LEVELS)}"
        )
    
    progress = db.query(RoomProgress).filter(
        RoomProgress.user_id == current_user.id,
        RoomProgress.room_id == room_id_upper
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=400,
            detail=f"Room '{room_id_upper}' has not been started yet"
        )
    
    if progress.status == RoomStatus.COMPLETED.value:
        return RoomActionResponse(
            message=f"Room '{room_id_upper}' is already completed",
            room_id=room_id_upper,
            status=RoomStatusEnum.COMPLETED,
            timestamp=progress.completed_at
        )
    
    now = datetime.utcnow()
    progress.status = RoomStatus.COMPLETED.value
    progress.completed_at = now
    
    kg_data = kg_service.get_subjects_by_level(room_id_upper, limit=1000, offset=0)
    progress.words_learned = len(kg_data["subjects"])
    
    activity = record_activity(db, current_user.id, "room_completed", room_id_upper)
    
    db.commit()
    db.refresh(progress)
    
    msg = f"Room '{room_id_upper}' completed (+{activity['points_earned']} pts"
    if activity['streak_bonus'] > 0:
        msg += f", +{activity['streak_bonus']} streak bonus"
    msg += f", streak: {activity['current_streak']})"
    
    return RoomActionResponse(
        message=msg,
        room_id=room_id_upper,
        status=RoomStatusEnum.COMPLETED,
        timestamp=now
    )



@router.get("/rooms/{level}/subjects", response_model=RoomSubjectsResponse)
async def get_room_subjects(
    level: str,
    limit: int = Query(default=20, ge=1, le=100, description="Number of subjects to return"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination")
):
    
    if level.upper() not in VALID_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid level '{level}'. Valid levels are: {', '.join(VALID_LEVELS)}"
        )
    
    result = kg_service.get_subjects_by_level(level.upper(), limit, offset)
    return RoomSubjectsResponse(**result)


@router.get("/word/{word_id}", response_model=WordDetails)
async def get_word_details(word_id: str):
  
    result = kg_service.get_word_details(word_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Word '{word_id}' not found in the knowledge graph"
        )
    return WordDetails(**result)


@router.get("/word/{word_id}/graph", response_model=WordGraphResponse)
async def get_word_graph(word_id: str):
  
    result = kg_service.get_word_as_graph(word_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Word '{word_id}' not found in the knowledge graph"
        )
    return WordGraphResponse(**result)


@router.get("/search")
async def search_words(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    level: Optional[str] = Query(default=None, description="Filter by CEFR level"),
    limit: int = Query(default=10, ge=1, le=50, description="Number of results")
):
  
    return {
        "query": q,
        "level": level,
        "results": [],
        "message": "Search functionality coming soon"
    }
