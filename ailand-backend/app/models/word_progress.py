from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class WordStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    LEARNED = "learned"


class WordProgress(Base):
    __tablename__ = "word_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    word_id = Column(String, nullable=False, index=True) 
    room_id = Column(String, nullable=False) 
    status = Column(String, default=WordStatus.IN_PROGRESS.value)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    review_count = Column(Integer, default=0)
    last_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
