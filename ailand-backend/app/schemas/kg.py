from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class RoomStatusEnum(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class LevelInfo(BaseModel):
    level: str
    word_count: int


class LevelsResponse(BaseModel):
    levels: List[LevelInfo]


class Subject(BaseModel):
    id: str
    german: str
    english: str
    pos: str


class RoomSubjectsResponse(BaseModel):
    level: str
    limit: int
    offset: int
    subjects: List[Subject]


class WordDetails(BaseModel):
    id: str
    german: str
    ipa: Optional[str] = None
    level: str
    pos: str
    gender: Optional[str] = None
    translations: List[str]
    meanings_de: List[str]
    meanings_en: List[str]
    examples: List[str]


class GraphNode(BaseModel):
    id: str
    type: str  
    label: str
    data: Optional[Dict[str, Any]] = None


class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str


class Graph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class WordGraphResponse(BaseModel):
    word: WordDetails
    graph: Graph




class RoomInfo(BaseModel):
    room_id: str
    name: str
    description: str
    word_count: int
    status: RoomStatusEnum = RoomStatusEnum.NOT_STARTED
    is_unlocked: bool = True


class RoomDetailResponse(BaseModel):
    room_id: str
    name: str
    description: str
    level: str
    word_count: int
    status: RoomStatusEnum
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    words_learned: int = 0
    subjects: List[Subject]


class RoomsListResponse(BaseModel):
    rooms: List[RoomInfo]


class RoomProgressResponse(BaseModel):
    room_id: str
    status: RoomStatusEnum
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    words_learned: int = 0


class UserProgressResponse(BaseModel):
    total_rooms: int
    completed_rooms: int
    in_progress_rooms: int
    progress_summary: str 
    rooms: List[RoomProgressResponse]


class RoomActionResponse(BaseModel):
    message: str
    room_id: str
    status: RoomStatusEnum
    timestamp: datetime
