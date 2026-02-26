from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.settings import settings
from app.util.intent import UserIntentRouter, UserIntentRequestType
from app.api import kg
from app.services.chat_service import ChatService


app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
    allow_credentials=True,
)

class ChatRequest(BaseModel):
    client_id: Optional[str] = "default_client"
    user_id: Optional[str] = "default_user"
    user_level: Optional[str] = "A1"
    user_progress: Optional[Dict[str, Any]] = None
    message: str
    image: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    type: str  # success | error | info
    recommendation: Optional[Dict[str, Any]] = None
    debug: Optional[Dict[str, Any]] = None

@app.get("/health_check")
def health_check():
    return {
        "status": "ok",
        "service": settings.API_TITLE,
        "version": settings.API_VERSION,
        "provider": settings.GEMINI_MODEL,
        "host": settings.HOST,
        "port": settings.PORT,
    }

@app.post("/chat/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    try:
        response_data = await ChatService.process_message(
            request.client_id, 
            request.message, 
            request.image, 
            request.user_level,
            request.user_progress
        )
        return ChatResponse(**response_data)

    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
app.include_router(kg.router, prefix="/api/v1/kg", tags=["Knowledge Graph"])
   
 
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
