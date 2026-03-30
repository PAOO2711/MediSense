"""
Configuración centralizada de la aplicación
"""
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Settings:
    # API Keys
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
    SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

    # Better Auth JWT/JWKS
    BETTER_AUTH_BASE_URL = os.getenv("BETTER_AUTH_BASE_URL", os.getenv("FRONTEND_DEV_URL", "http://localhost:3000"))
    BETTER_AUTH_ISSUER = os.getenv("BETTER_AUTH_ISSUER", BETTER_AUTH_BASE_URL)
    BETTER_AUTH_AUDIENCE = os.getenv("BETTER_AUTH_AUDIENCE", BETTER_AUTH_BASE_URL)
    
    # Modelo Groq
    GROQ_MODEL = "llama-3.3-70b-versatile"
    GROQ_TEMPERATURE = 0.3  # Más bajo para diagnósticos médicos

    # Modelo Gemini
    GEMINI_MODEL = "gemini-2.5-flash"
    GEMINI_TEMPERATURE = 0.3  # Más bajo para diagnósticos médicos
    
    # Modelo Whisper
    WHISPER_MODEL = "small"
    WHISPER_DEVICE = "cpu"
    WHISPER_COMPUTE_TYPE = "int8"
    
    # Transcripción
    TRANSCRIPTION_LANGUAGE = "es"
    TRANSCRIPTION_BEAM_SIZE = 5
    TRANSCRIPTION_TEMPERATURE = 0.2
    
    # CORS
    CORS_ORIGINS = ["*"]
    
    # Logging
    LOG_LEVEL = "INFO"

settings = Settings()
