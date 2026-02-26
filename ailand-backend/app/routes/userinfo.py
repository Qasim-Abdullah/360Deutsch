from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.schemas.userinfo import UserInfoResponse, UserInfoUpdate, AvatarUploadResponse
from app.models.model import Model
from app.utils.dependencies import get_current_user
from app.core.database import get_db
from app.api import userinfo as userinfo_api

router = APIRouter()


@router.get("", response_model=UserInfoResponse)
async def get_user_info(
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
 
    return userinfo_api.get_user_info(current_user, db)


@router.put("", response_model=UserInfoResponse)
async def update_user_info(
    update_data: UserInfoUpdate,
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    return userinfo_api.update_user_info(update_data, current_user, db)


@router.post("/avatar", response_model=AvatarUploadResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    return await userinfo_api.upload_avatar(file, current_user, db)
