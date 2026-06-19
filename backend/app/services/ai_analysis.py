"""
Servicio de análisis médico con IA usando LangChain + Groq
"""
from langchain_core.prompts import ChatPromptTemplate
import logging

from app.models.groq import get_groq_components
from app.models.gemini import get_gemini_components
from app.models.schemas import MedicalAnalysis
from app.rag.embeddings import EmbeddingsService
from langchain_core.documents import Document
from app.prompts.system_prompts import SYSTEM_PROMPT_MEDICAL_ANALYSIS
from app.prompts.user_prompts import USER_PROMPT_MEDICAL_ANALYSIS, USER_RAG_PROMPT

logger = logging.getLogger(__name__)

MAX_TRANSCRIPTION_CHARS = 5000
MAX_RAG_CASES = 4
MAX_RAG_CASE_CHARS = 800
MAX_CONTEXT_SECTION_CHARS = 1400

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
            
            # Inicializar componentes del modelo (LLM + parser estructurado)
            components = get_gemini_components()
            self.llm = components["llm"]
            self.parser = components.get("parser")
            
            # Crear el prompt template
            system_prompt = SYSTEM_PROMPT_MEDICAL_ANALYSIS
            user_prompt = USER_PROMPT_MEDICAL_ANALYSIS

            if not self.parser:
                system_prompt = system_prompt.replace("{format_instructions}", "")

            self.prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("user", user_prompt)
            ])
            
            # Crear la cadena: si no hay parser, usar solo prompt + llm
            if self.parser:
                self.chain = self.prompt | self.llm | self.parser
            else:
                self.chain = self.prompt | self.llm
            
            logger.info("✅ Servicio de análisis médico inicializado")
            
        except Exception as e:
            logger.error(f"❌ Error inicializando servicio de análisis: {e}")
            raise
    
    def analyze_transcription(
        self, 
        transcription: str,
        patient_id: str,
        patient_age: int | None = None,
        #patient_context: Optional[str] = None
    ) -> MedicalAnalysis:
        """
        Analiza una transcripción médica y genera sugerencias
        
        Args:
            transcription: Texto transcrito de la consulta
            patient_id: ID del paciente para contexto adicional
            
        Returns:
            MedicalAnalysis: Análisis estructurado de la consulta
        """
        if not self.chain:
            raise RuntimeError("Servicio no inicializado correctamente")
        
        try:
            logger.info(f"🔍 Analizando transcripción ({len(transcription)} caracteres)...")
            
            # Preparar el contexto
            context_section = ""

            if len(transcription) > MAX_TRANSCRIPTION_CHARS:
                transcription = transcription[:MAX_TRANSCRIPTION_CHARS]
                logger.info(
                    "✂️ Transcripción recortada a %s caracteres para reducir latencia",
                    MAX_TRANSCRIPTION_CHARS,
                )

            query = USER_RAG_PROMPT

            # Recuperar contexto del paciente usando embeddings
            patient_context = self.embeddings_service.retrieve_similar_cases(
                query=query,
                top_k=MAX_RAG_CASES,
                patient_id=patient_id,
            )

            #logger.info(f"📚 Contexto recuperado: {len(patient_context)} casos similares encontrados para el paciente_id={patient_id}")
            logger.info(f"CONTEXTO RECUPERADO: {patient_context}")
            
            # Formatear contexto del paciente de forma legible
            if patient_context and len(patient_context) > 0:
                formatted_context = "\n\n".join([
                    f"Consulta previa:\n{case['content'][:MAX_RAG_CASE_CHARS]}" 
                    for case in patient_context
                ])
                if len(formatted_context) > MAX_CONTEXT_SECTION_CHARS:
                    formatted_context = formatted_context[:MAX_CONTEXT_SECTION_CHARS]
                context_section = f"\nCONTEXTO DEL PACIENTE (Consultas previas relevantes):\n{formatted_context}\n"
            else:
                context_section = "\nCONTEXTO DEL PACIENTE:\nPrimera consulta registrada. No hay historial previo disponible.\n"
            
            # Ejecutar el análisis
            chain_input = {
                "transcription": transcription,
                "patient_age": str(patient_age) if patient_age is not None else "No disponible",
                "context_section": context_section,
            }
            if self.parser:
                chain_input["format_instructions"] = self.parser.get_format_instructions()

            result = self.chain.invoke(chain_input)
            
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


    def generate_embeddings(self, page_content: str, metadata: dict):
        """Genera embeddings para un documento y los almacena en Supabase"""
        try:
            doc = Document(page_content=page_content, metadata=metadata)
            self.embeddings_service.create_embeddings(doc)
            logger.info("✅ Embeddings generados y almacenados correctamente")
        except Exception as e:
            logger.error(f"❌ Error generando embeddings: {e}")
            raise

# Instancia global del servicio
medical_analysis_service = MedicalAnalysisService()
