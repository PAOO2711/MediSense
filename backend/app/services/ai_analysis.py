"""
Servicio de análisis médico con IA usando LangChain + Groq
"""
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import logging
from typing import Optional

from app.config.settings import settings
from app.models.schemas import MedicalAnalysis
from embeddings import EmbeddingsService

logger = logging.getLogger(__name__)

""" document = Document(
    page_content="Hello, world!", metadata={"source": "https://example.com"}
) """

class MedicalAnalysisService:
    """Servicio para analizar transcripciones médicas con IA"""
    
    def __init__(self):
        self.llm = None
        self.parser = None
        self.chain = None
        self.embeddings_service = EmbeddingsService()
        self._initialize()
    
    def _initialize(self):
        """Inicializa el modelo LLM y el parser"""
        try:
            logger.info("🔄 Inicializando servicio de análisis médico...")
            
            # Inicializar LLM de Groq
            self.llm = ChatGroq(
                model_name=settings.GROQ_MODEL,
                temperature=settings.GROQ_TEMPERATURE,
                groq_api_key=settings.GROQ_API_KEY
            )
            
            # Configurar parser para obtener respuestas estructuradas
            self.parser = PydanticOutputParser(pydantic_object=MedicalAnalysis)
            
            # Crear el prompt template
            system_prompt = """Eres un asistente médico experto que analiza transcripciones de consultas médicas.
            Tu objetivo es ayudar al médico identificando síntomas y sugiriendo posibles diagnósticos.

            IMPORTANTE:
            - Sé preciso y objetivo
            - No hagas diagnósticos definitivos, solo sugerencias
            - Identifica todos los síntomas mencionados por el paciente
            - Considera el contexto cultural y lingüístico (español)
            - Prioriza la seguridad del paciente

            TIPOS DE SUGERENCIAS:
            - "symptom": Síntomas adicionales que el médico debería investigar o confirmar
            - "condition": Posibles condiciones médicas o diagnósticos diferenciales a considerar
            - "recommendation": Exámenes, pruebas, o acciones recomendadas (análisis, referencias, seguimiento)

            Asigna un nivel de confianza (0.0 a 1.0) a cada sugerencia basado en:
            - 0.7-1.0: Alta confianza (síntomas/condiciones claramente mencionados o típicos)
            - 0.4-0.6: Confianza media (posibilidad razonable, requiere más información)
            - 0.0-0.3: Baja confianza (considerar pero poco probable)

            {format_instructions}"""
            
            user_prompt = """Analiza la siguiente transcripción de una consulta médica:

            TRANSCRIPCIÓN:
            {transcription}

            {context_section}

            Proporciona un análisis estructurado que ayude al médico a:
            1. Generar un resumen breve e informativo de la consulta
            2. Identificar todos los síntomas mencionados por el paciente
            3. Sugerir síntomas adicionales a investigar (tipo: "symptom")
            4. Sugerir posibles condiciones médicas a considerar (tipo: "condition")
            5. Recomendar exámenes, pruebas o acciones (tipo: "recommendation")

            Sé claro, conciso y profesional. Proporciona justificaciones sólidas para cada sugerencia."""

            self.prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("user", user_prompt)
            ])
            
            # Crear la cadena
            self.chain = self.prompt | self.llm | self.parser
            
            logger.info("✅ Servicio de análisis médico inicializado")
            
        except Exception as e:
            logger.error(f"❌ Error inicializando servicio de análisis: {e}")
            raise
    
    def analyze_transcription(
        self, 
        transcription: str, 
        patient_context: Optional[str] = None
    ) -> MedicalAnalysis:
        """
        Analiza una transcripción médica y genera sugerencias
        
        Args:
            transcription: Texto transcrito de la consulta
            patient_context: Contexto adicional del paciente (historial, edad, etc.)
            
        Returns:
            MedicalAnalysis: Análisis estructurado de la consulta
        """
        if not self.chain:
            raise RuntimeError("Servicio no inicializado correctamente")
        
        try:
            logger.info(f"🔍 Analizando transcripción ({len(transcription)} caracteres)...")
            
            # Preparar el contexto
            context_section = ""
            if patient_context:
                context_section = f"\nCONTEXTO DEL PACIENTE:\n{patient_context}\n"
            
            # Ejecutar el análisis
            result = self.chain.invoke({
                "transcription": transcription,
                "context_section": context_section,
                "format_instructions": self.parser.get_format_instructions()
            })
            
            logger.info(f"✅ Análisis completado: {len(result.sintomas_identificados)} síntomas, "
                       f"{len(result.sugerencias)} sugerencias")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error analizando transcripción: {e}")
            raise
    
    def quick_summary(self, transcription: str) -> str:
        """
        Genera un resumen rápido sin estructura completa
        
        Args:
            transcription: Texto transcrito de la consulta
            
        Returns:
            str: Resumen breve de la consulta
        """
        try:
            logger.info("📝 Generando resumen rápido...")
            
            simple_prompt = ChatPromptTemplate.from_messages([
                ("system", "Eres un asistente médico. Resume brevemente la consulta en 2-3 oraciones."),
                ("user", "Transcripción: {text}")
            ])
            
            chain = simple_prompt | self.llm
            response = chain.invoke({"text": transcription})
            
            return response.content
            
        except Exception as e:
            logger.error(f"❌ Error generando resumen: {e}")
            raise

# Instancia global del servicio
medical_analysis_service = MedicalAnalysisService()
