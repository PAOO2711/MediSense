"""
API principal de MediSense - Versión refactorizada
Sistema de transcripción y análisis médico con IA
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.config.settings import settings
from app.models.schemas import TranscriptionResponse, MedicalAnalysis, AnalysisRequest
from app.services.transcription import transcription_service
from app.services.ai_analysis import medical_analysis_service
from app.security.auth import get_current_user

# Configurar logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="MediSense API",
    description="Sistema de transcripción y análisis médico con IA",
    version="2.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    """Endpoint raíz con información del servicio"""
    return {
        "message": "🎙️ MediSense API - Sistema de transcripción y análisis médico",
        "version": "2.0.0",
        "status": "✅ Funcionando",
        "endpoints": {
            "transcripción": "/transcribe_file",
            "análisis": "/analyze",
            "transcripción + análisis": "/transcribe_and_analyze"
        }
    }

@app.post("/transcribe_file", response_model=TranscriptionResponse)
async def transcribe_uploaded_file(file: UploadFile = File(...)):
    """
    Transcribe un archivo de audio a texto
    
    Args:
        file: Archivo de audio (WebM, WAV, MP3, etc.)
        
    Returns:
        TranscriptionResponse: Resultado de la transcripción
    """
    try:
        # Leer el archivo
        audio_data = await file.read()
        
        # Transcribir
        result = transcription_service.transcribe_file(audio_data, file.filename)
        
        return TranscriptionResponse(**result)
        
    except Exception as e:
        logger.error(f"Error en transcripción: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze", response_model=MedicalAnalysis)
async def analyze_transcription(
    request: AnalysisRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Analiza una transcripción médica y genera sugerencias para el médico
    
    Args:
        request: Transcripción y contexto opcional del paciente
        
    Returns:
        MedicalAnalysis: Análisis estructurado con síntomas, sugerencias y recomendaciones
    """
    try:
        # Validar que hay transcripción
        if not request.transcription or len(request.transcription.strip()) < 10:
            raise HTTPException(
                status_code=400, 
                detail="La transcripción es demasiado corta o está vacía"
            )
        
        # Analizar
        analysis = medical_analysis_service.analyze_transcription(
            transcription=request.transcription,
            patient_id=request.patient_id
        )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en análisis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe_and_analyze")
async def transcribe_and_analyze(
    file: UploadFile = File(...),
    patient_id: int = Form(None)
    #patient_context: str = None
):
    """
    Endpoint combinado: transcribe un archivo y lo analiza automáticamente
    
    Args:
        file: Archivo de audio
        patient_context: Contexto opcional del paciente
        
    Returns:
        Dict con transcripción y análisis
    """
    try:
        # Leer y transcribir
        audio_data = await file.read()
        transcription_result = transcription_service.transcribe_file(
            audio_data, 
            file.filename
        )
        
        # Generar resumen rápido
        #quick_summary = medical_analysis_service.quick_summary(transcription_result["full_text"])
        
        # Analizar la transcripción
        analysis = medical_analysis_service.analyze_transcription(
            transcription=transcription_result["full_text"],
            patient_id=patient_id
            # Agreagar resumen
        )
        
        return {
            "transcription": transcription_result,
            "analysis": analysis.dict()
        }
        
    except Exception as e:
        logger.error(f"Error en transcripción y análisis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_embeddings")
async def generate_embeddings(
    page_content: str = Body(...),
    metadata: dict = Body(...),
):
    """
    Genera embeddings para un documento y los almacena en Supabase
    
    Args:
        page_content: Contenido del documento
        metadata: Metadatos asociados al documento (debe incluir patient_id)
    """
    try:
        medical_analysis_service.generate_embeddings(page_content, metadata)
        return {"success": True, "message": "Embeddings generados correctamente"}
    except Exception as e:
        logger.error(f"Error generando embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Verifica el estado de los servicios"""
    return {
        "status": "healthy",
        "services": {
            "transcription": transcription_service.model is not None,
            "ai_analysis": medical_analysis_service.llm is not None
        }
    }

# ==================== INICIALIZACIÓN ====================

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Iniciando MediSense API...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
