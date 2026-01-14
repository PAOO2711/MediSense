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
    severidad: str = Field(description="Leve, Moderada, Severa")
    duracion_estimada: Optional[str] = Field(description="Tiempo que lleva el síntoma")
    descripcion: str = Field(description="Descripción detallada del síntoma")

class Suggestion(BaseModel):
    tipo: str = Field(description="Tipo de sugerencia: diagnóstico_posible, examen_recomendado, pregunta_adicional")
    contenido: str = Field(description="Contenido de la sugerencia")
    prioridad: str = Field(description="Alta, Media, Baja")
    justificacion: str = Field(description="Por qué se sugiere esto")

class MedicalAnalysis(BaseModel):
    resumen: str = Field(description="Resumen breve de la consulta")
    sintomas_identificados: List[Symptom] = Field(description="Síntomas mencionados por el paciente")
    sugerencias: List[Suggestion] = Field(description="Sugerencias para el médico")
    preguntas_adicionales: List[str] = Field(description="Preguntas que el médico debería hacer")
    nivel_urgencia: str = Field(description="Bajo, Medio, Alto, Urgente")
    notas_relevantes: List[str] = Field(description="Otras observaciones importantes")

class AnalysisRequest(BaseModel):
    transcription: str = Field(description="Texto transcrito de la consulta")
    patient_context: Optional[str] = Field(default=None, description="Contexto adicional del paciente")
