from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "DocuVault API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://docuvault_admin:secure_vault_pass@localhost:5432/docuvault"
    
    # Security & Tokens
    SECRET_KEY: str = "docuvault_production_master_secret_key_change_in_env_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # Master Salt & AES settings
    PBKDF2_ROUNDS: int = 100000
    
    # Gemini AI
    GEMINI_API_KEY: str = ""
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
