from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional

from app.schemas.learning import (
    WordStartRequest, WordCompleteRequest,
    LearnedWord, InProgressWord,
    LearnedWordsResponse, InProgressWordsResponse,
    WordActionResponse, WordLearningStats,
    LevelStats, DailyProgress, WordStatusEnum
)
from app.models.word_progress import WordProgress, WordStatus
from app.models.model import Model
from app.core.database import get_db
from app.utils.dependencies import get_current_user
from app.services.kg_service import kg_service
from app.services.progress_service import record_activity

router = APIRouter()

VALID_LEVELS = ["A1", "A2", "B1"]


def get_word_info(word_id: str) -> dict:
    
    try:
        details = kg_service.get_word_details(word_id)
        if details:
            return {
                "german": details.get("german"),
                "english": details.get("translations", [None])[0] if details.get("translations") else None,
                "pos": details.get("pos")
            }
    except Exception:
        pass
    return {"german": None, "english": None, "pos": None}


@router.get("/words/learned", response_model=LearnedWordsResponse)
async def get_learned_words(
    room_id: Optional[str] = Query(default=None, description="Filter by room/level"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
 
    query = db.query(WordProgress).filter(
        WordProgress.user_id == current_user.id,
        WordProgress.status == WordStatus.LEARNED.value
    )
    
    if room_id:
        if room_id.upper() not in VALID_LEVELS:
            raise HTTPException(status_code=400, detail=f"Invalid room_id. Valid: {VALID_LEVELS}")
        query = query.filter(WordProgress.room_id == room_id.upper())
    
    total = query.count()
    words_db = query.order_by(desc(WordProgress.completed_at)).offset(offset).limit(limit).all()
    
    words = []
    for w in words_db:
        info = get_word_info(w.word_id)
        words.append(LearnedWord(
            word_id=w.word_id,
            room_id=w.room_id,
            german=info["german"],
            english=info["english"],
            pos=info["pos"],
            started_at=w.started_at,
            completed_at=w.completed_at,
            review_count=w.review_count or 0
        ))
    
    return LearnedWordsResponse(total=total, words=words)


@router.get("/words/in-progress", response_model=InProgressWordsResponse)
async def get_in_progress_words(
    room_id: Optional[str] = Query(default=None, description="Filter by room/level"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
  
    query = db.query(WordProgress).filter(
        WordProgress.user_id == current_user.id,
        WordProgress.status == WordStatus.IN_PROGRESS.value
    )
    
    if room_id:
        if room_id.upper() not in VALID_LEVELS:
            raise HTTPException(status_code=400, detail=f"Invalid room_id. Valid: {VALID_LEVELS}")
        query = query.filter(WordProgress.room_id == room_id.upper())
    
    total = query.count()
    words_db = query.order_by(desc(WordProgress.started_at)).offset(offset).limit(limit).all()
    
    words = []
    for w in words_db:
        info = get_word_info(w.word_id)
        words.append(InProgressWord(
            word_id=w.word_id,
            room_id=w.room_id,
            german=info["german"],
            english=info["english"],
            pos=info["pos"],
            started_at=w.started_at,
            review_count=w.review_count or 0,
            last_reviewed_at=w.last_reviewed_at
        ))
    
    return InProgressWordsResponse(total=total, words=words)


@router.post("/words/start", response_model=WordActionResponse)
async def start_word(
    request: WordStartRequest,
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    word_id = request.word_id
    room_id = request.room_id.upper()
    
    if room_id not in VALID_LEVELS:
        raise HTTPException(status_code=400, detail=f"Invalid room_id. Valid: {VALID_LEVELS}")
    
    
    word_details = kg_service.get_word_details(word_id)
    if not word_details:
        raise HTTPException(
            status_code=404,
            detail=f"Word '{word_id}' not found in Knowledge Graph"
        )
    
    
    if word_details.get("level") != room_id:
        raise HTTPException(
            status_code=400,
            detail=f"Word '{word_id}' belongs to level {word_details.get('level')}, not {room_id}"
        )
    
    existing = db.query(WordProgress).filter(
        WordProgress.user_id == current_user.id,
        WordProgress.word_id == word_id
    ).first()
    
    now = datetime.utcnow()
    
    if existing:
        if existing.status == WordStatus.LEARNED.value:
            return WordActionResponse(
                message=f"Word '{word_id}' is already learned",
                word_id=word_id,
                status=WordStatusEnum.LEARNED,
                timestamp=existing.completed_at or now
            )
        elif existing.status == WordStatus.IN_PROGRESS.value:
            
            existing.review_count = (existing.review_count or 0) + 1
            existing.last_reviewed_at = now
            db.commit()
            return WordActionResponse(
                message=f"Word '{word_id}' is already in progress (review count updated)",
                word_id=word_id,
                status=WordStatusEnum.IN_PROGRESS,
                timestamp=existing.started_at
            )
    

    word_progress = WordProgress(
        user_id=current_user.id,
        word_id=word_id,
        room_id=room_id,
        status=WordStatus.IN_PROGRESS.value,
        started_at=now,
        review_count=1,
        last_reviewed_at=now
    )
    db.add(word_progress)
    
    activity = record_activity(db, current_user.id, "word_started", word_id)
    
    db.commit()
    
    msg = f"Word '{word_id}' started (+{activity['points_earned']} pts"
    if activity['streak_bonus'] > 0:
        msg += f", +{activity['streak_bonus']} streak bonus"
    msg += f", streak: {activity['current_streak']})"
    
    return WordActionResponse(
        message=msg,
        word_id=word_id,
        status=WordStatusEnum.IN_PROGRESS,
        timestamp=now
    )


@router.post("/words/complete", response_model=WordActionResponse)
async def complete_word(
    request: WordCompleteRequest,
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    word_id = request.word_id
    

    word_progress = db.query(WordProgress).filter(
        WordProgress.user_id == current_user.id,
        WordProgress.word_id == word_id
    ).first()
    
    if not word_progress:
        raise HTTPException(
            status_code=400,
            detail=f"Word '{word_id}' has not been started yet. Start it first."
        )
    
    if word_progress.status == WordStatus.LEARNED.value:
        return WordActionResponse(
            message=f"Word '{word_id}' is already marked as learned",
            word_id=word_id,
            status=WordStatusEnum.LEARNED,
            timestamp=word_progress.completed_at
        )
    
    now = datetime.utcnow()
    word_progress.status = WordStatus.LEARNED.value
    word_progress.completed_at = now
    word_progress.review_count = (word_progress.review_count or 0) + 1
    word_progress.last_reviewed_at = now
    
    
    activity = record_activity(db, current_user.id, "word_learned", word_id)
    
    db.commit()
    
    msg = f"Word '{word_id}' learned (+{activity['points_earned']} pts"
    if activity['streak_bonus'] > 0:
        msg += f", +{activity['streak_bonus']} streak bonus"
    msg += f", streak: {activity['current_streak']})"
    
    return WordActionResponse(
        message=msg,
        word_id=word_id,
        status=WordStatusEnum.LEARNED,
        timestamp=now
    )


@router.get("/words/stats", response_model=WordLearningStats)
async def get_learning_stats(
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    
    all_progress = db.query(WordProgress).filter(
        WordProgress.user_id == current_user.id
    ).all()
    
   
    total_learned = sum(1 for p in all_progress if p.status == WordStatus.LEARNED.value)
    total_in_progress = sum(1 for p in all_progress if p.status == WordStatus.IN_PROGRESS.value)
    total_reviews = sum(p.review_count or 0 for p in all_progress)
    
    
    level_word_counts = {}
    try:
        levels = kg_service.get_levels()
        level_word_counts = {l["level"]: l["word_count"] for l in levels}
    except Exception:
        pass
    
    
    level_stats = []
    max_percentage = 0
    min_percentage = 100
    strongest = None
    weakest = None
    
    for level in VALID_LEVELS:
        total_in_level = level_word_counts.get(level, 0)
        learned_in_level = sum(1 for p in all_progress if p.room_id == level and p.status == WordStatus.LEARNED.value)
        in_progress_in_level = sum(1 for p in all_progress if p.room_id == level and p.status == WordStatus.IN_PROGRESS.value)
        not_started = max(0, total_in_level - learned_in_level - in_progress_in_level)
        
        percentage = (learned_in_level / total_in_level * 100) if total_in_level > 0 else 0
        
        if learned_in_level > 0:
            if percentage > max_percentage:
                max_percentage = percentage
                strongest = level
            if percentage < min_percentage:
                min_percentage = percentage
                weakest = level
        
        level_stats.append(LevelStats(
            level=level,
            total_words=total_in_level,
            learned=learned_in_level,
            in_progress=in_progress_in_level,
            not_started=not_started,
            progress_percentage=round(percentage, 1)
        ))
    
   
    daily_progress = []
    today = datetime.utcnow().date()
    
    def get_date_from_datetime(dt):
        
        if dt is None:
            return None
        try:
            
            if hasattr(dt, 'date'):
                return dt.date()
            return dt
        except Exception:
            return None
    
    for i in range(30):
        target_date = today - timedelta(days=i)
        
        words_learned = sum(
            1 for p in all_progress
            if p.completed_at and get_date_from_datetime(p.completed_at) == target_date
        )
        words_started = sum(
            1 for p in all_progress
            if p.started_at and get_date_from_datetime(p.started_at) == target_date
        )
        
        daily_progress.append(DailyProgress(
            date=target_date.isoformat(),
            words_learned=words_learned,
            words_started=words_started
        ))
    
    
    daily_progress.reverse()
    
 
    streak = 0
    for i in range(30):
        target_date = today - timedelta(days=i)
        
        activity = any(
            (p.started_at and get_date_from_datetime(p.started_at) == target_date) or
            (p.completed_at and get_date_from_datetime(p.completed_at) == target_date)
            for p in all_progress
        )
        
        if activity:
            streak += 1
        else:
            break
    
    
    days_with_activity = sum(1 for d in daily_progress if d.words_learned > 0 or d.words_started > 0)
    avg_words = total_learned / max(days_with_activity, 1)
    
    return WordLearningStats(
        total_words_learned=total_learned,
        total_words_in_progress=total_in_progress,
        total_review_count=total_reviews,
        learning_streak_days=streak,
        avg_words_per_day=round(avg_words, 1),
        by_level=level_stats,
        daily_progress=daily_progress,
        strongest_level=strongest,
        weakest_level=weakest
    )
