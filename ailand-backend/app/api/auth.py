from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.schemas.user import (
    UserCreate, TokenResponse, UserInToken,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest, MessageResponse
)
from app.models.model import Model
from app.utils.security import (
    verify_password, get_password_hash, create_access_token,
    create_password_reset_token, verify_password_reset_token
)
from app.utils.dependencies import get_user_by_username, get_user_by_email
from app.utils.email import send_password_reset_email
from app.core.config import settings


def register_user(user_data: UserCreate, db: Session) -> Model:
    
    existing_user = get_user_by_username(db, username=user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = get_user_by_email(db, email=user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    new_user = Model(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


def login_user(username_or_email: str, password: str, db: Session) -> TokenResponse:
    
    user = get_user_by_username(db, username=username_or_email)
    if not user:
        user = get_user_by_email(db, email=username_or_email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    refresh_token_expires = timedelta(days=1)
    refresh_token = create_access_token(
        data={"sub": user.username, "type": "refresh"},
        expires_delta=refresh_token_expires
    )
    
    user_data = UserInToken(
        id=user.id,
        username=user.username, 
        email=user.email,
        role=user.role,
        plan_id=user.plan_id
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        user=user_data
    )


def request_password_reset(request: ForgotPasswordRequest, db: Session) -> MessageResponse:
    
    user = get_user_by_email(db, email=request.email)
    
    if not user:
        return MessageResponse(message="If the email exists, a password reset link has been sent")
    
    reset_token = create_password_reset_token(request.email)
    
    email_sent = send_password_reset_email(request.email, reset_token)
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset email"
        )
    
    return MessageResponse(message="If the email exists, a password reset link has been sent")


def reset_user_password(request: ResetPasswordRequest, db: Session) -> MessageResponse:
    
    email = verify_password_reset_token(request.token)
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    user = get_user_by_email(db, email=email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    return MessageResponse(message="Password has been reset successfully")


def change_user_password(request: ChangePasswordRequest, current_user: Model, db: Session) -> MessageResponse:
    
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    return MessageResponse(message="Password has been changed successfully")
