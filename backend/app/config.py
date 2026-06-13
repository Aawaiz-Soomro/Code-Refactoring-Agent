import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    GOOGLE_API_KEY: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DATABASE_URL: str = ""
    
    MAX_LOOP_ITERATIONS: int = 3
    GEMINI_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "text-embedding-004"
    EMBEDDING_DIMENSIONS: int = 768
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: str = "*"

# Resolve .env path: try relative to this file first, then fall back to CWD.
# In Docker, env vars are injected by the runtime so missing .env is fine.
_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if not os.path.exists(_env_path):
    _env_path = None  # pydantic-settings will still read from os.environ

settings = Settings(_env_file=_env_path)
