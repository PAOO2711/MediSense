"""
Servicio de transcripción de audio usando Faster Whisper
"""
from faster_whisper import WhisperModel
import logging
import tempfile
from pathlib import Path
from typing import Dict

from app.config.settings import settings
from app.utils.audio import convert_webm_to_wav, cleanup_temp_file

logger = logging.getLogger(__name__)

class TranscriptionService:
    """Servicio para transcribir audio a texto"""
    
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Carga el modelo Whisper de forma segura"""
        try:
            logger.info("🔄 Cargando modelo Whisper...")
            self.model = WhisperModel(
                settings.WHISPER_MODEL,
                device=settings.WHISPER_DEVICE,
                compute_type=settings.WHISPER_COMPUTE_TYPE
            )
            logger.info(f"✅ Modelo Whisper '{settings.WHISPER_MODEL}' cargado exitosamente")
        except Exception as e:
            logger.error(f"❌ Error cargando modelo: {e}")
            raise
    
    def transcribe_file(self, audio_data: bytes, filename: str) -> Dict:
        """
        Transcribe un archivo de audio
        
        Args:
            audio_data: Datos del archivo de audio
            filename: Nombre del archivo
            
        Returns:
            Dict con el resultado de la transcripción
        """
        if not self.model:
            raise RuntimeError("Modelo no disponible")
        
        wav_path = None
        try:
            logger.info(f"📁 Procesando archivo: {filename}, {len(audio_data)} bytes")
            
            # Convertir a WAV si es necesario
            if filename.endswith('.webm') or 'webm' in filename.lower():
                wav_path = convert_webm_to_wav(audio_data)
            else:
                # Guardar archivo temporal para otros formatos
                with tempfile.NamedTemporaryFile(
                    suffix=Path(filename).suffix, 
                    delete=False
                ) as temp_file:
                    temp_file.write(audio_data)
                    wav_path = temp_file.name
            
            if not wav_path:
                raise ValueError("Error procesando archivo de audio")
            
            # Transcribir
            segments, info = self.model.transcribe(
                wav_path,
                language=settings.TRANSCRIPTION_LANGUAGE,
                beam_size=settings.TRANSCRIPTION_BEAM_SIZE,
                temperature=settings.TRANSCRIPTION_TEMPERATURE,
                word_timestamps=True,
                vad_filter=True
            )
            
            # Procesar resultado
            full_transcription = ""
            for segment in segments:
                segment_text = segment.text.strip()
                full_transcription += segment_text + " "
            
            logger.info(f"✅ Transcripción completada: {len(full_transcription)} caracteres")
            
            return {
                "success": True,
                "full_text": full_transcription.strip(),
                "duration": round(info.duration, 2),
                "language": info.language,
                "language_probability": round(info.language_probability, 2),
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"❌ Error transcribiendo archivo: {e}")
            raise
        finally:
            # Limpiar archivo temporal
            if wav_path:
                cleanup_temp_file(wav_path)

# Instancia global del servicio
transcription_service = TranscriptionService()
