"""
Modelos Pydantic para validación de datos
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class TranscriptionResponse(BaseModel):
    success: bool
    full_text: str
    duration: float
    language: str
    language_probability: float
    filename: str

class Symptom(BaseModel):
    nombre: str = Field(description="Nombre del síntoma")
    descripcion: str = Field(description="Descripción detallada del síntoma")

class Suggestion(BaseModel):
    tipo: str = Field(description="Tipo de sugerencia: symptom, condition, recommendation")
    contenido: str = Field(description="Contenido de la sugerencia")
    justificacion: str = Field(description="Por qué se sugiere esto")
    confianza: float = Field(description="Nivel de confianza en la sugerencia (0 a 1)")

class MedicalAnalysis(BaseModel):
    resumen: str = Field(description="Resumen breve de la consulta e informativo")
    sintomas_identificados: List[Symptom] = Field(description="Síntomas mencionados por el paciente")
    sugerencias: List[Suggestion] = Field(description="Sugerencias para el médico")

class AnalysisRequest(BaseModel):
    transcription: str = Field(description="Texto transcrito de la consulta")
    patient_context: Optional[str] = Field(default=None, description="Contexto adicional del paciente que incluye los antecedentes médicos activos")
