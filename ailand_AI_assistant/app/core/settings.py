from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class API_Settings(BaseSettings):
    API_TITLE: str = "360 DEUTSCH AI Assistant"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "360 DEUTSCH AI Assistant API"
    PORT: int=8005
    HOST: str="127.0.0.1"
   
    CORS_ORIGINS: List[str] = ["*"]
    CORS_METHODS: List[str] = ["*"]
    CORS_HEADERS: List[str] = ["*"]
    ##AI Key Provider for the project
    GEMINI_API_KEY: str = ""
    OLLAMA_API_KEY: str = ""
    ## LLM MOdel

    GEMINI_MODEL: str = "gemini-3-flash-preview"
    #OLLAMA_MODEL: str = "llama3.2"
    OLLAMA_BASE_URL: str = "http://localhost:11434" # if use from local LLM i need it
    
    GRAPHDB_ENDPOINT: str = "http://localhost:7200/repositories/GRAPH_360_DEUTSCH"
    GRAPH_360_DEUTSCH: str = "" # Alias for the env var
    DBPEDIA_ENDPOINT: str = "https://dbpedia.org/sparql"
    LOG_LEVEL:str="INFO"
    DEMO_MODE: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
        

settings = API_Settings()
  
