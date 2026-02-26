from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
import os
import uuid
from datetime import datetime, date, timedelta

from app.models.model import Model, DEFAULT_AVATAR_URL
from app.models.user_progress import UserProgress
from app.schemas.userinfo import (
    UserInfoResponse, UserInfoUpdate, ProgressInfo, AvatarUploadResponse
)
from app.utils.dependencies import get_user_by_username


UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "avatars")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def get_or_create_user_progress(db: Session, user_id: int) -> UserProgress:
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not progress:
        progress = UserProgress(user_id=user_id, total_points=0, current_streak=0, longest_streak=0)
        db.add(progress)
        db.commit()
        db.refresh(progress)
    return progress


def get_user_info(current_user: Model, db: Session) -> UserInfoResponse:
    user_progress = get_or_create_user_progress(db, current_user.id)
    
    rooms_completed = user_progress.game_levels_completed or 0
    current_room = rooms_completed + 1 if rooms_completed < 4 else 4
    
    progress_info = ProgressInfo(
        rooms_unlocked=rooms_completed,
        current_room=current_room,
        total_rooms=4
    )
    
    today = date.today()
    yesterday = today - timedelta(days=1)
    current_streak = user_progress.current_streak or 0
    
    if user_progress.last_activity_date:
        if user_progress.last_activity_date < yesterday:
            current_streak = 0
    else:
        current_streak = 0
    
    return UserInfoResponse(
        id=current_user.id,
        username=current_user.username,
        display_name=current_user.username,
        email=current_user.email,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url or DEFAULT_AVATAR_URL,
        role=current_user.role,
        daily_streak=current_streak,
        total_points=user_progress.total_points or 0,
        theme=current_user.theme,
        plan_id=current_user.plan_id,
        progress=progress_info
    )


def update_user_info(update_data: UserInfoUpdate, current_user: Model, db: Session) -> UserInfoResponse:
    if update_data.username is not None and update_data.username != current_user.username:
        existing = get_user_by_username(db, update_data.username)
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = update_data.username
    
    if update_data.bio is not None:
        current_user.bio = update_data.bio
    
    if update_data.avatar_url is not None:
        current_user.avatar_url = update_data.avatar_url
    
    if update_data.theme is not None:
        current_user.theme = update_data.theme.value
    
    db.commit()
    db.refresh(current_user)
    
    return get_user_info(current_user, db)


async def upload_avatar(file: UploadFile, current_user: Model, db: Session) -> AvatarUploadResponse:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    extension = file.filename.split(".")[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5MB"
        )
    
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{extension}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as f:
        f.write(content)
    
    avatar_url = f"/uploads/avatars/{filename}"
    current_user.avatar_url = avatar_url
    db.commit()
    
    return AvatarUploadResponse(
        message="Avatar uploaded successfully",
        avatar_url=avatar_url
    )
