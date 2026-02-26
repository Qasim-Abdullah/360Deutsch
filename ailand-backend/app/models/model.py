from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class ThemeMode(str, enum.Enum):
    LIGHT = "light"
    DARK = "dark"


class PlanType(str, enum.Enum):
    FREE = "free"
    PRO = "pro"


DEFAULT_AVATAR_URL = "https://api.dicebear.com/7.x/avataaars/svg?seed=default"


class Model(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    bio = Column(String(500), nullable=True, default=None)
    avatar_url = Column(String(500), nullable=True, default=DEFAULT_AVATAR_URL)
    role = Column(String(20), nullable=False, default=UserRole.USER.value)
    theme = Column(String(20), nullable=False, default=ThemeMode.LIGHT.value)
    plan_id = Column(String(20), nullable=False, default=PlanType.FREE.value)
