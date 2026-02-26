from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user import UserResponse
from app.models.model import Model
from app.utils.dependencies import get_current_user
from app.core.database import get_db
from app.api import users as users_api

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: Model = Depends(get_current_user)):
    
    return users_api.get_current_user_info(current_user)


@router.get("/{username}", response_model=UserResponse)
async def read_user(
    username: str,
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    return users_api.get_user_by_name(username, db)