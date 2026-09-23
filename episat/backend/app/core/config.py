from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
MODEL_STORAGE_PATH = BASE_DIR / "ml_models"

class Settings(BaseSettings):
    PROJECT_NAME: str = "EpiSat 2.0 — Early Warning System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "episat-production-secret-key-space-to-action-2026-super-secure"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR}/episat.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
        "*"
    ]

    # Data Provider mode
    DEMO_MODE: bool = True
    DATA_MODE: str = "demo"
    SATELLITE_API_KEY: Optional[str] = None
    WEATHER_API_KEY: Optional[str] = None
    GEE_PROJECT_ID: Optional[str] = None

    # GEE Service Account & NASA Earthdata Credentials
    GEE_SERVICE_ACCOUNT_EMAIL: Optional[str] = None
    GEE_SERVICE_ACCOUNT_KEY_PATH: Optional[str] = None
    GEE_GCP_PROJECT_ID: Optional[str] = None
    NASA_EARTHDATA_USERNAME: Optional[str] = None
    NASA_EARTHDATA_PASSWORD: Optional[str] = None

    # Redis Cache & Broker
    REDIS_URL: str = "redis://localhost:6379/0"

    # Paths
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR
    MODEL_STORAGE_PATH: Path = MODEL_STORAGE_PATH

    model_config = SettingsConfigDict(env_file=(".env", "../.env"), case_sensitive=True, extra="ignore")

settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.MODEL_STORAGE_PATH.mkdir(parents=True, exist_ok=True)
