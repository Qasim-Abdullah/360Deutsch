from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 15
    
    DATABASE_URL: str = "postgresql://ailand_user:your_password@localhost:5432/ailand_db"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "qasimrana799@gmail.com"
    SMTP_PASSWORD: str = "juedjyvzpiayddix"
    EMAILS_FROM_EMAIL: str = "qasimrana799@gmail.com"
    EMAILS_FROM_NAME: str = "AILand"

    FRONTEND_URL: str = "http://localhost:3000"
    
    SPARQL_ENDPOINT: str = "http://localhost:7200/repositories/360Deutsch"
    
    class Config:
        env_file = ".env"

settings = Settings()
