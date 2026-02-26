from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.routes import users, auth, kg, learning, progress, userinfo
from app.core.database import engine, Base
from app.models import Model, RoomProgress, WordProgress, UserProgress, PointsHistory  # Import all models


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AILand API",
    description="German Language Learning System with Knowledge Graph",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",           
    "http://localhost:3001",           
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,              
    allow_credentials=True,             
    allow_methods=["*"],               
    allow_headers=["*"],                
    expose_headers=["*"],              
)

uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/auth", tags=["Users"])
app.include_router(userinfo.router, prefix="/userinfo", tags=["User Info"])
app.include_router(kg.router, prefix="/kg", tags=["Knowledge Graph"])
app.include_router(learning.router, prefix="/learning", tags=["Learning Words"])
app.include_router(progress.router, prefix="/progress", tags=["Progress & Points"])