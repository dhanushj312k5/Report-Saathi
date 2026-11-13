from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union, Optional
import os
import json
import shutil

def get_default_tesseract_path() -> str:
    from_env = os.getenv("TESSERACT_CMD")
    if from_env and os.path.exists(from_env):
        return from_env
    system_path = shutil.which("tesseract")
    if system_path:
        return system_path
    if os.path.exists("/opt/homebrew/bin/tesseract"):
        return "/opt/homebrew/bin/tesseract"
    return "/usr/bin/tesseract"

class Settings(BaseSettings):
    PROJECT_NAME: str = "ReportSaathi"
    API_V1_STR: str = "/api"
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ]
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # Gemini Configuration
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    
    # OCR Configuration
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", get_default_tesseract_path())
    
    # Supabase Configuration (Optional)
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY", "")

    # Telegram Bot Configuration (Optional)
    TELEGRAM_BOT_TOKEN: Optional[str] = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_DEFAULT_CHAT_ID: Optional[str] = os.getenv("TELEGRAM_DEFAULT_CHAT_ID", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
