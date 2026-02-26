from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.model import Model
from app.utils.dependencies import get_user_by_username


def get_current_user_info(current_user: Model) -> Model:

    return current_user


def get_user_by_name(username: str, db: Session) -> Model:
   
    user = get_user_by_username(db, username=username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
