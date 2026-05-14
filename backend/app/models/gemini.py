"""Inicialización del modelo Gemini para análisis médico."""

from langchain_google_genai import ChatGoogleGenerativeAI
from app.models.schemas import MedicalAnalysis
from app.config.settings import settings


def get_gemini_components() -> dict:
    """Devuelve el LLM de Gemini inicializado con la configuración del proyecto."""
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=settings.GEMINI_TEMPERATURE,
        google_api_key=settings.GOOGLE_API_KEY,
    ).with_structured_output(MedicalAnalysis)

    return {
        "llm": llm,
    }
