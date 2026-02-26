from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.user import (
    UserCreate, UserResponse, TokenResponse,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest, MessageResponse
)
from app.models.model import Model
from app.utils.dependencies import get_current_user
from app.core.database import get_db
from app.api import auth as auth_api

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    
    return auth_api.register_user(user_data, db)


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    return auth_api.login_user(form_data.username, form_data.password, db)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    
    return auth_api.request_password_reset(request, db)


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    
    return auth_api.reset_user_password(request, db)


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_user: Model = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    return auth_api.change_user_password(request, current_user, db)
