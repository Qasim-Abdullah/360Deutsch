from pydantic import BaseModel, field_validator, HttpUrl
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class ThemeMode(str, Enum):
    LIGHT = "light"
    DARK = "dark"


class PlanType(str, Enum):
    FREE = "free"
    PRO = "pro"


class ProgressInfo(BaseModel):
    rooms_unlocked: int
    current_room: int
    total_rooms: int = 4


class UserInfoResponse(BaseModel):
    id: int
    username: str
    display_name: str
    email: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    daily_streak: int
    total_points: int
    theme: str
    plan_id: str
    progress: ProgressInfo

    class Config:
        from_attributes = True


class UserInfoUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    theme: Optional[ThemeMode] = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v):
        if v is not None:
            if len(v) < 3:
                raise ValueError("Username must be at least 3 characters")
            if len(v) > 50:
                raise ValueError("Username must be at most 50 characters")
        return v

    @field_validator("bio")
    @classmethod
    def validate_bio(cls, v):
        if v is not None and len(v) > 500:
            raise ValueError("Bio must be at most 500 characters")
        return v

    @field_validator("avatar_url")
    @classmethod
    def validate_avatar_url(cls, v):
        if v is not None and len(v) > 500:
            raise ValueError("Avatar URL must be at most 500 characters")
        return v


class AvatarUploadResponse(BaseModel):
    message: str
    avatar_url: str
