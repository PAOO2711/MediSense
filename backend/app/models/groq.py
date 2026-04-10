"""Inicialización del modelo Groq para análisis médico."""

from langchain_groq import ChatGroq
from langchain_core.output_parsers import PydanticOutputParser

from app.config.settings import settings
from app.models.schemas import MedicalAnalysis


def get_groq_components() -> dict:
    """Devuelve el LLM de Groq y su parser estructurado para análisis médico."""
    llm = ChatGroq(
        model_name=settings.GROQ_MODEL,
        temperature=settings.GROQ_TEMPERATURE,
        groq_api_key=settings.GROQ_API_KEY,
    )

    parser = PydanticOutputParser(pydantic_object=MedicalAnalysis)

    return {
        "llm": llm,
        "parser": parser,
    }
