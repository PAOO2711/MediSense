"""
Utilidades para procesamiento de audio
"""
import tempfile
import os
import ffmpeg
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def convert_webm_to_wav(webm_data: bytes) -> str:
    """
    Convierte datos WebM a archivo WAV temporal
    
    Args:
        webm_data: Datos de audio en formato WebM
        
    Returns:
        str: Ruta al archivo WAV temporal
    """
    try:
        # Crear archivo temporal para WebM
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as webm_file:
            webm_file.write(webm_data)
            webm_path = webm_file.name
        
        # Crear archivo temporal para WAV
        wav_path = tempfile.mktemp(suffix='.wav')
        
        # Convertir WebM a WAV usando ffmpeg
        (
            ffmpeg
            .input(webm_path)
            .output(wav_path, acodec='pcm_s16le', ac=1, ar='16000')
            .overwrite_output()
            .run(quiet=True)
        )
        
        # Limpiar archivo WebM temporal
        os.unlink(webm_path)
        
        logger.info(f"✅ Audio convertido a WAV: {wav_path}")
        return wav_path
        
    except Exception as e:
        logger.error(f"❌ Error convirtiendo audio: {e}")
        # Limpiar archivos en caso de error
        if 'webm_path' in locals() and os.path.exists(webm_path):
            os.unlink(webm_path)
        if 'wav_path' in locals() and os.path.exists(wav_path):
            os.unlink(wav_path)
        raise

def cleanup_temp_file(file_path: str):
    """
    Limpia un archivo temporal de forma segura
    
    Args:
        file_path: Ruta al archivo a eliminar
    """
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
            logger.debug(f"🗑️ Archivo temporal eliminado: {file_path}")
    except Exception as e:
        logger.warning(f"⚠️ No se pudo eliminar archivo temporal {file_path}: {e}")
